import { defineEventHandler, readBody } from "h3";

import { queryUserByEmail } from "@/lib/db";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api/index";
import { DbUser } from "@/lib/db/types";
import { BusinessError } from "@/lib/exception";

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case HttpMethod.POST:
      return handleLogin(event);
    default:
      const error = BusinessError.methodNotAllowed().toErrorObj();
      return response(event, null, error, error.errorCode);
  }
});

async function handleLogin(event: any): Promise<Resp<DbUser>> {
  const body: ReqObj = await readBody(event);
  const { email } = body.data;

  if (!email) {
    const error = BusinessError.required("邮箱是必需的").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  // 根据邮箱查找用户
  const user = await queryUserByEmail(email);
  if (!user) {
    const error = BusinessError.required("用户不存在，请先注册").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  const data: RespObj<DbUser> = {
    data: user,
  };
  return response(event, data, null);
}
