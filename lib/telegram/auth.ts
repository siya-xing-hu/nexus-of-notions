import { BusinessError } from "../exception";
import {
  deactivateTelegramSession,
  getActiveTelegramSessionByUserId,
  getTelegramSessionByUserIdAndPhone,
  writeTelegramSessionData,
} from "@/lib/db/service/telegram";
import { CustomStorage, TelegramClient } from "./client";

export interface AuthState {
  phoneNumber: string;
  phoneCodeHash?: string;
  isAuthenticated: boolean;
  needsTwoFactor: boolean;
  user: any;
}

// 数据库存储实现
class DatabaseStorage implements CustomStorage {
  private userId: string;
  private phoneNumber: string;

  constructor(userId: string, phoneNumber: string) {
    this.userId = userId;
    this.phoneNumber = phoneNumber;
  }

  async get(key: string): Promise<any> {
    const session = await getTelegramSessionByUserIdAndPhone(this.userId, this.phoneNumber);
    if (!session || !session.isActive) return null;
    const sessionData = (session.sessionData as any) || {};
    return sessionData[key] ?? null;
  }

  async set(key: string, value: any): Promise<void> {
    await writeTelegramSessionData(this.userId, this.phoneNumber, { [key]: value });
  }
}

export class TelegramAuth {
  private client: TelegramClient;
  private userId: string;
  private phoneNumber: string = "";
  private authState: AuthState | null = null;
  private storage: DatabaseStorage | null = null;

  constructor(client: TelegramClient, userId: string) {
    this.client = client;
    this.userId = userId;
  }

