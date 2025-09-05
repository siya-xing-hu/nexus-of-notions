import { SearchResult } from "@/lib/handler/SearchHandler";
import { HttpMethod } from "../index";
import { request } from "../request";

export const searchApi = {
  search_channels: () =>
    request("/api/search/channel", HttpMethod.GET, {
      query: {
      },
    }) as Promise<any[]>,
  search: (payload: { channel_id: string; keyword: string }) =>
    request("/api/search", HttpMethod.POST, {
      body: {
        type: "search",
        data: payload,
      },
    }) as Promise<SearchResult>,

  getResult: (payload: {
    channel_id: string;
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
