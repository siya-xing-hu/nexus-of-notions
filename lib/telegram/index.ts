import { TelegramAuth } from "./auth";
import { TelegramClient } from "./client";
import { TelegramService } from "./service";
export type { TelegramMessage } from "./service";

export class Telegram {
  private static instance: Telegram | null = null;
  private client: TelegramClient;
  private auth: TelegramAuth;
  private service: TelegramService;

  constructor() {
    this.client = new TelegramClient();
    this.auth = new TelegramAuth(this.client);
    this.client.setAuth(this.auth);
    this.service = new TelegramService(this.client);
  }

  // 获取单例实例
  private static getInstance(): Telegram {
    if (!Telegram.instance) {
      Telegram.instance = new Telegram();
    }
    return Telegram.instance;
  }

  static getAuth(): TelegramAuth {
    return Telegram.getInstance().auth;
  }

  static getService(): TelegramService {
    return Telegram.getInstance().service;
  }
}
