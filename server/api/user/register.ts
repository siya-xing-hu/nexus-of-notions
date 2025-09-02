import { defineEventHandler, readBody } from "h3";
import { sm3 } from "sm-crypto-v2";
import { createUserWithPassword, queryUserByEmail } from "@/lib/db/service/user";
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
  const { name, email, password } = body.data;

  if (!name || !email || !password) {
    const error = BusinessError.required(
      "姓名、邮箱和密码是必需的",
    ).toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  // 检查用户是否已存在
  const existingUser = await queryUserByEmail(email);

  if (existingUser) {
    const error = BusinessError.required("该邮箱已被注册，请直接登录").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  // 加密密码
  const hashedPassword = sm3(password);

  // 创建新用户
  const user = await createUserWithPassword(name, email, hashedPassword);

  const data: RespObj<DbUser> = {
    data: user,
  };
  return response(event, data, null);
}
