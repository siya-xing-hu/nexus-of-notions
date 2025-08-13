import { PrismaClient } from '@prisma/client'
import { SystemError } from '@/lib/exception/SystemError'

const prisma = new PrismaClient()

export interface DbGame {
  id: string
  player1Id: string
  player2Id: string | null
  status: 'WAITING' | 'PLAYING' | 'FINISHED'
  board: any[][]
  currentTurn: string | null
  winner: string | null
  lastMove: any | null
  createdAt: string
  updatedAt: string
  player1: {
    id: string
    name: string
  }
  player2?: {
    id: string
    name: string
  } | null
}

/**
 * 创建新游戏
 */
export async function createGame(player1Id: string, size: number = 15): Promise<DbGame> {
  try {
    const board = Array(size).fill(null).map(() => Array(size).fill(null))
    
    const game = await prisma.game.create({
      data: {
        player1Id,
        board,
        status: 'WAITING'
      },
      include: {
        player1: {
          select: { id: true, name: true }
        }
      }
    })

    return {
      ...game,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }
  } catch (error) {
    throw SystemError.internalServerError()
  }
}

/**
 * 根据ID查询游戏
 */
export async function queryGameById(gameId: string): Promise<DbGame | null> {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        player1: {
          select: { id: true, name: true }
        },
        player2: {
          select: { id: true, name: true }
        }
      }
    })

    if (!game) return null

    return {
      ...game,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }
  } catch (error) {
    throw SystemError.internalServerError()
  }
}

/**
 * 查询用户的游戏列表
 */
export async function queryUserGames(userId: string, status?: string): Promise<DbGame[]> {
  try {
    const where: any = {
      OR: [
        { player1Id: userId },
        { player2Id: userId }
      ]
    }

    if (status) {
      where.status = status
    }

    const games = await prisma.game.findMany({
      where,
      include: {
        player1: {
          select: { id: true, name: true }
        },
        player2: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return games.map(game => ({
      ...game,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }))
  } catch (error) {
    throw SystemError.internalServerError()
  }
}

/**
 * 查询可加入的游戏列表
 */
export async function queryAvailableGames(status: string = 'WAITING'): Promise<DbGame[]> {
  try {
    const games = await prisma.game.findMany({
      where: { status },
      include: {
        player1: {
          select: { id: true, name: true }
        },
        player2: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return games.map(game => ({
      ...game,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }))
  } catch (error) {
    throw SystemError.internalServerError()
  }
}

/**
 * 加入游戏
 */
export async function joinGame(gameId: string, player2Id: string): Promise<DbGame> {
  try {
    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        player2Id,
        status: 'PLAYING',
        currentTurn: (await prisma.game.findUnique({ where: { id: gameId } }))?.player1Id
      },
      include: {
        player1: {
          select: { id: true, name: true }
        },
        player2: {
          select: { id: true, name: true }
        }
      }
    })

    return {
      ...game,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }
  } catch (error) {
    throw SystemError.internalServerError()
  }
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
  winner?: string
): Promise<DbGame> {
  try {
    const updateData: any = {
      board,
      lastMove,
      currentTurn,
      status,
      updatedAt: new Date()
    }

    if (winner) {
      updateData.winner = winner
    }

    const game = await prisma.game.update({
      where: { id: gameId },
      data: updateData,
      include: {
        player1: {
          select: { id: true, name: true }
        },
        player2: {
          select: { id: true, name: true }
        }
      }
    })

    return {
      ...game,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString()
    }
  } catch (error) {
    throw SystemError.internalServerError()
  }
}
