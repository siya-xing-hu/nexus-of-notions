import { BusinessError } from "../exception";

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

export interface TelegramMessage {
  id: number;
  date: string;
  text: string;
  rawText?: string;
  views?: number;
  from?: any;
  replyTo?: number | null;
  replyContent?: {
    id: number;
    text: string | null;
    fullText: string | null;
  } | null;
  links?: Array<{ text: string; url: string }>;
  hasReplies?: boolean;
  replyCount?: number;
}

export interface ChannelInfo {
  id: number;
  accessHash: string;
  title: string;
  username: string;
}

export interface AuthState {
  phoneNumber: string;
  phoneCodeHash?: string;
  isAuthenticated: boolean;
  needsTwoFactor: boolean;
}

// 内存存储，用于 Vercel 无服务器环境
const memoryStorage = new Map<string, any>();

export class TelegramService {
  private static instance: TelegramService | null = null;
  private mtproto: any = null;
  private apiId: number;
  private apiHash: string;
  private phoneNumber: string = "";
  private isInitialized = false;
  private authState: AuthState | null = null;

  constructor() {
    const config = useRuntimeConfig();

    if (!config.telegramApiId || !config.telegramApiHash) {
      throw new Error("Missing required Telegram API environment variables");
    }

    this.apiId = parseInt(config.telegramApiId as string);
    this.apiHash = config.telegramApiHash as string;
  }

  // 获取单例实例
  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  // 检查是否为 Vercel 环境
  private isVercelEnvironment(): boolean {
    return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  }

  // 尝试从现有会话恢复认证状态
  async tryRestoreSession(): Promise<
    { isAuthenticated: boolean; phoneNumber?: string }
  > {
    try {
      // 在 Vercel 环境中，无法持久化存储会话，直接返回未认证状态
      if (this.isVercelEnvironment()) {
        console.log("Vercel 环境：无法恢复会话，需要重新认证");
        return { isAuthenticated: false };
      }

      // 本地环境下的文件系统操作（保留原有逻辑）
      const fs = await import("fs");
      const sessionDir = "./sessions";

      if (!fs.existsSync(sessionDir)) {
        return { isAuthenticated: false };
      }

      const allFiles = fs.readdirSync(sessionDir);

      const sessionFiles = allFiles
        .filter((file: string) => file.startsWith("session.json"))
        .map((file: string) => {
          if (file.startsWith("session.json_")) {
            const phoneNumber = file.replace("session.json_", "");
            return phoneNumber;
          }
          return null;
        })
        .filter((phoneNumber): phoneNumber is string => phoneNumber !== null);

      if (sessionFiles.length === 0) {
        return { isAuthenticated: false };
      }

      const phoneNumber = sessionFiles[0];
      await this.initializeMTProto(phoneNumber);

      try {
        const authStatus = await this.checkAuthStatus();

        if (authStatus.isAuthenticated) {
          this.authState = {
            phoneNumber,
            isAuthenticated: true,
            needsTwoFactor: false,
          };
        } else {
          this.cleanSessionFile(phoneNumber);
        }

        return authStatus;
      } catch (error: any) {
        console.error("检查认证状态时出错:", error);
        if (
          error.error_message === "AUTH_RESTART" ||
          error.error_message === "AUTH_KEY_UNREGISTERED"
        ) {
          this.cleanSessionFile(phoneNumber);
          return { isAuthenticated: false };
        }
        throw error;
      }
    } catch (error) {
      console.error("恢复会话失败:", error);
      return { isAuthenticated: false };
    }
  }

  // 初始化 MTProto 实例
  private async initializeMTProto(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
    const sessionId = phoneNumber.replace(/[^0-9]/g, "");

    const MTProtoClass = await loadMTProto();

    if (this.isVercelEnvironment()) {
      // Vercel 环境：使用内存存储
      this.mtproto = new MTProtoClass({
        api_id: this.apiId,
        api_hash: this.apiHash,
        storageOptions: {
          path: `memory://${sessionId}`,
        },
      });
    } else {
      // 本地环境：使用文件存储
      const path = await import("path");
      const sessionPath = path.join("./sessions", `session.json_${sessionId}`);

      this.mtproto = new MTProtoClass({
        api_id: this.apiId,
        api_hash: this.apiHash,
        storageOptions: {
          path: sessionPath,
        },
      });
    }
    
    this.isInitialized = true;
  }

  // 解析 MIGRATE 错误中的 DC ID
  private getMigrateDcId(error: any): number | null {
    const message: string = error?.error_message || error?.message || "";
    const match = message.match(/_MIGRATE_(\d+)/);
    return match ? Number(match[1]) : null;
  }

