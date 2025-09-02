import { getQuery, readBody } from "h3";
import { defineAuthenticatedEventHandler } from "@/server/utils/auth";
import { HttpMethod, ReqObj, Resp, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";
import {
  createOrUpdateUserChannel,
  deleteChannel,
  queryUserChannels,
} from "@/lib/db/service/telegramChannel";

export default defineAuthenticatedEventHandler(
  {
    allowSessionAuth: true, // 只允许 Session/Cookie 认证
    allowApiKeyAuth: false, // 不允许 API Key 认证
  },
  async (event) => {
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
  },
);

// 获取用户的频道列表
async function handleGet(event: any): Promise<Resp<any>> {
  // 获取用户的频道列表
  const channels = await queryUserChannels(event.context.user.id);

  return response(event, { data: channels }, null);
}

// 添加或更新频道
async function handlePost(event: any): Promise<Resp<any>> {
  const body: ReqObj = await readBody(event);
  const { data } = body;
  const { channelInfo } = data;

  try {
    if (!channelInfo) {
      const error = BusinessError.required("频道信息是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    // 创建或更新频道
    const channel = await createOrUpdateUserChannel(
      event.context.user.id,
      channelInfo,
    );

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
