import { TelegramAuth } from "./auth";
import { TelegramClient } from "./client";
import { TelegramService } from "./service";
import { BusinessError } from "../exception/BusinessError";
export type { TelegramMessage } from "./service";

export class Telegram {
  private static instances: Map<string, Telegram> = new Map();
  private client: TelegramClient;
  private auth: TelegramAuth;
  private service: TelegramService;

  constructor(userId: string) {
    this.client = new TelegramClient();
    this.auth = new TelegramAuth(this.client, userId);
    this.client.setAuth(this.auth);
    this.service = new TelegramService(this.client, userId);
  }

  // 获取用户实例
  private static getInstance(userId: string): Telegram {
    if (!Telegram.instances.has(userId)) {
      Telegram.instances.set(userId, new Telegram(userId));
    }
    return Telegram.instances.get(userId)!;
  }

  static getAuth(userId: string): TelegramAuth {
    return Telegram.getInstance(userId).auth;
  }

  static async getService(userId: string): Promise<TelegramService> {
    const instance = Telegram.getInstance(userId);
    
    // 检查认证状态
    const authStatus = await instance.auth.checkAuthStatus();
    if (!authStatus.isAuthenticated) {
      // 尝试恢复会话
      const restoreResult = await instance.auth.tryRestoreSession();
      if (!restoreResult.isAuthenticated) {
        throw BusinessError.unauthorized("请先完成 Telegram 认证");
      }
    }
    
    return instance.service;
  }

  // 清理用户实例
  static clearInstance(userId: string): void {
    Telegram.instances.delete(userId);
  }

  // 清理所有实例
  static clearAllInstances(): void {
    Telegram.instances.clear();
  }
}
