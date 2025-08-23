import { defineEventHandler, readBody } from "h3";
import { HttpMethod, ReqObj, Resp, RespObj, response } from "@/lib/api";
import { BusinessError, SystemError } from "@/lib/exception";
import { SearchHandler, SearchResult } from "@/lib/handler/SearchHandler";

export default defineEventHandler(async (event) => {
  switch (event.method) {
    case HttpMethod.POST:
      return handlePost(event);
    default:
      const error = BusinessError.methodNotAllowed().toErrorObj();
      return response(event, null, error, error.errorCode);
  }
});

async function handlePost(event: any): Promise<Resp<SearchResult>> {
  const body: ReqObj = await readBody(event);
  const { type, data } = body;

  try {
    let result: any = null;
    switch (type) {
      case "search":
        result = await SearchHandler.handleSearch(data.channel, data.keyword);
        break;
      case "getSearchResult":
        result = await SearchHandler.getMessage(
          data.channel,
          data.sentMessageId,
          data.keyword,
        );
        break;
      default:
        const error = BusinessError.required("无效的操作类型").toErrorObj();
        return response(event, null, error, error.errorCode);
    }

    const responseData: RespObj<SearchResult> = {
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
