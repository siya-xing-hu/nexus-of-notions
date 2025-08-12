<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header
      class="container mx-auto px-4 py-6 flex justify-between items-start"
    >
      <div class="flex items-center">
        <NuxtLink
          to="/weight-tracker"
          class="mr-4 text-gray-400 hover:text-blue-600 transition-colors duration-200"
        >
          <ArrowLeft class="w-6 h-6" />
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-bold text-green-600 mb-1">用户体重对比</h1>
          <p class="text-gray-600 text-sm">与目标用户进行体重数据对比</p>
          <p v-if="currentUser" class="text-sm text-gray-500 mt-1">
            当前用户：{{ currentUser.name }} ({{ currentUser.email }})
          </p>
        </div>
      </div>
      <div class="text-right text-gray-500 text-sm">
        {{ currentDate }}
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Input Form -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            选择目标用户
          </h2>
          <div class="flex gap-4">
            <select
              v-model="targetUserId"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              :disabled="isLoading || isUsersLoading"
            >
              <option value="">请选择目标用户</option>
              <option
                v-for="user in allUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
            <button
              @click="compareUsers"
              :disabled="!targetUserId || isLoading"
              class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Search v-if="!isLoading" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
              {{ isLoading ? "对比中..." : "开始对比" }}
            </button>
          </div>
          <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
          <p v-if="isUsersLoading" class="text-blue-500 text-sm mt-2">正在加载用户列表...</p>
        </div>

        <!-- Comparison Results -->
        <div v-if="targetUser && comparisonData" class="space-y-6">
          <!-- User Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Current User Card -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-blue-600 mb-3">当前用户</h3>
              <div class="space-y-2">
                <p>
                  <span class="font-medium">姓名：</span>{{ currentUser.name }}
                </p>
                <p>
                  <span class="font-medium">邮箱：</span>{{ currentUser.email }}
                </p>
                <p>
                  <span class="font-medium">记录数量：</span
                  >{{ comparisonData.currentUser.recordCount }} 条
                </p>
                <p>
                  <span class="font-medium">平均体重：</span
                  >{{ comparisonData.currentUser.averageWeight }} kg
                </p>
                <p>
                  <span class="font-medium">最高体重：</span
                  >{{ comparisonData.currentUser.maxWeight }} kg
                </p>
                <p>
                  <span class="font-medium">最低体重：</span
                  >{{ comparisonData.currentUser.minWeight }} kg
                </p>
              </div>
            </div>

            <!-- Target User Card -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-semibold text-green-600 mb-3">
                目标用户
              </h3>
              <div class="space-y-2">
                <p>
                  <span class="font-medium">姓名：</span>{{ targetUser.name }}
                </p>
                <p>
                  <span class="font-medium">邮箱：</span>{{ targetUser.email }}
                </p>
                <p>
                  <span class="font-medium">记录数量：</span
                  >{{ comparisonData.targetUser.recordCount }} 条
                </p>
                <p>
                  <span class="font-medium">平均体重：</span
                  >{{ comparisonData.targetUser.averageWeight }} kg
                </p>
                <p>
                  <span class="font-medium">最高体重：</span
                  >{{ comparisonData.targetUser.maxWeight }} kg
                </p>
                <p>
                  <span class="font-medium">最低体重：</span
                  >{{ comparisonData.targetUser.minWeight }} kg
                </p>
              </div>
            </div>
          </div>

          <!-- Comparison Chart -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              体重趋势对比
            </h3>
            <div class="h-80">
              <WeightComparisonChart
                :current-user-data="comparisonData.currentUser.records"
                :target-user-data="comparisonData.targetUser.records"
                :current-user-name="currentUser.name"
                :target-user-name="targetUser.name"
              />
            </div>
          </div>

          <!-- Statistics Comparison -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              数据统计对比
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <p class="text-2xl font-bold text-blue-600">
                  {{ comparisonData.currentUser.averageWeight }}
                </p>
                <p class="text-sm text-gray-600">当前用户平均体重 (kg)</p>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <p class="text-2xl font-bold text-green-600">
                  {{ comparisonData.targetUser.averageWeight }}
                </p>
                <p class="text-sm text-gray-600">目标用户平均体重 (kg)</p>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <p
                  class="text-2xl font-bold"
                  :class="
                    weightDifference >= 0 ? 'text-red-600' : 'text-green-600'
                  "
                >
                  {{ weightDifference >= 0 ? "+" : "" }}{{ weightDifference }}
                </p>
                <p class="text-sm text-gray-600">体重差异 (kg)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div
          v-else-if="!isLoading && !targetUser"
          class="bg-white rounded-lg shadow-lg p-12 text-center"
        >
          <Users class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-gray-600 mb-2">开始用户对比</h3>
          <p class="text-gray-500">请输入目标用户的邮箱地址来开始对比分析</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ArrowLeft, Search, Loader2, Users } from "lucide-vue-next";
