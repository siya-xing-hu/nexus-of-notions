import { readBody } from "h3";
import { defineAuthenticatedEventHandler } from "@/server/utils/auth";
import { HttpMethod, ReqObj, Resp, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";
import { Telegram, TelegramMessage } from "@/lib/telegram";
import { DbTelegramChannel } from "@/lib/db/types";

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

  try {
    let result: any = null;
    switch (type) {
      case "startAuth":
        result = await handleStartAuth(event, data.phoneNumber);
        break;
      case "submitCode":
        result = await handleSubmitCode(event, data.phoneCode);
        break;
      case "submitTwoFactor":
        result = await handleSubmitTwoFactor(event, data.password);
        break;
      case "checkAuth":
        result = await handleCheckAuth(event);
        break;
      case "logout":
        await handleLogout(event);
        break;
      case "getMessages":
        result = await handleGetMessages(
          event,
          data.channelUsername,
          data.limit,
          data.offsetId,
        );
        break;
      case "sendMessage":
        await handleSendMessage(event, data.channelUsername, data.message);
        break;
      case "channelInfo":
        result = await handleGetChannelInfo(event, data.channelUsername);
        break;
      case "searchUsersAndChannels":
        result = await handleSearchUsersAndChannels(event, data.query);
        break;
      default:
        const error = BusinessError.required("无效的操作类型").toErrorObj();
        return response(event, null, error, error.errorCode);
    }
    return response(event, { data: result }, null);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}

// 认证相关处理函数
async function handleStartAuth(
  event: any,
  phoneNumber: string,
): Promise<{ phoneCodeHash: string }> {
  // 参数验证
  if (!phoneNumber) {
    throw BusinessError.required("手机号是必需的");
  }

  const userId = event.context.user.id;
  return await Telegram.getAuth(userId).startAuth(phoneNumber);
}

async function handleSubmitCode(
  event: any,
  phoneCode: string,
): Promise<
  { success: boolean; needsTwoFactor?: boolean; authRestart?: boolean }
> {
  // 参数验证
  if (!phoneCode) {
    throw BusinessError.required("验证码是必需的");
  }

  const userId = event.context.user.id;
  return await Telegram.getAuth(userId).submitCode(phoneCode);
}

async function handleSubmitTwoFactor(
  event: any,
  password: string,
): Promise<{ success: boolean }> {
  // 参数验证
  if (!password) {
    throw BusinessError.required("两步验证密码是必需的");
  }

  const userId = event.context.user.id;
  return await Telegram.getAuth(userId).submitTwoFactorPassword(password);
}

async function handleCheckAuth(event: any): Promise<
  { isAuthenticated: boolean; phoneNumber?: string }
> {
  const userId = event.context.user.id;
  let result = await Telegram.getAuth(userId).checkAuthStatus();

  if (!result.isAuthenticated) {
    result = await Telegram.getAuth(userId).tryRestoreSession();
  }

  return result;
}

async function handleLogout(event: any): Promise<void> {
  const userId = event.context.user.id;
  await Telegram.getAuth(userId).logout();
}

async function handleGetChannelInfo(
  event: any,
  channelUsername: string,
): Promise<DbTelegramChannel> {
  // 参数验证
  if (!channelUsername) {
    throw BusinessError.required("频道用户名是必需的");
  }

  const userId = event.context.user.id;
  const service = await Telegram.getService(userId);
  return await service.getChannelInfo(channelUsername);
}

async function handleSendMessage(
  event: any,
  channelUsername: string,
  message: string,
): Promise<void> {
  // 参数验证
  if (!channelUsername) {
    throw BusinessError.required("频道用户名是必需的");
  }

  if (!message) {
    throw BusinessError.required("消息内容是必需的");
  }

  const userId = event.context.user.id;
  const service = await Telegram.getService(userId);
  await service.sendMessage(channelUsername, message);
}

async function handleGetMessages(
  event: any,
  channelUsername: string,
  limit: number,
  offsetId: number,
): Promise<TelegramMessage[]> {
  // 参数验证
  if (!channelUsername) {
    throw BusinessError.required("频道用户名是必需的");
  }

  const userId = event.context.user.id;
  const service = await Telegram.getService(userId);
  return await service.getChannelMessages(
    channelUsername,
    limit,
    offsetId,
  );
}

async function handleSearchUsersAndChannels(
  event: any,
  query: string,
): Promise<
  Array<{
    id: number;
    access_hash: string;
    title: string;
    username: string;
    type: "CHANNEL" | "BOT" | "USER";
    first_name?: string;
    last_name?: string;
  }>
> {
  // 参数验证
  if (!query) {
    throw BusinessError.required("搜索查询是必需的");
  }

  const userId = event.context.user.id;
  const service = await Telegram.getService(userId);
  return await service.searchUsersAndChannels(query);
}
