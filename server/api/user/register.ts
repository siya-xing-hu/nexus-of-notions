import { defineEventHandler, readBody } from "h3";

import { createOrGetUser, queryUserByEmail } from "@/lib/db";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api/index";
import { DbUser } from "@/lib/db/types";
import { BusinessError } from "@/lib/exception";

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case HttpMethod.POST:
      return handleRegister(event);
    default:
      const error = BusinessError.methodNotAllowed().toErrorObj();
      return response(event, null, error, error.errorCode);
  }
});

async function handleRegister(event: any): Promise<Resp<DbUser>> {
  const body: ReqObj = await readBody(event);
  const { name, email } = body.data;

  if (!name || !email) {
    const error = BusinessError.required("姓名和邮箱是必需的").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  // 检查用户是否已存在
  const existingUser = await queryUserByEmail(email);

  if (existingUser) {
    const error = BusinessError.required("该邮箱已被注册，请直接登录")
      .toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  // 创建新用户
  const user = await createOrGetUser({
    id: 0, // 临时ID，会被忽略
    name,
    email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const data: RespObj<DbUser> = {
    data: user,
  };
  return response(event, data, null);
}
