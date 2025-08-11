import { defineEventHandler, getQuery, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { WeightHandler } from "@/lib/handler/WeightHandler";
import { BusinessError } from "@/lib/exception/BusinessError";
import { queryAllWeightRecords } from "@/lib/db";
import { DbWeightRecord } from "@/lib/db/types";
import { SystemError } from "@/lib/exception";

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case HttpMethod.POST:
      return handlePost(event);
    case HttpMethod.GET:
      return handleGet(event);
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

async function handleGet(event: any): Promise<Resp<DbWeightRecord[]>> {
  const query = getQuery(event);
  const userId = query.userId as string;

  if (!userId) {
    const error = BusinessError.required("用户ID是必需的").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  // 获取用户体重记录
  const records = await queryAllWeightRecords(userId);

  const data: RespObj<DbWeightRecord[]> = {
    data: records,
  };
  return response(event, data, null);
}
