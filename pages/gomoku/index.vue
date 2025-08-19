<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">五子棋小游戏</h1>
        <p class="text-gray-600">与朋友一起享受经典的五子棋对战</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-center mb-8 gap-4">
        <button
          @click="createGame"
          :disabled="isCreating"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Icon name="lucide:plus" class="w-5 h-5" />
          {{ isCreating ? "创建中..." : "创建新游戏" }}
        </button>
        <button
          @click="startAIGame"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Icon name="lucide:cpu" class="w-5 h-5" />
          AI 对战
        </button>
      </div>

      <!-- 游戏列表 -->
      <div class="grid gap-6">
        <!-- 我的游戏 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2
            class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
          >
            <Icon name="lucide:gamepad-2" class="w-5 h-5" />
            我的游戏
          </h2>

          <div
            v-if="myGames.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <Icon
              name="lucide:gamepad-2"
              class="w-16 h-16 mx-auto mb-4 text-gray-300"
            />
            <p>还没有游戏记录</p>
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="game in myGames"
              :key="game.id"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p class="font-medium text-gray-900">
                    {{ game.name }} "等待加入"
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(game.createdAt) }}
                  </p>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="viewGame(game.id)"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors duration-200"
                >
                  查看
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 可加入的游戏 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2
            class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
          >
            <Icon name="lucide:users" class="w-5 h-5" />
            可加入的游戏
          </h2>

          <div
            v-if="availableGames.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <Icon
              name="lucide:users"
              class="w-16 h-16 mx-auto mb-4 text-gray-300"
            />
            <p>暂时没有可加入的游戏</p>
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="game in availableGames"
              :key="game.id"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p class="font-medium text-gray-900">
                    {{ game.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDate(game.createdAt) }}
                  </p>
                </div>
                <GameStatusBadge :status="game.status" />
              </div>

              <button
                @click="joinGame(game.id)"
                :disabled="game.status !== 'WAITING'"
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm py-2 px-3 rounded transition-colors duration-200"
              >
                "加入游戏"
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/lib/api";
import { useUser } from "@/composables/useUser";

const router = useRouter();

// 响应式数据
const myGames = ref<any[]>([]);
const availableGames = ref<any[]>([]);
const isCreating = ref(false);

// 用户状态管理
const user = useUser().user;

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 创建游戏
const createGame = async () => {
  try {
    isCreating.value = true;
    const game = await api.game.create(user!.id, 15);

    if (game) {
      // 跳转到游戏页面
      viewGame(game.id);
    }
  } catch (error) {
    console.error("创建游戏失败:", error);
  } finally {
    isCreating.value = false;
  }
};

// 加入游戏
const joinGame = async (gameId: string) => {
  try {
    const game = await api.game.join(gameId, user!.id);

    if (game) {
      // 跳转到游戏页面
      viewGame(gameId);
    }
  } catch (error) {
    console.error("加入游戏失败:", error);
  }
};

// 查看游戏
const viewGame = (gameId: string) => {
  router.push(`/gomoku/game/${gameId}`);
};

// 跳转到AI对战页面
const startAIGame = () => {
  router.push("/gomoku/ai");
};

// 加载游戏列表
const loadGames = async () => {
  try {
    // 加载我正在进行中的游戏
    const myGamesData = await api.game.queryUserGames(user!.id, "PLAYING");
    if (myGamesData) {
      myGames.value = myGamesData;
    }

    // 加载可加入的游戏
    const availableGamesData = await api.game.queryAvailableGames("WAITING");
    if (availableGamesData) {
      availableGames.value = availableGamesData;
    }
  } catch (error) {
    console.error("加载游戏列表失败:", error);
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadGames();
});
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>
