<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header
      class="container mx-auto px-1 py-6 flex justify-between items-center"
    >
      <div>
        <h1 class="text-3xl font-bold text-blue-600 mb-1">Nexus of Notions</h1>
        <p class="text-gray-600 text-sm">奇思妙想的交汇点</p>
      </div>
      <div class="text-right">
        <!-- 用户信息显示 -->
        <div v-if="userInfo" class="mb-2">
          <div class="text-sm text-gray-600">
            <span class="font-medium text-blue-600">{{ userInfo.name }}</span>
            <span class="mx-2">•</span>
            <span>{{ userInfo.email }}</span>
          </div>
          <button
            @click="handleLogout"
            class="text-xs text-gray-500 hover:text-red-600 transition-colors duration-200"
          >
            退出登录
          </button>
        </div>
        <!-- 未登录状态 -->
        <div v-else class="mb-2">
          <NuxtLink
            to="/login?redirect=/"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            登录
          </NuxtLink>
        </div>
        <div class="text-gray-500 text-sm">
          {{ currentDate }}
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          欢迎来到奇思妙想的世界
        </h2>
        <p class="text-gray-600 text-lg max-w-4xl mx-auto leading-relaxed">
          这里是你各种想法的交汇点，每个功能模块都是你脑海中的一个奇思妙想，通过技术实现为
          现实，让我们一起探索无限可能！
        </p>
      </div>

      <!-- Feature Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- Weight Recording System Card -->
        <div
          class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <BarChart3Icon class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">体重记录系统</h3>
            <p class="text-blue-600 font-medium mb-4">数据健康优化</p>
            <p class="text-gray-600 mb-6 leading-relaxed">
              记录体重变化，可视化趋势分析，帮助你保持健康的生活方式。
            </p>
            <button
              @click="handleWeightTrackerClick"
              class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              开始使用
            </button>
          </div>
        </div>

        <!-- Gomoku Game Card -->
        <div
          class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <Gamepad2Icon class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">五子棋小游戏</h3>
            <p class="text-green-600 font-medium mb-4">实时对战</p>
            <p class="text-gray-600 mb-6 leading-relaxed">
              与朋友一起享受经典的五子棋对战，支持实时更新和自动重连。
            </p>
            <button
              @click="handleGomokuClick"
              class="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              开始游戏
            </button>
          </div>
        </div>

        <!-- Search Card -->
        <div
          class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <SearchIcon class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">影视搜索</h3>
            <p class="text-purple-600 font-medium mb-4">搜索影视</p>
            <p class="text-gray-600 mb-6 leading-relaxed">
              使用影视搜索，可以方便进行的搜索影视等操作。
            </p>
            <button
              @click="handleSearchClick"
              class="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              开始搜索
            </button>
          </div>
        </div>

        <!-- Crypto Tools Card -->
        <div
          class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <KeyRoundIcon class="w-6 h-6 text-yellow-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">加密工具箱</h3>
            <p class="text-yellow-600 font-medium mb-4">安全计算</p>
            <p class="text-gray-600 mb-6 leading-relaxed">
              提供 RSA、国密等算法的密钥生成、加密和解密功能。
            </p>
            <button
              @click="handleCryptoClick"
              class="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              打开工具
            </button>
          </div>
        </div>

        <!-- Telegram Chat Card -->
        <div
          class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <MessageCircleIcon class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">
              Telegram 客户端
            </h3>
            <p class="text-purple-600 font-medium mb-4">聊天客户端</p>
            <p class="text-gray-600 mb-6 leading-relaxed">
              使用 Telegram 客户端，可以方便进行的聊天、搜索频道等操作。
            </p>
            <button
              @click="handleTelegramClick"
              class="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              进入客户端
            </button>
          </div>
        </div>

        <!-- New Ideas Card -->
        <div
          class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-dashed border-gray-200"
        >
          <div class="p-6 text-center">
            <div
              class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
              <PlusIcon class="w-6 h-6 text-gray-400" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">新想法</h3>
            <p class="text-gray-400 font-medium mb-4">等待实现</p>
            <p class="text-gray-400 mb-6 leading-relaxed">
              你的下一个奇思妙想将在这里实现...
            </p>
            <div
              class="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-400 font-medium"
            >
              敬请期待
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Features Section -->
      <div class="mt-20 text-center">
        <h3 class="text-2xl font-bold text-gray-800 mb-8">探索更多可能性</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div
            v-for="feature in additionalFeatures"
            :key="feature.id"
            class="bg-white/60 backdrop-blur-sm rounded-lg p-4 hover:bg-white/80 transition-all duration-200 cursor-pointer"
            @click="handleFeatureClick(feature)"
          >
            <component
              :is="feature.icon"
              class="w-8 h-8 text-blue-500 mx-auto mb-2"
            />
            <h4 class="font-medium text-gray-800 text-sm">
              {{ feature.name }}
            </h4>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 text-center">
      <p class="text-gray-500 text-sm">
        © 2024 Nexus of Notions. 奇思妙想的交汇点。
      </p>
      <div class="mt-4 flex justify-center space-x-6">
        <a
          href="#"
          class="text-gray-400 hover:text-blue-600 transition-colors duration-200"
        >
          <HeartIcon class="w-5 h-5" />
        </a>
        <a
          href="#"
          class="text-gray-400 hover:text-blue-600 transition-colors duration-200"
        >
          <StarIcon class="w-5 h-5" />
        </a>
        <a
          href="#"
          class="text-gray-400 hover:text-blue-600 transition-colors duration-200"
        >
          <ShareIcon class="w-5 h-5" />
        </a>
      </div>
    </footer>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  BarChart3 as BarChart3Icon,
  Plus as PlusIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Share as ShareIcon,
  Gamepad2 as Gamepad2Icon,
  Search as SearchIcon,
  MessageCircle as MessageCircleIcon,
  KeyRound as KeyRoundIcon,
  Calendar,
  BookOpen,
  Target,
  Lightbulb,
} from "lucide-vue-next";

