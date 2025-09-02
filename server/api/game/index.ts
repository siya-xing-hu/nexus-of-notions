import { getQuery, readBody } from "h3";
import { defineAuthenticatedEventHandler } from "@/server/utils/auth";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError, SystemError } from "@/lib/exception";
import { GameHandler } from "@/lib/handler";
import { queryAvailableGames, queryUserGames } from "@/lib/db";
import { DbGame } from "@/lib/db/types";

export default defineAuthenticatedEventHandler(
  {
    allowSessionAuth: true, // 只允许 Session/Cookie 认证
    allowApiKeyAuth: false, // 不允许 API Key 认证
  },
  async (event) => {
    const user = event.context.user;

    switch (event.method) {
      case HttpMethod.POST:
        return handlePost(event, user.id);
      case HttpMethod.GET:
        return handleGet(event, user.id);
      default:
        const error = BusinessError.methodNotAllowed().toErrorObj();
        return response(event, null, error, error.errorCode);
    }
  },
);

async function handlePost(event: any, userId: string): Promise<Resp<DbGame>> {
  const body: ReqObj = await readBody(event);
  const { data } = body;

  try {
    const { size = 15 } = data;
    const game = await GameHandler.handleCreateGame(userId, size);

    const result: RespObj<DbGame> = {
      data: game,
    };
    return response(event, result, null);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}

async function handleGet(event: any, userId: string): Promise<Resp<DbGame[]>> {
  const query = getQuery(event);
  const status = query.status as string;

  try {
    let games: DbGame[];

    if (userId) {
      // 查询用户的游戏
      games = await queryUserGames(userId, status);
    } else if (status) {
      // 查询可加入的游戏
      games = await queryAvailableGames(status as any);
      // 剔除自己创建的游戏
      games = games.filter((game) => game.player1_id !== userId);
    } else {
      throw BusinessError.required("用户ID或状态参数是必需的");
    }

    const result: RespObj<DbGame[]> = {
      data: games,
    };
    return response(event, result, null);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}
