<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 游戏头部信息 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">五子棋对战</h1>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>{{ game?.player1?.name }} (黑子)</span>
              <span class="text-gray-400">vs</span>
              <span>{{ game?.player2?.name || "等待加入..." }} (白子)</span>
            </div>
          </div>
          <div class="text-right">
            <GameStatusBadge :status="game?.status" />
            <p class="text-sm text-gray-500 mt-1">
              {{
                game?.status === "PLAYING" ? `当前回合: ${currentTurnText}` : ""
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- 调试信息面板（开发环境显示） -->
      <div
        v-if="isDevelopment"
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
      >
        <h3 class="text-sm font-semibold text-yellow-800 mb-2">
          棋盘尺寸调试信息
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span class="font-medium">棋盘大小:</span>
            {{ boardContainerSize }}px
          </div>
          <div>
            <span class="font-medium">边框宽度:</span> {{ boardBorderWidth }}px
          </div>
          <div>
            <span class="font-medium">落子区:</span> {{ playableAreaSize }}px
          </div>
          <div>
            <span class="font-medium">网格间距:</span>
            {{ gridSpacing.toFixed(1) }}px
          </div>
          <div>
            <span class="font-medium">棋子半径:</span> {{ pieceRadius }}px
          </div>
          <div>
            <span class="font-medium">棋子直径:</span> {{ pieceDiameter }}px
          </div>
          <div>
            <span class="font-medium">棋盘路数:</span> {{ boardSize }}路
          </div>
          <div><span class="font-medium">设备类型:</span> {{ deviceType }}</div>
        </div>
      </div>

      <!-- 游戏棋盘 -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div class="flex justify-center w-full">
          <div class="relative">
            <!-- 棋盘容器 - 固定大小 -->
            <div
              class="bg-amber-100 relative board-container"
              :style="{
                width: `${boardContainerSize}px`,
                height: `${boardContainerSize}px`,
                border: `${boardBorderWidth}px solid #8B4513`,
              }"
            >
              <!-- 棋盘网格线 -->
              <svg
                class="absolute inset-0 w-full h-full"
                :viewBox="`0 0 ${boardContainerSize} ${boardContainerSize}`"
              >
                <!-- 垂直线 -->
                <line
                  v-for="i in boardSize"
                  :key="`v-${i}`"
                  :x1="boardBorderWidth + i * gridSpacing"
                  :y1="boardBorderWidth + gridSpacing"
                  :x2="boardBorderWidth + i * gridSpacing"
                  :y2="boardContainerSize - boardBorderWidth - gridSpacing"
                  class="grid-line"
                />
                <!-- 水平线 -->
                <line
                  v-for="i in boardSize"
                  :key="`h-${i}`"
                  :x1="boardBorderWidth + gridSpacing"
                  :y1="boardBorderWidth + i * gridSpacing"
                  :x2="boardContainerSize - boardBorderWidth - gridSpacing"
                  :y2="boardBorderWidth + i * gridSpacing"
                  class="grid-line"
                />
              </svg>

              <!-- 棋子 -->
              <div
                v-for="(row, rowIndex) in board"
                :key="rowIndex"
                class="absolute"
                :style="{
                  top: `${
                    boardBorderWidth + (rowIndex + 1) * gridSpacing - pieceRadius
                  }px`,
                }"
              >
                <div
                  v-for="(cell, colIndex) in row"
                  :key="colIndex"
                  class="absolute flex items-center justify-center cursor-pointer board-cell"
                  :style="{
                    left: `${
                      boardBorderWidth + (colIndex + 1) * gridSpacing - pieceRadius
                    }px`,
                    width: `${pieceDiameter}px`,
                    height: `${pieceDiameter}px`,
                  }"
                  @click="handleMoveClick(rowIndex, colIndex)"
                >
                  <div
                    v-if="cell"
                    class="rounded-full shadow-lg piece"
                    :style="{
                      width: `${pieceDiameter}px`,
                      height: `${pieceDiameter}px`,
                    }"
                    :class="
                      cell === 'black'
                        ? 'bg-black'
                        : 'bg-white border-2 border-gray-300'
                    "
                  ></div>
                  <!-- 待确认落子的虚影 -->
                  <div
                    v-if="isPendingMove(rowIndex, colIndex)"
                    class="rounded-full border-2 border-dashed animate-pulse"
                    :style="{
                      width: `${pieceDiameter}px`,
                      height: `${pieceDiameter}px`,
                    }"
                    :class="
                      game?.currentTurn === game?.player1Id
                        ? 'border-black bg-black bg-opacity-20'
                        : 'border-gray-400 bg-white bg-opacity-20'
                    "
                  ></div>
                  <!-- 最后一步棋的标记 -->
                  <div
                    v-if="isLastMove(rowIndex, colIndex)"
                    class="absolute w-2 h-2 bg-red-500 rounded-full last-move-marker"
                    :style="{
                      top: `${pieceRadius - 4}px`,
                      left: `${pieceRadius - 4}px`,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏状态提示 -->
      <div
        v-if="gameMessage"
        class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <p class="text-blue-800">{{ gameMessage }}</p>
      </div>

      <!-- 获胜提示 -->
      <div
        v-if="showWinModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 class="text-2xl font-bold text-center mb-4">游戏结束</h2>
          <p class="text-center mb-6">{{ winMessage }}</p>
          <div class="flex gap-4">
            <button
              @click="createNewGame"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200"
            >
              新游戏
            </button>
            <button
              @click="closeWinModal"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors duration-200"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { api } from "@/lib/api";