import api from "@/lib/api";

// Reactive data
const currentUser = ref(null);
const targetUserId = ref("");
const allUsers = ref([]);
const targetUser = ref(null);
const comparisonData = ref(null);
const isLoading = ref(false);
const isUsersLoading = ref(false);
const error = ref("");

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

const weightDifference = computed(() => {
  if (!comparisonData.value) return 0;
  return (
    comparisonData.value.currentUser.averageWeight -
    comparisonData.value.targetUser.averageWeight
  ).toFixed(1);
});

// Methods
const loadAllUsers = async () => {
  isUsersLoading.value = true;
  try {
    const users = await api.user.queryAll();
    // 过滤掉当前用户
    allUsers.value = users.filter(user => user.id !== currentUser.value.id);
  } catch (err) {
    console.error('加载用户列表失败:', err);
    error.value = "加载用户列表失败";
  } finally {
    isUsersLoading.value = false;
  }
};

const compareUsers = async () => {
  if (!targetUserId.value) {
    error.value = "请选择目标用户";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    const targetUserData = allUsers.value.find(user => user.id === targetUserId.value);
    console.log('目标用户数据:', targetUserData);
    
    if (!targetUserData) {
      error.value = "目标用户不存在";
      isLoading.value = false;
      return;
    }

    const currentUserRecords = await api.weight.query(currentUser.value.id);
    const targetUserRecords = await api.weight.query(targetUserData.id);
    
    console.log('当前用户记录:', currentUserRecords);
    console.log('目标用户记录:', targetUserRecords);

    // 计算统计数据
    const currentUserStats = calculateUserStats(currentUserRecords);
    const targetUserStats = calculateUserStats(targetUserRecords);

    targetUser.value = targetUserData;
    comparisonData.value = {
      currentUser: {
        recordCount: currentUserRecords.length,
        averageWeight: currentUserStats.averageWeight,
        maxWeight: currentUserStats.maxWeight,
        minWeight: currentUserStats.minWeight,
        records: currentUserRecords.map(record => ({
          date: record.date,
          weight: record.weight
        }))
      },
      targetUser: {
        recordCount: targetUserRecords.length,
        averageWeight: targetUserStats.averageWeight,
        maxWeight: targetUserStats.maxWeight,
        minWeight: targetUserStats.minWeight,
        records: targetUserRecords.map(record => ({
          date: record.date,
          weight: record.weight
        }))
      }
    };
  } catch (err) {
    console.error('对比失败:', err);
    error.value = "对比失败，请重试";
    targetUser.value = null;
    comparisonData.value = null;
  } finally {
    isLoading.value = false;
  }
};

// 计算用户统计数据的辅助函数
const calculateUserStats = (records) => {
  if (records.length === 0) {
    return {
      averageWeight: 0,
      maxWeight: 0,
      minWeight: 0
    };
  }

  const weights = records.map(record => record.weight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  return {
    averageWeight: (totalWeight / weights.length).toFixed(1),
    maxWeight: Math.max(...weights).toFixed(1),
    minWeight: Math.min(...weights).toFixed(1)
  };
};

// Lifecycle
onMounted(async () => {
  // 检查用户登录状态
  const userInfoStr = localStorage.getItem("user-info");

  if (userInfoStr) {
    currentUser.value = JSON.parse(userInfoStr);
    console.log("用户对比页面已加载");
    // 加载所有用户列表
    await loadAllUsers();
  } else {
    // 用户未登录，跳转到首页
    navigateTo("/");
  }
});
</script>
