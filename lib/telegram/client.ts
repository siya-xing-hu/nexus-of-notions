import { TelegramAuth } from "./auth";

// 动态导入 MTProto，避免服务器端问题
let MTProto: any = null;

// 动态导入 MTProto，确保兼容性
const loadMTProto = async () => {
  if (MTProto) return MTProto;

  try {
    const pkg = await import("@mtproto/core");
    MTProto = pkg.MTProto || pkg.default;

    if (!MTProto) {
      throw new Error("MTProto 构造函数未找到");
    }

    return MTProto;
  } catch (error) {
    console.error("MTProto 导入失败:", error);
    throw new Error("MTProto 库未正确加载，请检查环境配置");
  }
};

// 数据库存储适配器
export interface CustomStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}

export class TelegramClient {
  private mtproto: any = null;
  private apiId: number;
  private apiHash: string;
  private _isInitialized = false;
  private auth: TelegramAuth | null = null;

  constructor() {
    const config = useRuntimeConfig();

    if (!config.telegramApiId || !config.telegramApiHash) {
      throw new Error("Missing required Telegram API environment variables");
    }

    this.apiId = parseInt(config.telegramApiId as string);
    this.apiHash = config.telegramApiHash as string;
  }

  setAuth(auth: TelegramAuth) {
    this.auth = auth;
  }

  // 初始化 MTProto 实例
  async initialize(storage: CustomStorage): Promise<void> {
    const MTProtoClass = await loadMTProto();

    // 使用数据库存储
    this.mtproto = new MTProtoClass({
      api_id: this.apiId,
      api_hash: this.apiHash,
      storageOptions: {
        instance: storage, // 使用数据库存储实例
      },
    });

    this._isInitialized = true;
  }

  // 解析 MIGRATE 错误中的 DC ID
  private getMigrateDcId(error: any): number | null {
    const message: string = error?.error_message || error?.message || "";
    const match = message.match(/_MIGRATE_(\d+)/);
    return match ? Number(match[1]) : null;
  }

  // 统一封装调用，自动处理 DC 迁移和会话过期
  async call<T>(method: string, params: any): Promise<T> {
    if (!this.mtproto) {
      throw new Error("MTProto 实例未初始化");
    }
    try {
      return await this.mtproto.call(method, params);
    } catch (error: any) {
      const dcId = this.getMigrateDcId(error);
      if (dcId) {
        if (typeof this.mtproto.setDefaultDc === "function") {
          await this.mtproto.setDefaultDc(dcId);
        }
        // 重试一次
        return await this.mtproto.call(method, params);
      }

      // 检查是否是会话过期相关的错误或跟认证相关的错误
      if (
        error.error_message === "SESSION_REVOKED" ||
        error.error_message === "SESSION_EXPIRED" ||
        error.error_message === "AUTH_KEY_UNREGISTERED" ||
        error.error_message === "AUTH_KEY_INVALID" ||
        error.error_message === "AUTH_KEY_DUPLICATED"
      ) {
        console.log("检测到会话过期，正在重置认证状态...");

        // 重置内存中的认证状态
        if (this.auth && this.auth.getAuthState() !== null) {
          this.auth.getAuthState()!.isAuthenticated = false;
        }

        throw error;
      }

      throw error;
    }
  }

  // 获取 SRP 参数（用于两步验证）
  async getSRPParams(params: any): Promise<any> {
    if (!this.mtproto) {
      throw new Error("MTProto 实例未初始化");
    }
    return await this.mtproto.crypto.getSRPParams(params);
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this._isInitialized;
  }

  // 清理资源
  cleanup(): void {
    this.mtproto = null;
    this._isInitialized = false;
  }
}