const router = useRouter();
const route = useRoute();

// 响应式数据
const game = ref<any>(null);
const board = ref<any[][]>([]);
const boardSize = 15; // 15路棋盘

// 棋盘尺寸计算 - 固定大小
const boardContainerSize = computed(() => {
  let width = 400;
  if (typeof window !== "undefined") {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (screenWidth < 768) {
      // 移动端：以宽度为主，最大400px
      width = Math.min(screenWidth - 48, 400);
    } else {
      // PC端：以高度为主，最大480px
      width = Math.min(screenHeight * 0.6, 480);
    }
  }
  return Math.floor(width / (boardSize + 1)) * (boardSize + 1) + 4;
});

// 棋盘边框宽度
const boardBorderWidth = computed(() => {
  return 2; // 2
});

// 落子区 + 边框宽度
const tmpPlayableAreaSize = computed(() => {
  return boardContainerSize.value - 2 * boardBorderWidth.value;
});

// 网格间距（路与路之间的间隔）
const gridSpacing = computed(() => {
  return tmpPlayableAreaSize.value / (boardSize + 1); // 边缘保留一个棋子的宽度
});

// 落子区大小（减去边框后的可用区域）
const playableAreaSize = computed(() => {
  return tmpPlayableAreaSize.value - 2 * gridSpacing.value;
});

// 棋子半径
const pieceRadius = computed(() => {
  return Math.floor(gridSpacing.value * 0.45); // 棋子半径为网格间距的45%
});

// 棋子直径
const pieceDiameter = computed(() => {
  return pieceRadius.value * 2;
});

// 开发环境检测
const isDevelopment = computed(() => {
  return (
    typeof window !== "undefined" && window.location.hostname === "localhost"
  );
});

// 设备类型检测
const deviceType = computed(() => {
  if (typeof window !== "undefined") {
    return window.innerWidth < 768 ? "移动端" : "PC端";
  }
  return "未知";
});

const gameMessage = ref("");
const showWinModal = ref(false);
const winMessage = ref("");
const pollingInterval = ref<any>(null);
const lastUpdateTime = ref(0);

// 二次确认相关
const pendingMove = ref<{ row: number; col: number } | null>(null);
const pendingTimeout = ref<any>(null);
const PENDING_DURATION = 3000; // 3秒确认时间

// 从缓存中获取用户信息
const user = ref<any>(null);

// 从 localStorage 获取用户信息
const loadUserFromCache = () => {
  const userInfoStr = localStorage.getItem("user-info");
  if (userInfoStr) {
    user.value = JSON.parse(userInfoStr);
  }
};

// 计算属性
const currentTurnText = computed(() => {
  if (!game.value || !game.value.currentTurn) return "";

  if (game.value.currentTurn === game.value.player1Id) {
    return `${game.value.player1.name} (黑子)`;
  } else {
    return `${game.value.player2.name} (白子)`;
  }
});

