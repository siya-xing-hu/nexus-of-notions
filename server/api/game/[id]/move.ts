import { defineEventHandler, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError } from "@/lib/exception/BusinessError";
import { SystemError } from "@/lib/exception/SystemError";
import { GameHandler } from "@/lib/handler/GameHandler";
import { DbGame } from "@/lib/db/service/game";

export default defineEventHandler(async (event) => {
  if (event.method === HttpMethod.POST) {
    return handlePost(event);
  }

  const error = BusinessError.methodNotAllowed().toErrorObj();
  return response(event, null, error, error.errorCode);
});

async function handlePost(event: any): Promise<Resp<{ game: DbGame; isWin: boolean }>> {
  const gameId = event.context.params?.id;
  const body: ReqObj = await readBody(event);
  const { data } = body;

  try {
    if (!gameId) {
      const error = BusinessError.required("游戏ID是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    if (!data) {
      const error = BusinessError.required("请求数据是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    const { row, col, userId } = data;
    
    if (row === undefined || col === undefined || !userId) {
      const error = BusinessError.required("行、列和用户ID都是必需的").toErrorObj();
      return response(event, null, error, error.errorCode);
    }

    const result = await GameHandler.handleGameMove(gameId, userId, row, col);
    
    const responseData: RespObj<{ game: DbGame; isWin: boolean }> = {
      data: result,
    };
    return response(event, responseData, null);
  } catch (error) {
    console.error('Move API Error:', error);
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}
