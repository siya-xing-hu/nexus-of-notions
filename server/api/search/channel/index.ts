import { HttpMethod, Resp, RespListObj, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception";
import { defineAuthenticatedEventHandler } from "@/server/utils/auth";

export default defineAuthenticatedEventHandler(
  {
    allowSessionAuth: true, // 只允许 Session/Cookie 认证
    allowApiKeyAuth: false, // 不允许 API Key 认证
  },
  async (event) => {
    switch (event.method) {
      case HttpMethod.GET:
        return handleGet(event);
      default:
        const error = BusinessError.methodNotAllowed().toErrorObj();
        return response(event, null, error, error.errorCode);
    }
  },
);

async function handleGet(event: any): Promise<Resp<RespListObj<any>>> {
  const responseData: RespListObj<any> = {
    data: [
      {
        id: "1",
        name: "网盘资源讨论区",
      },
      {
        id: "2",
        name: "阿里云盘 投稿&搜索",
      },
    ],
  };
  return response(event, responseData, null);
}
