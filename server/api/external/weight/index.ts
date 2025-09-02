import { defineAuthenticatedEventHandler } from "@/server/utils/auth";
import { HttpMethod, ReqObj, Resp, response } from "@/lib/api/index";
import { DbWeightRecord } from "@/lib/db/types";
import { BusinessError } from "@/lib/exception";
import { WeightHandler } from "@/lib/handler";

export default defineAuthenticatedEventHandler(
  {
    allowApiKeyAuth: true, // 只允许 API Key 认证
    allowSessionAuth: false, // 不允许 Session/Cookie 认证
  },
  async (event) => {
    // 认证已由 defineAuthenticatedEventHandler 处理
    // 我们可以安全地从上下文中获取用户信息
    const user = event.context.user;

    switch (event.method) {
      case HttpMethod.POST:
        return handleRequest(event, user.id);
      default:
        const error = BusinessError.methodNotAllowed().toErrorObj();
        return response(event, null, error, error.errorCode);
    }
  },
);

async function handleRequest(
  event: any,
  userId: string,
): Promise<Resp<null>> {
  const body: ReqObj = await readBody(event);
  const data = body.data as DbWeightRecord;

  // 使用认证后的 userId，而不是从请求体中获取
  await WeightHandler.handleAddWeight(data.weight, data.date, userId);

  return response(event, null, null);
}
