import { BusinessError } from "@/lib/exception/BusinessError";
import { queryUserById } from "@/lib/db";
import { createGame, joinGame, queryGameById, updateGameMove } from "@/lib/db";
import { DbGame } from "../db/types";

export class GameHandler {
  /**
   * 处理创建游戏请求
   */
  static async handleCreateGame(
    userId: string,
    size: number = 15,
  ): Promise<DbGame> {
    // 验证用户ID
    if (!userId) {
      throw BusinessError.required("用户ID是必需的");
    }

    // 验证用户是否存在
    const user = await queryUserById(userId);
    if (!user) {
      throw BusinessError.notFound("用户不存在");
    }

    // 验证棋盘大小
    if (size < 10 || size > 20) {
      throw BusinessError.required("棋盘大小必须在 10-20 之间");
    }
    return await createGame(user, size);
  }

  /**
   * 处理加入游戏请求
   */
  static async handleJoinGame(gameId: string, userId: string): Promise<DbGame> {
    // 验证参数
    if (!gameId) {
      throw BusinessError.required("游戏ID是必需的");
    }

    if (!userId) {
      throw BusinessError.required("用户ID是必需的");
    }

    // 验证用户是否存在
    const user = await queryUserById(userId);
    if (!user) {
      throw BusinessError.notFound("用户不存在");
    }

    // 获取游戏信息
    let game = await queryGameById(gameId);
    if (!game) {
      throw BusinessError.notFound("游戏不存在");
    }

    // 检查游戏状态
    if (game.status !== "WAITING") {
      throw BusinessError.required("游戏已开始或已结束");
    }

    // 检查是否是自己的游戏
    if (game.player1_id === userId) {
      throw BusinessError.required("不能加入自己创建的游戏");
    }

    // 加入游戏
    return await joinGame(gameId, userId);
  }

  /**
   * 处理游戏移动请求
   */
  static async handleGameMove(
    gameId: string,
    userId: string,
    row: number,
    col: number,
  ): Promise<{ game: DbGame; isWin: boolean }> {
    // 验证参数
    if (!gameId) {
      throw BusinessError.required("游戏ID是必需的");
    }

    if (!userId) {
      throw BusinessError.required("用户ID是必需的");
    }

    if (row === undefined || col === undefined) {
      throw BusinessError.required("行和列坐标是必需的");
    }

    // 验证用户是否存在
    const user = await queryUserById(userId);
    if (!user) {
      throw BusinessError.notFound("用户不存在");
    }

    // 获取游戏信息
    const game = await queryGameById(gameId);
    if (!game) {
      throw BusinessError.notFound("游戏不存在");
    }

    // 检查游戏状态
    if (game.status !== "PLAYING") {
      throw BusinessError.required("游戏未进行中");
    }

    // 检查是否是当前玩家的回合
    if (game.current_turn !== userId) {
      throw BusinessError.required("不是你的回合");
    }

    // 检查是否是游戏参与者
    if (game.player1_id !== userId && game.player2_id !== userId) {
      throw BusinessError.required("你不是游戏参与者");
    }

    const board = game.board;

    // 检查位置是否有效
    if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
      throw BusinessError.required("无效的位置");
    }

    // 检查位置是否已被占用
    if (board[row][col] !== null) {
      throw BusinessError.required("该位置已被占用");
    }

    // 确定玩家棋子类型
    const playerPiece = game.player1_id === userId ? "black" : "white";

    // 更新棋盘
    board[row][col] = playerPiece;

    // 检查是否获胜
    const isWin = this.checkWin(board, row, col, playerPiece);

    // 确定下一个玩家
    const nextPlayer = game.current_turn === game.player1_id
      ? game.player2_id
      : game.player1_id;

    // 更新游戏状态
    const lastMove = { row, col, player: playerPiece };
    const status = isWin ? "FINISHED" : "PLAYING";
    const winner = isWin ? userId : undefined;

    const updatedGame = await updateGameMove(
      gameId,
      board,
      lastMove,
      isWin ? null : nextPlayer,
      status,
      winner,
    );

    return { game: updatedGame, isWin };
  }

  /**
   * 检查是否获胜
   */
  private static checkWin(
    board: any[][],
    row: number,
    col: number,
    player: string,
  ): boolean {
    const directions = [
      [0, 1], // 水平
      [1, 0], // 垂直
      [1, 1], // 对角线
      [1, -1], // 反对角线
    ];

    for (const [dx, dy] of directions) {
      let count = 1;

      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow < 0 || newRow >= board.length || newCol < 0 ||
          newCol >= board[0].length
        ) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }

      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow < 0 || newRow >= board.length || newCol < 0 ||
          newCol >= board[0].length
        ) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }

      if (count >= 5) return true;
    }

    return false;
  }
}