const isMyTurn = computed(() => {
  return game.value?.currentTurn === user.value?.id;
});

const canMakeMove = computed(() => {
  return game.value?.status === "PLAYING" && isMyTurn.value;
});

// 检查是否是最后一步棋
const isLastMove = (row: number, col: number) => {
  if (!game.value?.lastMove) return false;
  return game.value.lastMove.row === row && game.value.lastMove.col === col;
};

// 检查是否是待确认的落子
const isPendingMove = (row: number, col: number) => {
  return pendingMove.value?.row === row && pendingMove.value?.col === col;
};

// 初始化棋盘
const initBoard = () => {
  board.value = Array(boardSize)
    .fill(null)
    .map(() => Array(boardSize).fill(null));
};

// 更新棋盘
const updateBoard = (newBoard: any[][]) => {
  board.value = newBoard;
};

// 轮询状态控制
let isPolling = false;

// 开始轮询
const startPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }

  // 如果游戏已结束，不启动轮询
  if (game.value?.status === "FINISHED") {
    return;
  }

  // 如果现在是自己的回合，不启动轮询
  if (game.value?.currentTurn === user.value?.id) {
    return;
  }

  // 立即执行一次
  pollGameState();

  // 设置2秒轮询间隔
  pollingInterval.value = setInterval(() => {
    pollGameState();
  }, 2000);
};

// 停止轮询
const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
  isPolling = false;
};

// 轮询游戏状态
const pollGameState = async () => {
  // 防止重复调用
  if (isPolling) {
    return;
  }

  // 如果是自己的回合，不需要轮询
  if (game.value?.currentTurn === user.value?.id) {
    return;
  }

  isPolling = true;

  try {
    const gameData = await api.game.queryById(route.params.id as string);
    if (gameData) {
      // 检查是否有更新
      const currentTime = new Date(gameData.updatedAt).getTime();
      if (currentTime > lastUpdateTime.value) {
        lastUpdateTime.value = currentTime;
        game.value = gameData;
        updateBoard(gameData.board);

        // 检查游戏状态
        if (gameData.status === "FINISHED") {
          handleGameEnd(gameData);
          stopPolling(); // 游戏结束，停止轮询
          return;
        }
      }
    }
  } catch (error) {
    console.error("轮询游戏状态失败:", error);
  } finally {
    isPolling = false;
  }
};

// 处理游戏结束
const handleGameEnd = (gameData: any) => {
  if (gameData.winner === user.value?.id) {
    winMessage.value = "恭喜！你获胜了！";
  } else if (gameData.winner) {
    const winnerName =
      gameData.winner === gameData.player1Id
        ? gameData.player1.name
        : gameData.player2.name;
    winMessage.value = `${winnerName} 获胜了！`;
  } else {
    winMessage.value = "游戏结束";
  }
  showWinModal.value = true;
};

// 清除待确认的落子
const clearPendingMove = () => {
  if (pendingTimeout.value) {
    clearTimeout(pendingTimeout.value);
    pendingTimeout.value = null;
  }
  pendingMove.value = null;
};

