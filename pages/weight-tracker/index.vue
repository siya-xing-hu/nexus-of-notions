<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header
      class="container mx-auto px-4 py-6 flex justify-between items-start"
    >
      <div class="flex items-center">
        <NuxtLink
          to="/"
          class="mr-4 text-gray-400 hover:text-blue-600 transition-colors duration-200"
        >
          <ArrowLeft class="w-6 h-6" />
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-bold text-blue-600 mb-1">体重记录系统</h1>
          <p class="text-gray-600 text-sm">数据健康优化</p>
          <p v-if="currentUser" class="text-sm text-gray-500 mt-1">
            欢迎，{{ currentUser.name }} ({{ currentUser.email }})
          </p>
        </div>
      </div>
      <div class="text-right text-gray-500 text-sm">
        {{ currentDate }}
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <!-- Left: Add Record -->
        <div class="xl:col-span-1 order-2 xl:order-1">
          <div class="sticky top-4">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <AddWeightForm
                v-if="currentUser"
                :user-info="currentUser"
                @record-added="refreshData"
              />
            </div>
          </div>
        </div>

        <!-- Right: Data Display -->
        <div class="xl:col-span-2 order-1 xl:order-2 space-y-6">
          <!-- Weight Chart -->
          <div v-if="currentUser" class="bg-white rounded-lg shadow-lg p-6">
            <WeightChart :user-id="currentUser.id" />
          </div>

          <!-- Weight Table -->
          <div v-if="currentUser" class="bg-white rounded-lg shadow-lg p-6">
            <WeightTable :user-id="currentUser.id" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ArrowLeft } from "lucide-vue-next";

// Reactive data
const currentUser = ref(null);

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

// Methods
const refreshData = () => {
  // 触发子组件刷新数据
  window.location.reload();
};

// Lifecycle
onMounted(() => {
  // 检查用户登录状态
  const userInfoStr = localStorage.getItem("user-info");

  if (userInfoStr) {
    currentUser.value = JSON.parse(userInfoStr);
    console.log("体重记录系统页面已加载");
  } else {
    // 用户未登录，跳转到首页
    navigateTo("/");
  }
});
</script>
