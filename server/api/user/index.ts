import { readBody } from "h3";
import { defineAuthenticatedEventHandler } from "@/server/utils/auth";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { queryAllUsers, queryUserByEmail } from "@/lib/db";
import { DbUser } from "@/lib/db/types";

export default defineAuthenticatedEventHandler(
  {
    allowSessionAuth: true, // 只允许 Session/Cookie 认证
    allowApiKeyAuth: false, // 不允许 API Key 认证
  },
  async (event) => {
    switch (event.method) {
      case HttpMethod.POST:
        return handlePost(event);
      default:
        const error = BusinessError.methodNotAllowed().toErrorObj();
        return response(event, null, error, error.errorCode);
    }
  },
);

async function handlePost(event: any): Promise<Resp<any>> {
  const body: ReqObj = await readBody(event);
  const { type, data } = body;

  let result: RespObj<DbUser | DbUser[]> | null = null;
  switch (type) {
    case "query_by_email":
      const user = await queryUserByEmail(data.email);
      if (!user) {
        const error = BusinessError.required("用户不存在").toErrorObj();
        return response(event, null, error, error.errorCode);
      }
      result = {
        data: user,
      };
      break;
    case "query_all":
      const users = await queryAllUsers();
      result = {
        data: users,
      };
      break;
    default:
      const error = BusinessError.methodNotAllowed().toErrorObj();
      return response(event, null, error, error.errorCode);
  }

  return response(event, result, null);
}
