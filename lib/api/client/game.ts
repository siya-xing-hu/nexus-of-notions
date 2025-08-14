import { DbGame } from "@/lib/db/types";
import { HttpMethod } from "../index";
import { request } from "../request";

export const gameApi = {
  // 创建新游戏
  create: (userId: string, size: number = 15) =>
    request("/api/game", HttpMethod.POST, {
      body: { data: { userId, size } },
    }) as Promise<DbGame>,

  // 获取游戏列表
  queryUserGames: (userId: string, status?: string) =>
    request("/api/game", HttpMethod.GET, {
      query: { userId, status },
    }) as Promise<DbGame[]>,

  // 获取可加入的游戏列表
  queryAvailableGames: (status: string = "WAITING") =>
    request("/api/game", HttpMethod.GET, {
      query: { status },
    }) as Promise<DbGame[]>,

  // 获取游戏详情
  queryById: (gameId: string) =>
    request(`/api/game/${gameId}`, HttpMethod.GET) as Promise<DbGame>,

  // 加入游戏
  join: (gameId: string, userId: string) =>
    request(`/api/game/${gameId}`, HttpMethod.PUT, {
      body: { data: { action: "join", userId } },
    }) as Promise<DbGame>,

  // 游戏移动
  move: (gameId: string, userId: string, row: number, col: number) =>
    request(`/api/game/${gameId}/move`, HttpMethod.POST, {
      body: { data: { userId, row, col } },
    }) as Promise<{ game: DbGame; isWin: boolean }>,
};

export type GameApi = typeof gameApi;