  // 统一封装调用，自动处理 DC 迁移
  private async call<T>(method: string, params: any): Promise<T> {
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
      throw error;
    }
  }

  // 开始认证流程
  async startAuth(phoneNumber: string): Promise<{ phoneCodeHash: string }> {
    if (!this.isInitialized || this.phoneNumber !== phoneNumber) {
      await this.initializeMTProto(phoneNumber);
    }

    this.authState = {
      phoneNumber,
      isAuthenticated: false,
      needsTwoFactor: false,
    };

    try {
      const result = await this.call<any>("auth.sendCode", {
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

        // 清理现有会话文件
        await this.cleanSessionFile(phoneNumber);

        // 重新初始化并重试
        await this.initializeMTProto(phoneNumber);

        const result = await this.call<any>("auth.sendCode", {
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
    if (!this.mtproto || !this.authState?.phoneCodeHash) {
      throw BusinessError.invalidRequest("请先调用 startAuth 方法");
    }

    try {
      await this.call("auth.signIn", {
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
    if (!this.mtproto || !this.authState?.needsTwoFactor) {
      throw new Error("两步验证未激活");
    }

    try {
      const passwordInfo = await this.call<any>("account.getPassword", {});
      const algo = passwordInfo.current_algo;

      if (!algo) {
        throw new Error("不支持的两步验证算法");
      }

      const { srp_id, A, M1 } = await this.mtproto.crypto.getSRPParams({
        g: algo.g,
        p: Buffer.from(algo.p, "base64"),
        salt1: Buffer.from(passwordInfo.salt1, "base64"),
        salt2: Buffer.from(passwordInfo.salt2, "base64"),
        gB: Buffer.from(passwordInfo.srp_B!, "base64"),
        password: password,
      });

      await this.call("auth.checkPassword", {
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
    { isAuthenticated: boolean; phoneNumber?: string }
  > {
    if (!this.mtproto || !this.isInitialized) {
      return { isAuthenticated: false };
    }

    try {
      await this.call("users.getUsers", { id: [{ _: "inputUserSelf" }] });
      return { isAuthenticated: true, phoneNumber: this.phoneNumber };
    } catch (error) {
      console.error("认证检查失败:", error);
      return { isAuthenticated: false };
    }
  }

  // 获取频道信息
  async getChannelInfo(channelUsername: string): Promise<ChannelInfo> {
    if (!this.mtproto) {
      throw new Error("请先进行认证");
    }

    try {
      const cleanUsername = channelUsername.replace("@", "");
      console.log(`尝试解析频道用户名: ${cleanUsername}`);

      const resolvedPeer = await this.call<any>("contacts.resolveUsername", {
        username: cleanUsername,
      });

      // 找到频道信息
      const channel = resolvedPeer.chats?.find((chat: any) => {
        return chat.username === cleanUsername;
      });

      if (!channel) {
        // 提供更详细的错误信息
        const availableChats = resolvedPeer.chats?.map((chat: any) => ({
          type: chat._,
          username: chat.username,
          title: chat.title,
        })) || [];

        if (availableChats.length === 0) {
          throw BusinessError.invalidRequest(
            `频道 ${channelUsername} 不存在或无法访问。请检查频道用户名是否正确，或确认该频道是否为公开频道。`,
          );
        } else {
          throw BusinessError.invalidRequest(
            `频道 ${channelUsername} 未找到。可用的频道: ${
              availableChats.map((c: any) => `@${c.username}`).join(", ")
            }`,
          );
        }
      }

      return {
        id: channel.id,
        accessHash: channel.access_hash,
        title: channel.title,
        username: channel.username,
      };
    } catch (error: any) {
      console.error("获取频道信息失败:", error);

      // 如果是特定的 Telegram 错误，提供更友好的错误信息
      if (error.error_message) {
        switch (error.error_message) {
          case "USERNAME_NOT_OCCUPIED":
            throw BusinessError.invalidRequest(
              `频道 ${channelUsername} 不存在，请检查频道用户名是否正确`,
            );
          case "USERNAME_INVALID":
            throw BusinessError.invalidRequest(
              `频道用户名 ${channelUsername} 格式无效`,
            );
          case "CHANNEL_PRIVATE":
            throw BusinessError.invalidRequest(
              `频道 ${channelUsername} 是私有频道，需要先加入该频道`,
            );
          default:
            throw new Error(`获取频道信息失败: ${error.error_message}`);
        }
      }

      throw error;
    }
  }

  // 发送消息到频道
  async sendMessage(channelUsername: string, message: string): Promise<number> {
    if (!this.mtproto) {
      throw new Error("请先进行认证");
    }

    try {
      const channelInfo = await this.getChannelInfo(channelUsername);

      const result = await this.call<any>("messages.sendMessage", {
        peer: {
          _: "inputPeerChannel",
          channel_id: channelInfo.id,
          access_hash: channelInfo.accessHash,
        },
        message,
        random_id: Math.floor(Math.random() * 1000000000),
      });

      return result.id;
    } catch (error) {
      console.error("发送消息失败:", error);
      throw error;
    }
  }

  // 获取频道消息
  async getChannelMessages(
    channelUsername: string,
    limit: number = 10,
    offsetId: number = 0,
  ): Promise<TelegramMessage[]> {
    if (!this.mtproto) {
      throw new Error("请先进行认证");
    }

    try {
      const channelInfo = await this.getChannelInfo(channelUsername);

      const result = await this.call<any>("messages.getHistory", {
        peer: {
          _: "inputPeerChannel",
          channel_id: channelInfo.id,
          access_hash: channelInfo.accessHash,
        },
        limit,
        offset_id: offsetId,
        offset_date: 0,
        add_offset: 0,
        max_id: 0,
        min_id: 0,
        hash: 0,
      });

      // 创建消息ID到消息内容的映射
      const messageMap = new Map<number, any>();
      result.messages.forEach((msg: any) => {
        messageMap.set(msg.id, msg);
      });

      return result.messages.map((msg: any) => {
        // 处理消息文本和链接
        let processedText = msg.message;
        const links: Array<{ text: string; url: string }> = [];

        // 处理 entities 中的链接
        if (msg.entities && Array.isArray(msg.entities)) {
          // 按 offset 排序，从后往前处理，避免位置偏移
          const sortedEntities = [...msg.entities].sort((a, b) =>
            b.offset - a.offset
          );

          for (const entity of sortedEntities) {
            if (entity._ === "messageEntityTextUrl") {
              const linkText = msg.message.substring(
                entity.offset,
                entity.offset + entity.length,
              );
              links.push({
                text: linkText,
                url: entity.url,
              });

              // 在文本中标记链接位置
              const before = processedText.substring(0, entity.offset);
              const after = processedText.substring(
                entity.offset + entity.length,
              );
              processedText = before + `[${linkText}](${entity.url})` + after;
            } else if (entity._ === "messageEntityMention") {
              const mention = msg.message.substring(
                entity.offset,
                entity.offset + entity.length,
              );
              // 处理 @ 提及
              processedText = processedText.replace(mention, `**${mention}**`);
            } else if (entity._ === "messageEntityBotCommand") {
              const command = msg.message.substring(
                entity.offset,
                entity.offset + entity.length,
              );
              // 处理机器人命令
              processedText = processedText.replace(command, `\`${command}\``);
            }
          }
        }

        // 处理回复消息内容
        let replyContent = null;
        if (msg.reply_to?.reply_to_msg_id) {
          const replyMsg = messageMap.get(msg.reply_to.reply_to_msg_id);
          if (replyMsg) {
            // 截取回复消息的前50个字符作为预览
            const previewText = replyMsg.message.length > 50
              ? replyMsg.message.substring(0, 50) + "..."
              : replyMsg.message;
            replyContent = {
              id: replyMsg.id,
              text: previewText,
              fullText: replyMsg.message,
            };
          } else {
            // 如果找不到回复的消息，只显示ID
            replyContent = {
              id: msg.reply_to.reply_to_msg_id,
              text: null,
              fullText: null,
            };
          }
        }

        return {
          id: msg.id,
          date: new Date(msg.date * 1000).toISOString(),
          text: processedText,
          rawText: msg.message, // 保留原始文本
          views: msg.views,
          from: msg.from_id,
          replyTo: msg.reply_to?.reply_to_msg_id || null,
          replyContent: replyContent,
          links: links,
          hasReplies: msg.replies?.replies > 0 || false,
          replyCount: msg.replies?.replies || 0,
        };
      });
    } catch (error) {
      console.error("获取消息失败:", error);
      throw error;
    }
  }

  // 搜索并获取回复消息
  async searchAndGetReplies(
    channelUsername: string,
    searchQuery: string,
    waitTime: number = 5000,
  ): Promise<TelegramMessage[]> {
    if (!this.mtproto) {
      throw new Error("请先进行认证");
    }

    try {
      // 发送搜索消息
      const sentMessageId = await this.sendMessage(
        channelUsername,
        searchQuery,
      );
      console.log(`搜索消息已发送，ID: ${sentMessageId}`);

      // 等待一段时间让机器人处理
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      // 获取最新消息
      const messages = await this.getChannelMessages(channelUsername, 20);

      // 过滤出在发送消息之后的消息
      const replies = messages.filter((msg) => msg.id > sentMessageId);

      return replies;
    } catch (error) {
      console.error("搜索失败:", error);
      throw error;
    }
  }

  // 登出
  async logout(): Promise<void> {
    if (this.mtproto) {
      await this.call("auth.logOut", {});
    }

    // 清理会话文件
    await this.cleanSessionFile(this.phoneNumber);
  }

  // 清理会话文件
  private async cleanSessionFile(phoneNumber: string) {
    if (!this.isVercelEnvironment()) {
      // 本地环境：删除文件
      const fs = await import("fs");
      const path = await import("path");
      const sessionFile = path.join(
        "./sessions",
        `session.json_${phoneNumber}`,
      );
      if (fs.existsSync(sessionFile)) {
        fs.unlinkSync(sessionFile);
      }
    } else {
      // Vercel 环境：清理内存存储
      const sessionId = phoneNumber.replace(/[^0-9]/g, "");
      memoryStorage.delete(`session_${sessionId}`);
    }

    this.mtproto = null;
    this.isInitialized = false;
    this.authState = null;
    this.phoneNumber = "";
  }
}
