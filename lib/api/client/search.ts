import { SearchResult } from "@/lib/handler/SearchHandler";
import { HttpMethod } from "../index";
import { request } from "../request";

export const searchApi = {
  search: (payload: { channel: string; keyword: string }) =>
    request("/api/search", HttpMethod.POST, {
      body: {
        type: "search",
        data: payload,
      },
    }) as Promise<SearchResult>,

  getResult: (payload: {
    channel: string;
    sentMessageId: number;
    keyword: string;
  }) =>
    request("/api/search", HttpMethod.POST, {
      body: {
        type: "getSearchResult",
        data: payload,
      },
    }) as Promise<SearchResult>,
};

export type SearchApi = typeof searchApi;
