import { HttpMethod, ReqObj, Resp, showGlobalError } from "./index";

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
    throw error;
  }
}