// 处理落子点击
const handleMoveClick = async (row: number, col: number) => {
  if (!canMakeMove.value) {
    gameMessage.value = "不是你的回合或游戏未开始";
    return;
  }

  // 检查位置是否已被占用
  if (board.value[row][col] !== null) {
    gameMessage.value = "该位置已被占用";
    return;
  }

  // 如果是第一次点击该位置
  if (
    !pendingMove.value ||
    pendingMove.value.row !== row ||
    pendingMove.value.col !== col
  ) {
    // 清除之前的待确认落子
    clearPendingMove();

    // 设置新的待确认落子
    pendingMove.value = { row, col };

    // 设置3秒后自动清除
    pendingTimeout.value = setTimeout(() => {
      clearPendingMove();
      gameMessage.value = "落子确认超时，请重新点击";
    }, PENDING_DURATION);

    gameMessage.value = "再次点击确认落子";
    return;
  }

  // 如果是第二次点击同一位置，执行落子
  clearPendingMove();

  // 暂停轮询（因为此时是自己的回合，对方不能落子）
  stopPolling();

  // 乐观更新：立即更新本地棋盘状态
  const playerPiece =
    game.value?.currentTurn === game.value?.player1Id ? "black" : "white";
  board.value[row][col] = playerPiece;

  // 更新游戏状态
  if (game.value) {
    game.value.currentTurn =
      game.value.currentTurn === game.value.player1Id
        ? game.value.player2Id
        : game.value.player1Id;
  }

  try {
    const response = await api.game.move(
      route.params.id as string,
      user.value.id,
      row,
      col
    );

    if (response.isWin) {
      handleGameEnd(response.game);
    } else {
      // 落子成功，重新启动轮询
      startPolling();
    }

    gameMessage.value = "";
  } catch (error: any) {
    console.error("下棋失败:", error);
    gameMessage.value = error.data?.error || "下棋失败";

    // 落子失败，回滚本地状态
    board.value[row][col] = null;
    if (game.value) {
      game.value.currentTurn =
        game.value.currentTurn === game.value.player1Id
          ? game.value.player2Id
          : game.value.player1Id;
    }

    // 重新启动轮询
    startPolling();
  }
};

// 创建新游戏
const createNewGame = async () => {
  try {
    const newGame = await api.game.create(user.value?.id || "", 15);
    if (newGame) {
      router.push(`/gomoku/game/${newGame.id}`);
    }
  } catch (error) {
    console.error("创建新游戏失败:", error);
  }
};

// 关闭获胜弹窗
const closeWinModal = () => {
  showWinModal.value = false;
  winMessage.value = "";
};

// 返回列表
const goBack = () => {
  stopPolling(); // 确保停止轮询
  router.push("/gomoku");
};

// 窗口大小变化处理
const handleResize = () => {
  // 触发响应式更新
  if (typeof window !== "undefined") {
    // 强制重新计算棋盘尺寸
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    console.log("窗口大小变化:", {
      screenWidth,
      screenHeight,
      boardContainerSize: boardContainerSize.value,
      gridSpacing: gridSpacing.value,
      pieceRadius: pieceRadius.value,
    });
  }
};

// 组件挂载
onMounted(async () => {
  loadUserFromCache();
  initBoard();

  // 添加窗口大小变化监听
  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize);
  }

  // 调试信息：显示棋盘尺寸计算
  console.log("棋盘尺寸计算:", {
    boardSize,
    boardContainerSize: boardContainerSize.value,
    boardBorderWidth: boardBorderWidth.value,
    playableAreaSize: playableAreaSize.value,
    gridSpacing: gridSpacing.value,
    pieceRadius: pieceRadius.value,
    pieceDiameter: pieceDiameter.value,
  });

  try {
    // 加载游戏数据
    const gameData = await api.game.queryById(route.params.id as string);
    if (gameData) {
      game.value = gameData;
      updateBoard(gameData.board);
      lastUpdateTime.value = new Date(gameData.updatedAt).getTime();

      // 游戏未结束，开始轮询
      if (gameData.status !== "FINISHED") {
        startPolling();
      }
    }
  } catch (error) {
    console.error("加载游戏失败:", error);
    gameMessage.value = "加载游戏失败";
  }
});

// 组件卸载前停止轮询
onBeforeUnmount(() => {
  console.log("组件卸载前停止轮询");
  stopPolling();
  clearPendingMove();

  // 移除窗口大小变化监听
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize);
  }
});

// 组件卸载
onUnmounted(() => {
  stopPolling();
  clearPendingMove();

  // 移除窗口大小变化监听
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize);
  }
});
</script>

<style scoped>
/* 棋盘样式 */
.board-cell {
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-cell:hover {
  background-color: rgba(139, 69, 19, 0.1);
  transform: scale(1.05);
}

/* 棋子样式 */
.piece {
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.piece:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 棋盘容器样式 */
.board-container {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

/* 网格线样式 */
.grid-line {
  stroke: #8b4513;
  stroke-width: 1;
  opacity: 0.8;
}

/* 最后一步标记样式 */
.last-move-marker {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}
</style>
