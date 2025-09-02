import { TelegramMessage } from "@/lib/telegram";
import { HttpMethod } from "../index";
import { request } from "../request";
import { DbTelegramChannel } from "@/lib/db/types";

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
    }) as Promise<
      { success: boolean; needsTwoFactor?: boolean; authRestart?: boolean }
    >,

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
    }) as Promise<DbTelegramChannel>,

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

  // 搜索用户和频道
  searchUsersAndChannels: (query: string) =>
    request("/api/telegram", HttpMethod.POST, {
      body: {
        type: "searchUsersAndChannels",
        data: {
          query,
        },
      },
    }) as Promise<
      Array<{
        id: number;
        access_hash: string;
        title: string;
        username: string;
        type: "CHANNEL" | "BOT" | "USER";
        first_name?: string;
        last_name?: string;
      }>
    >,
};

export type TelegramApi = typeof telegramApi;

// 频道管理 API
export const telegramChannelApi = {
  // 获取用户的频道列表
  getUserChannels: () =>
    request("/api/telegram/channels", HttpMethod.GET, {
      query: {},
    }) as Promise<DbTelegramChannel[]>,

  // 添加或更新频道
  addOrUpdateChannel: (channelInfo: DbTelegramChannel) =>
    request("/api/telegram/channels", HttpMethod.POST, {
      body: { data: { channelInfo } },
    }) as Promise<DbTelegramChannel>,

  // 删除频道
  deleteChannel: (id: string) =>
    request("/api/telegram/channels", HttpMethod.DELETE, {
      query: { id },
    }) as Promise<{ success: boolean }>,
};

export type TelegramChannelApi = typeof telegramChannelApi;
