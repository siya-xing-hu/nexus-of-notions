import { readBody } from "h3";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError, SystemError } from "@/lib/exception";
import { GameHandler } from "@/lib/handler";
import { DbGame } from "@/lib/db/types";

export default defineAuthenticatedEventHandler(
  {
    allowSessionAuth: true, // 只允许 Session/Cookie 认证
    allowApiKeyAuth: false, // 不允许 API Key 认证
  },
  async (event) => {
    if (event.method === HttpMethod.POST) {
      return handlePost(event);
    }

    const error = BusinessError.methodNotAllowed().toErrorObj();
    return response(event, null, error, error.errorCode);
  },
);

async function handlePost(
  event: any,
): Promise<Resp<{ game: DbGame; isWin: boolean }>> {
  const gameId = event.context.params?.id;
  const body: ReqObj = await readBody(event);
  const { data } = body;

  try {
    const { row, col } = data;

    const result = await GameHandler.handleGameMove(gameId, event.context.user.id, row, col);

    const responseData: RespObj<{ game: DbGame; isWin: boolean }> = {
      data: result,
    };
    return response(event, responseData, null);
  } catch (error) {
    if (error instanceof BusinessError) {
      const errorObj = error.toErrorObj();
      return response(event, null, errorObj, errorObj.errorCode);
    }
    const errorObj = SystemError.internalServerError().toErrorObj();
    return response(event, null, errorObj, errorObj.errorCode);
  }
}
