import { defineEventHandler, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";
import { Telegram, TelegramMessage } from "@/lib/telegram";
import { DbTelegramChannel } from "@/lib/db/types";

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
  const { type, data } = body;

  try {
    let result: any = null;
    switch (type) {
      case "startAuth":
        result = await handleStartAuth(data.phoneNumber);
        break;
      case "submitCode":
        result = await handleSubmitCode(data.phoneCode);
        break;
      case "submitTwoFactor":
        result = await handleSubmitTwoFactor(data.password);
        break;
      case "checkAuth":
        result = await handleCheckAuth();
        break;
      case "logout":
        await handleLogout();
        break;
      case "getMessages":
        result = await handleGetMessages(
          data.channelUsername,
          data.limit,
          data.offsetId,
        );
        break;
      case "sendMessage":
        await handleSendMessage(data.channelUsername, data.message);
        break;
      case "channelInfo":
        result = await handleGetChannelInfo(data.channelUsername);
        break;
      case "searchUsersAndChannels":
        result = await handleSearchUsersAndChannels(data.query);
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
  phoneNumber: string,
): Promise<{ phoneCodeHash: string }> {
  // 参数验证
  if (!phoneNumber) {
    throw BusinessError.required("手机号是必需的");
  }

  return await Telegram.getAuth().startAuth(phoneNumber);
}

async function handleSubmitCode(
  phoneCode: string,
): Promise<
  { success: boolean; needsTwoFactor?: boolean; authRestart?: boolean }
> {
  // 参数验证
  if (!phoneCode) {
    throw BusinessError.required("验证码是必需的");
  }

  return await Telegram.getAuth().submitCode(phoneCode);
}

async function handleSubmitTwoFactor(
  password: string,
): Promise<{ success: boolean }> {
  // 参数验证
  if (!password) {
    throw BusinessError.required("两步验证密码是必需的");
  }

  return await Telegram.getAuth().submitTwoFactorPassword(password);
}

async function handleCheckAuth(): Promise<
  { isAuthenticated: boolean; phoneNumber?: string }
> {
  let result = await Telegram.getAuth().checkAuthStatus();

  if (!result.isAuthenticated) {
    result = await Telegram.getAuth().tryRestoreSession();
  }

  return result;
}

async function handleLogout(): Promise<void> {
  await Telegram.getAuth().logout();
}

async function handleGetChannelInfo(
  channelUsername: string,
): Promise<DbTelegramChannel> {
  // 参数验证
  if (!channelUsername) {
    throw BusinessError.required("频道用户名是必需的");
  }

  return await Telegram.getService().getChannelInfo(channelUsername);
}

async function handleSendMessage(
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

  await Telegram.getService().sendMessage(channelUsername, message);
}

async function handleGetMessages(
  channelUsername: string,
  limit: number,
  offsetId: number,
): Promise<TelegramMessage[]> {
  // 参数验证
  if (!channelUsername) {
    throw BusinessError.required("频道用户名是必需的");
  }

  return await Telegram.getService().getChannelMessages(
    channelUsername,
    limit,
    offsetId,
  );
}

async function handleSearchUsersAndChannels(
  query: string,
): Promise<Array<{
  id: number;
  access_hash: string;
  title: string;
  username: string;
  type: "CHANNEL" | "BOT" | "USER";
  first_name?: string;
  last_name?: string;
}>> {
  // 参数验证
  if (!query) {
    throw BusinessError.required("搜索查询是必需的");
  }

  return await Telegram.getService().searchUsersAndChannels(query);
}
