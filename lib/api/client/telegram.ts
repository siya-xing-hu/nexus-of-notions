import { ChannelInfo, TelegramMessage } from "@/lib/telegram/TelegramService";
import { HttpMethod } from "../index";
import { request } from "../request";

export const telegramApi = {
  // 认证相关方法
  startAuth: (phoneNumber: string) =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "startAuth",
        data: { phoneNumber },
      },
    }) as Promise<{ phoneCodeHash: string }>,

  submitCode: (phoneCode: string) =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "submitCode",
        data: { phoneCode },
      },
    }) as Promise<{ success: boolean; needsTwoFactor?: boolean; authRestart?: boolean }>,

  submitTwoFactor: (password: string) =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "submitTwoFactor",
        data: { password },
      },
    }) as Promise<{ success: boolean }>,

  checkAuth: () =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "checkAuth",
        data: {},
      },
    }) as Promise<{ isAuthenticated: boolean; phoneNumber?: string }>,

  logout: () =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "logout",
        data: {},
      },
    }) as Promise<{ success: boolean }>,

  // 获取频道消息
  getMessages: (channelUsername: string, limit?: number, offsetId?: number) =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "getMessages",
        data: {
          channelUsername,
          limit,
          offsetId,
        },
      },
    }) as Promise<TelegramMessage[]>,

  // 获取频道信息
  getChannelInfo: (channelUsername: string) =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "channelInfo",
        data: {
          channelUsername,
        },
      },
    }) as Promise<ChannelInfo>,

  // 发送消息到频道
  sendMessage: (channelUsername: string, message: string) =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "sendMessage",
        data: {
          channelUsername,
          message,
        },
      },
    }) as Promise<{ success: boolean }>,
};

export type TelegramApi = typeof telegramApi;