  // 尝试从现有会话恢复认证状态
  async tryRestoreSession(): Promise<
    { isAuthenticated: boolean; phoneNumber?: string }
  > {
    try {
      // 查找该用户的活跃会话
      const activeSession = await getActiveTelegramSessionByUserId(this.userId);

      if (!activeSession) {
        return { isAuthenticated: false };
      }

      await this.initializeMTProto(activeSession.phoneNumber);

      try {
        const authStatus = await this.checkAuthStatus();
        if (authStatus.isAuthenticated) {
          this.authState = {
            user: authStatus.user,
            phoneNumber: activeSession.phoneNumber,
            isAuthenticated: true,
            needsTwoFactor: false,
          };
          return authStatus;
        } else {
          // 会话无效，清理数据库记录
          await this.cleanSessionFromDatabase(activeSession.phoneNumber);
        }
      } catch (error: any) {
        console.error("从数据库恢复会话失败:", error);
        // 清理无效的数据库会话记录
        await this.cleanSessionFromDatabase(activeSession.phoneNumber);
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error("恢复会话失败:", error);
      return { isAuthenticated: false };
    }
  }

  // 初始化 MTProto 实例
  private async initializeMTProto(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
    this.storage = new DatabaseStorage(this.userId, phoneNumber);
    await this.client.initialize(this.storage);
  }

  // 开始认证流程
  async startAuth(phoneNumber: string): Promise<{ phoneCodeHash: string }> {
    if (!this.client.isInitialized() || this.phoneNumber !== phoneNumber) {
      await this.initializeMTProto(phoneNumber);
    }

    this.authState = {
      user: null,
      phoneNumber,
      isAuthenticated: false,
      needsTwoFactor: false,
    };

    try {
      const result = await this.client.call<any>("auth.sendCode", {
        phone_number: phoneNumber,
        settings: {
          _: "codeSettings",
        },
      });

      const { phone_code_hash } = result;

      this.authState.phoneCodeHash = phone_code_hash;
      return { phoneCodeHash: phone_code_hash };
    } catch (error: any) {
      console.error("发送验证码失败:", error);

      // 处理 AUTH_RESTART 错误
      if (error.error_message === "AUTH_RESTART") {
        console.log("检测到 AUTH_RESTART，清理现有会话并重试...");

        // 清理现有会话
        await this.cleanSessionFromDatabase(phoneNumber);

        // 重新初始化并重试
        await this.initializeMTProto(phoneNumber);

        const result = await this.client.call<any>("auth.sendCode", {
          phone_number: phoneNumber,
          settings: {
            _: "codeSettings",
          },
        });

        const { phone_code_hash } = result;
        this.authState.phoneCodeHash = phone_code_hash;
        return { phoneCodeHash: phone_code_hash };
      }

      throw error;
    }
  }

  // 提交验证码
  async submitCode(
    phoneCode: string,
  ): Promise<
    { success: boolean; needsTwoFactor?: boolean; authRestart?: boolean }
  > {
    if (!this.client.isInitialized() || !this.authState?.phoneCodeHash) {
      throw BusinessError.invalidRequest("请先调用 startAuth 方法");
    }

    try {
      await this.client.call("auth.signIn", {
        phone_number: this.authState.phoneNumber,
        phone_code_hash: this.authState.phoneCodeHash,
        phone_code: phoneCode,
      });

      this.authState.isAuthenticated = true;
      return { success: true };
    } catch (error: any) {
      if (error.error_message === "SESSION_PASSWORD_NEEDED") {
        console.log("提交验证码时检测到 SESSION_PASSWORD_NEEDED，需要两步验证");
        this.authState.needsTwoFactor = true;
        return { success: false, needsTwoFactor: true, authRestart: false };
      } else if (error.error_message === "AUTH_RESTART") {
        console.log("提交验证码时检测到 AUTH_RESTART，需要重新开始认证流程");
        return { success: false, needsTwoFactor: false, authRestart: true };
      } else {
        throw error;
      }
    }
  }

  // 提交两步验证密码
  async submitTwoFactorPassword(
    password: string,
  ): Promise<{ success: boolean }> {
    if (!this.client.isInitialized() || !this.authState?.needsTwoFactor) {
      throw new Error("两步验证未激活");
    }

    try {
      const passwordInfo = await this.client.call<any>(
        "account.getPassword",
        {},
      );
      const algo = passwordInfo.current_algo;

      if (!algo) {
        throw new Error("不支持的两步验证算法");
      }

      const { srp_id, A, M1 } = await this.client.getSRPParams({
        g: algo.g,
        p: Buffer.from(algo.p, "base64"),
        salt1: Buffer.from(passwordInfo.salt1, "base64"),
        salt2: Buffer.from(passwordInfo.salt2, "base64"),
        gB: Buffer.from(passwordInfo.srp_B!, "base64"),
        password: password,
      });

      await this.client.call("auth.checkPassword", {
        password: {
          _: "inputCheckPasswordSRP",
          srp_id,
          A,
          M1,
        },
      });

      this.authState.isAuthenticated = true;
      this.authState.needsTwoFactor = false;
      return { success: true };
    } catch (error) {
      console.error("两步验证失败:", error);
      throw error;
    }
  }

  // 检查认证状态
  async checkAuthStatus(): Promise<
    { isAuthenticated: boolean; phoneNumber?: string; user?: any }
  > {
    if (!this.client.isInitialized()) {
      return { isAuthenticated: false };
    }

    if (this.authState?.isAuthenticated) {
      return {
        isAuthenticated: true,
        phoneNumber: this.phoneNumber,
        user: this.authState.user,
      };
    }

    try {
      const currentUser = await this.client.call<any>("users.getUsers", {
        id: [{ _: "inputUserSelf" }],
      });
      return {
        isAuthenticated: true,
        phoneNumber: this.phoneNumber,
        user: currentUser[0],
      };
    } catch (error) {
      console.error("认证检查失败:", error);
      return { isAuthenticated: false };
    }
  }

  // 登出
  async logout(): Promise<void> {
    if (this.client.isInitialized()) {
      await this.client.call("auth.logOut", {});
    }

    // 清理数据库中的会话
    await this.cleanSessionFromDatabase(this.phoneNumber);
  }

  // 从数据库清理会话
  private async cleanSessionFromDatabase(phoneNumber: string): Promise<void> {
    try {
      await deactivateTelegramSession(this.userId, phoneNumber);
      console.log(`数据库中的会话已清理: ${this.userId} - ${phoneNumber}`);
    } catch (error) {
      console.error("清理数据库会话失败:", error);
    }

    this.client.cleanup();
    this.authState = null;
    this.phoneNumber = "";
    this.storage = null;
  }

  // 获取认证状态
  getAuthState(): AuthState | null {
    return this.authState;
  }
}
