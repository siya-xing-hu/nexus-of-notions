import {
  defineEventHandler,
  EventHandler,
  EventHandlerRequest,
  getRequestHeaders,
  H3Event,
  readBody,
  setResponseStatus,
} from "h3";
import { getServerSession } from "#auth";
import { BusinessError } from "@/lib/exception";
import { queryUserById } from "@/lib/db/service/user";
import { DbUser } from "@/lib/db/types";
import { ReqObj } from "@/lib/api";

// 定义一个包含认证后用户信息（DbUser）的上下文
export interface AuthenticatedContext {
  user: DbUser;
}

// 扩展 H3Event，确保 context 中包含 user 对象
export type EventWithAuthenticatedUser = H3Event & {
  context: AuthenticatedContext;
};

// 定义认证处理器的配置选项
interface AuthHandlerConfig {
  allowSessionAuth?: boolean; // 是否允许 Session/Cookie 认证
  allowApiKeyAuth?: boolean; // 是否允许 API Key 认证
}

/**
 * 定义一个可认证的事件处理器。
 * 它会根据配置，检查 Session 或 API Key。
 * 如果认证成功，会将查询到的 DbUser 对象附加到 event.context.user 中。
 *
 * @param config 配置对象，指定允许的认证方式。
 * @param handler 您的业务逻辑处理器。
 */
export const defineAuthenticatedEventHandler = <
  T extends EventHandlerRequest,
  U,
>(
  config: AuthHandlerConfig,
  handler: (event: EventWithAuthenticatedUser) => Promise<U>,
): EventHandler<T, U> =>
  defineEventHandler<T>(async (event) => {
    let user: DbUser | null = null;

    // 1. 尝试 Session 认证 (如果允许)
    if (config.allowSessionAuth) {
      const session = await getServerSession(event);
      if (session?.user?.id) {
        // 从 session 中直接获取用户对象
        user = session.user as DbUser;
      }
    }

    // 2. 如果 Session 认证失败或未启用，尝试 API Key 认证 (如果允许)
    if (!user && config.allowApiKeyAuth) {
      const headers = getRequestHeaders(event);

      // 优先从 Header 的 'x-api-key' 中获取
      let apiKey = headers["x-api-key"] as string;
      if (!apiKey) {
        console.log("apiKey not found");
        const body: ReqObj = await readBody(event);
        apiKey = body.data.userId as string;
      }

      if (apiKey) {
        // 在您的场景中，API Key 就是 User ID
        user = await queryUserById(apiKey);
      }
    }

    // 3. 检查认证结果
    if (!user) {
      const error = BusinessError.unauthorized("认证失败或权限不足")
        .toErrorObj();
      setResponseStatus(event, 401);
      return error;
    }

    // 认证成功，将用户信息附加到 event context
    event.context.user = user;

    return handler(event as EventWithAuthenticatedUser);
  });