// Meta tags for SEO
useHead({
  title: "Nexus of Notions - 奇思妙想的交汇点",
  meta: [
    {
      name: "description",
      content: "欢迎来到奇思妙想的世界，这里是你各种想法的交汇点",
    },
    { name: "keywords", content: "ideas, creativity, innovation, 创意, 想法" },
  ],
});

// Reactive data
const showToast = ref(false);
const toastMessage = ref("");
const userInfo = ref(null);

// Computed properties
const currentDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const weekday = weekdays[now.getDay()];

  return `${year}年${month}月${day}日${weekday}`;
});

const additionalFeatures = ref([
  { id: 1, name: "日程管理", icon: Calendar },
  { id: 2, name: "学习笔记", icon: BookOpen },
  { id: 3, name: "目标追踪", icon: Target },
  { id: 4, name: "灵感收集", icon: Lightbulb },
]);

// Methods
const handleFeatureClick = (feature) => {
  showToastMessage(`${feature.name}功能正在开发中...`);
};

const showToastMessage = (message) => {
  toastMessage.value = message;
  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// 检查用户登录状态
const checkUserLogin = () => {
  const userInfoStr = localStorage.getItem("user-info");

  if (userInfoStr) {
    userInfo.value = JSON.parse(userInfoStr);
  }
};

// 退出登录
const handleLogout = () => {
  localStorage.removeItem("user-info");
  userInfo.value = null;
  showToastMessage("已退出登录");
};

// 处理体重记录系统点击
const handleWeightTrackerClick = () => {
  handleClick("/weight-tracker");
};

// 处理五子棋游戏点击
const handleGomokuClick = () => {
  handleClick("/gomoku");
};

// 处理影视搜索点击
const handleSearchClick = () => {
  handleClick("/search");
};

// 处理 Telegram 客户端点击
const handleTelegramClick = () => {
  handleClick("/coming-soon");
};

// 处理加密工具箱点击
const handleCryptoClick = () => {
  handleClick("/crypto");
};

// 处理点击
const handleClick = (path) => {
  if (userInfo.value) {
    // 用户已登录，跳转到指定页面
    navigateTo(path);
  } else {
    // 用户未登录，跳转到登录页面，并指定登录后跳转到指定页面
    navigateTo(`/login?redirect=${path}`);
  }
};

// Lifecycle
onMounted(() => {
  console.log("Nexus of Notions 页面已加载");
  checkUserLogin();
});
</script>

<style scoped>
/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Focus styles for accessibility */
button:focus,
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
