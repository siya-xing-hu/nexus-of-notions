import { defineEventHandler, getQuery, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";
import { GameHandler } from "@/lib/handler/GameHandler";
import { queryGameById } from "@/lib/db/service/game";
import { DbGame } from "@/lib/db/service/game";

export default defineEventHandler(async (event) => {
  const gameId = event.context.params?.id;

  if (!gameId) {
    const error = BusinessError.required("游戏ID是必需的").toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  switch (event.method) {
    case HttpMethod.GET:
      return handleGet(event, gameId);
    case HttpMethod.PUT:
      return handlePut(event, gameId);
    default:
      const error = BusinessError.methodNotAllowed().toErrorObj();
      return response(event, null, error, error.errorCode);
  }
});

async function handleGet(event: any, gameId: string): Promise<Resp<DbGame>> {
  const query = getQuery(event);
  const userId = query.userId as string;

  try {
    if (!userId) {
      const error = BusinessError.required("用户ID是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    const game = await queryGameById(gameId);
    if (!game) {
      const error = new BusinessError("游戏不存在", 404).toErrorObj();
      return response(event, null, error, error.errorCode);
    }

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

async function handlePut(event: any, gameId: string): Promise<Resp<DbGame>> {
  const body: ReqObj = await readBody(event);
  const { data } = body;

  try {
    const { action, userId } = data;

    if (action === 'join') {
      const game = await GameHandler.handleJoinGame(gameId, userId);
      
      const result: RespObj<DbGame> = {
        data: game,
      };
      return response(event, result, null);
    }

    const error = BusinessError.required("无效的操作").toErrorObj();
    return response(event, null, error, error.errorCode);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}
