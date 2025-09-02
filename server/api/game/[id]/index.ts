import {readBody } from "h3";
import { defineAuthenticatedEventHandler } from "@/server/utils/auth";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception";
import { GameHandler } from "@/lib/handler";
import { queryGameById, queryUserById } from "@/lib/db";
import { DbGame } from "@/lib/db/types";

export default defineAuthenticatedEventHandler(
  {
    allowSessionAuth: true, // 只允许 Session/Cookie 认证
    allowApiKeyAuth: false, // 不允许 API Key 认证
  },
  async (event) => {
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
  },
);

async function handleGet(event: any, gameId: string): Promise<Resp<DbGame>> {
  const game = await queryGameById(gameId);
  if (!game) {
    const error = new BusinessError("游戏不存在", 404).toErrorObj();
    return response(event, null, error, error.errorCode);
  }

  const player1 = await queryUserById(game.player1_id);
  if (!player1) {
    const error = BusinessError.notFound("玩家 1 不存在").toErrorObj();
    return response(event, null, error, error.errorCode);
  }
  game.player1 = {
    id: player1.id,
    name: player1.name,
  };

  if (game.player2_id) {
    const player2 = await queryUserById(game.player2_id);
    if (!player2) {
      const error = BusinessError.notFound("玩家 2 不存在").toErrorObj();
      return response(event, null, error, error.errorCode);
    }
    game.player2 = {
      id: player2.id,
      name: player2.name,
    };
  }

  const result: RespObj<DbGame> = {
    data: game,
  };
  return response(event, result, null);
}

async function handlePut(event: any, gameId: string): Promise<Resp<DbGame>> {
  const body: ReqObj = await readBody(event);
  const { data } = body;

  const { action } = data;

  if (action === "join") {
    const game = await GameHandler.handleJoinGame(gameId, event.context.user.id);

    const result: RespObj<DbGame> = {
      data: game,
    };
    return response(event, result, null);
  }

  const error = BusinessError.required("无效的操作").toErrorObj();
  return response(event, null, error, error.errorCode);
}
