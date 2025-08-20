import { H3Event } from "h3";
// 统一 API 聚合入口
import { userApi } from "./client/user";
import { weightApi } from "./client/weight";
import { gameApi } from "./client/game";
import { telegramApi, telegramChannelApi } from "./client/telegram";

export const api = {
  user: userApi,
  weight: weightApi,
  game: gameApi,
  telegram: telegramApi,
  telegramChannel: telegramChannelApi,
};

export type ApiClient = typeof api;

export default api;

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface ReqObj {
  type?: string;
  data: any;
}

export interface ErrorObj {
  errorCode: number;
  message: string;
}

export interface RespObj<T> {
  data: T;
}

export interface RespListObj<T> {
  data: T[];
}

export interface Resp<T> {
  success: boolean;
  result: RespObj<T> | RespListObj<T> | null;
  error: ErrorObj | null;
}

/**
 * 生成标准API响应
 * @param {Object} event - 事件对象，用于访问响应
 * @param {Object} data - 返回的数据
 * @param {number} [status=200] - HTTP状态码，默认200
 */
export function response<T>(
  event: H3Event,
  data: RespObj<T> | RespListObj<T> | null,
  error: ErrorObj | null = null,
  status: number = 200,
): Resp<T> {
  event.node.res.statusCode = status;

  // 根据状态码区分成功或错误响应
  if (status >= 200 && status < 300) {
    // 成功响应
    return { success: true, result: data, error: error };
  } else {
    // 错误响应
    return { success: false, result: data, error: error };
  }
}

// 全局错误显示函数
export function showGlobalError(message: string) {
  // 使用 Nuxt 的全局状态管理
  if (typeof window !== "undefined") {
    // 在客户端，通过事件总线或全局状态显示错误
    const event = new CustomEvent("show-error", {
      detail: { message },
    });
    window.dispatchEvent(event);
  }
}
