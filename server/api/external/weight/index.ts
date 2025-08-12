import { defineEventHandler, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, response } from "@/lib/api";
import { WeightHandler } from "@/lib/handler/WeightHandler";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception";

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case HttpMethod.POST:
      return handlePost(event);
    default:
      const error = BusinessError.methodNotAllowed().toErrorObj();
      return response(event, null, error, error.errorCode);
  }
});

async function handlePost(event: any): Promise<Resp<any>> {
  const body: ReqObj = await readBody(event);
  const { weight, date, userId } = body.data;

  try {
    await WeightHandler.handleAddWeight(weight, date, userId);

    return response(event, null, null);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    // 处理其他类型的错误
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}
