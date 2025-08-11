import { HttpMethod, ReqObj, Resp } from "./index";

export interface RequestOptions<TBody = ReqObj, TQuery = Record<string, any>> {
  body?: TBody;
  query?: TQuery;
}

export async function request(
  url: string,
  method: HttpMethod,
  options: RequestOptions = {},
): Promise<any> {
  const { body, query } = options;

  const search = query
    ? "?" +
      new URLSearchParams(
        Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
          if (v === undefined || v === null) return acc;
          acc[k] = String(v);
          return acc;
        }, {}),
      ).toString()
    : "";

  try {
    const res = await $fetch<Resp<any>>(url + search, {
      method,
      body,
    });

    return res.result?.data;
  } catch (error: any) {
    if (error.data && error.data.error && error.data.error.message) {
      showGlobalError(error.data.error.message);
    } else {
      const errorMessage = error instanceof Error
        ? error.message
        : "网络请求失败";
      showGlobalError(errorMessage);
    }
    return null;
  }
}

// 全局错误显示函数
function showGlobalError(message: string) {
  // 使用 Nuxt 的全局状态管理
  if (typeof window !== "undefined") {
    // 在客户端，通过事件总线或全局状态显示错误
    const event = new CustomEvent("show-error", {
      detail: { message },
    });
    window.dispatchEvent(event);
  }
}
