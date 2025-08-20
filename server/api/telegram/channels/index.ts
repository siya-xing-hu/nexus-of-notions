import { defineEventHandler, getQuery, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";
import {
  createOrUpdateUserChannel,
  deleteChannel,
  queryUserChannels,
} from "@/lib/db/service/telegramChannel";
import { queryUserById } from "@/lib/db/service/user";

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case HttpMethod.GET:
      return handleGet(event);
    case HttpMethod.POST:
      return handlePost(event);
    case HttpMethod.DELETE:
      return handleDelete(event);
    default:
      const error = BusinessError.methodNotAllowed().toErrorObj();
      return response(event, null, error, error.errorCode);
  }
});

// 获取用户的频道列表
async function handleGet(event: any): Promise<Resp<any>> {
  const query = getQuery(event);
  const { userId } = query;

  // 获取用户的频道列表
  const channels = await queryUserChannels(userId as string);

  return response(event, { data: channels }, null);
}

// 添加或更新频道
async function handlePost(event: any): Promise<Resp<any>> {
  const body: ReqObj = await readBody(event);
  const { data } = body;
  const { userId, channelInfo } = data;

  try {
    // 参数验证
    if (!userId) {
      const error = BusinessError.required("用户ID是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    if (!channelInfo) {
      const error = BusinessError.required("频道信息是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    // 验证用户是否存在
    const user = await queryUserById(userId);
    if (!user) {
      const error = BusinessError.invalidRequest("用户不存在").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    // 创建或更新频道
    const channel = await createOrUpdateUserChannel(userId, channelInfo);

    return response(event, { data: channel }, null);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}

// 删除频道
async function handleDelete(event: any): Promise<Resp<any>> {
  const query = getQuery(event);
  const { id } = query;

  try {
    // 参数验证
    if (!id) {
      const error = BusinessError.required("频道ID是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    // 删除频道
    await deleteChannel(id as string);

    return response(event, { data: { success: true } }, null);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}
