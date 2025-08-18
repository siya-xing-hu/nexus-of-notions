import { defineEventHandler, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";
import {
  ChannelInfo,
  TelegramMessage,
  TelegramService,
} from "@/lib/telegram/TelegramService";

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

  return await TelegramService.getInstance().startAuth(phoneNumber);
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

  return await TelegramService.getInstance().submitCode(phoneCode);
}

async function handleSubmitTwoFactor(
  password: string,
): Promise<{ success: boolean }> {
  // 参数验证
  if (!password) {
    throw BusinessError.required("两步验证密码是必需的");
  }

  return await TelegramService.getInstance().submitTwoFactorPassword(password);
}

async function handleCheckAuth(): Promise<
  { isAuthenticated: boolean; phoneNumber?: string }
> {
  let result = await TelegramService.getInstance().checkAuthStatus();

  if (!result.isAuthenticated) {
    result = await TelegramService.getInstance().tryRestoreSession();
  }

  return result;
}

async function handleLogout(): Promise<void> {
  await TelegramService.getInstance().logout();
}

async function handleGetChannelInfo(
  channelUsername: string,
): Promise<ChannelInfo> {
  // 参数验证
  if (!channelUsername) {
    throw BusinessError.required("频道用户名是必需的");
  }

  return await TelegramService.getInstance().getChannelInfo(channelUsername);
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

  await TelegramService.getInstance().sendMessage(channelUsername, message);
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

  return await TelegramService.getInstance().getChannelMessages(
    channelUsername,
    limit,
    offsetId,
  );
}
