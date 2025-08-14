import type { Game, GameStatus } from "@prisma/client";
import prisma from "../../../server/utils/prisma";
import type { DbGame, DbUser } from "../types";

function prismaToDb(record: Game): DbGame {
  return {
    id: record.id,
    name: record.name,
    player1Id: record.player1Id,
    player2Id: record.player2Id,
    status: record.status,
    board: record.board as any[][],
    currentTurn: record.currentTurn,
    winner: record.winner,
    lastMove: record.lastMove,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/**
 * 创建新游戏
 */
export async function createGame(
  player1User: DbUser,
  size: number = 15,
): Promise<DbGame> {
  const board = Array(size).fill(null).map(() => Array(size).fill(null));

  const record = await prisma.game.create({
    data: {
      name: player1User.name + " " + new Date().toISOString().split("T")[0],
      player1Id: player1User.id,
      board,
      status: "WAITING",
    },
  });

  return prismaToDb(record);
}

/**
 * 根据ID查询游戏
 */
export async function queryGameById(gameId: string): Promise<DbGame | null> {
  const record = await prisma.game.findUnique({
    where: { id: gameId },
  });

  return record ? prismaToDb(record) : null;
}

/**
 * 查询用户的游戏列表
 */
export async function queryUserGames(
  userId: string,
  status?: string,
): Promise<DbGame[]> {
  const where: any = {
    OR: [
      { player1Id: userId },
      { player2Id: userId },
    ],
  };

  if (status) {
    where.status = status;
  }

  const games = await prisma.game.findMany({
    where,
    orderBy: {
      updatedAt: "desc",
    },
  });

  return games.map(prismaToDb);
}

/**
 * 查询可加入的游戏列表
 */
export async function queryAvailableGames(
  status: GameStatus,
): Promise<DbGame[]> {
  const games = await prisma.game.findMany({
    where: { status },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return games.map(prismaToDb);
}

/**
 * 加入游戏
 */
export async function joinGame(
  gameId: string,
  player2Id: string,
): Promise<DbGame> {
  const game = await prisma.game.update({
    where: { id: gameId },
    data: {
      player2Id,
      status: "PLAYING",
      currentTurn: (await prisma.game.findUnique({ where: { id: gameId } }))
        ?.player1Id,
    },
  });

  return prismaToDb(game);
}

/**
 * 更新游戏移动
 */
export async function updateGameMove(
  gameId: string,
  board: any[][],
  lastMove: any,
  currentTurn: string | null,
  status: string,
  winner?: string,
): Promise<DbGame> {
  const updateData: any = {
    board,
    lastMove,
    currentTurn,
    status,
    updatedAt: new Date(),
  };

  if (winner) {
    updateData.winner = winner;
  }

  const game = await prisma.game.update({
    where: { id: gameId },
    data: updateData,
  });

  return prismaToDb(game);
}
