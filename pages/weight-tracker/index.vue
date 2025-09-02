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
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <NuxtLink
          to="/weight-tracker/compare"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Users class="w-4 h-4" />
          用户对比
        </NuxtLink>
        <div class="text-right text-gray-500 text-sm">
          {{ currentDate }}
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <!-- Left: Add Record -->
        <div class="xl:col-span-1 order-2 xl:order-1">
          <div class="sticky top-4">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <AddWeightForm @record-added="refreshData" />
            </div>
          </div>
        </div>

        <!-- Right: Data Display -->
        <div class="xl:col-span-2 order-1 xl:order-2 space-y-6">
          <!-- Weight Chart -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <WeightChart :user-id="data.user.id" />
          </div>

          <!-- Weight Table -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <WeightTable :user-id="data.user.id" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ArrowLeft, Users } from "lucide-vue-next";

// Reactive data
const { data } = useAuth();

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
</script>
