import { defineEventHandler, getQuery, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { queryAllUsers, queryUserByEmail, queryUserById } from "@/lib/db";
import { DbUser } from "@/lib/db/types";

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

async function handleGet(event: any): Promise<Resp<DbUser>> {
  const query = getQuery(event);
  const userId = query.userId as string;

  if (!userId) {
    const error = BusinessError.required("用户ID是必需的").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  const user = await queryUserById(userId);
  if (!user) {
    const error = BusinessError.required("用户不存在").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  const data: RespObj<DbUser> = {
    data: user,
  };
  return response(event, data, null);
}
