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
          <p class="text-sm text-gray-500 mt-1">
            当前用户：{{ data.user.name }} ({{ data.user.email }})
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
        <div class="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2
            class="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4"
          >
            选择目标用户
          </h2>
          <div class="flex flex-col md:flex-row gap-3 md:gap-4">
            <select
              v-model="targetUserId"
              class="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
              :disabled="isLoading || isUsersLoading"
            >
              <option value="">请选择目标用户</option>
              <option v-for="user in allUsers" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
            <button
              @click="compareUsers"
              :disabled="!targetUserId || isLoading"
              class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 md:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Search v-if="!isLoading" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
              <span class="hidden sm:inline">{{
                isLoading ? "对比中..." : "开始对比"
              }}</span>
              <span class="sm:hidden">{{ isLoading ? "对比中" : "对比" }}</span>
            </button>
          </div>
          <p
            v-if="isUsersLoading"
            class="text-blue-500 text-xs md:text-sm mt-2"
          >
            正在加载用户列表...
          </p>
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
                  <span class="font-medium">姓名：</span>{{ data.user.name }}
                </p>
                <p>
                  <span class="font-medium">邮箱：</span>{{ data.user.email }}
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
            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4"
            >
              <h3 class="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">
                体重趋势对比
              </h3>
              <div class="flex items-center gap-3">
                <label class="text-sm font-medium text-gray-700"
                  >选择月份：</label
                >
                <select
                  v-model="selectedMonth"
                  class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option
                    v-for="month in availableMonths"
                    :key="month"
                    :value="month"
                  >
                    {{ formatMonth(month) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="h-80">
              <WeightComparisonChart
                v-if="filteredComparisonData"
                :current-user-data="filteredComparisonData.currentUser.records"
                :target-user-data="filteredComparisonData.targetUser.records"
                :current-user-name="data.user.name"
                :target-user-name="targetUser.name"
              />
              <div
                v-else
                class="flex items-center justify-center h-full text-gray-500"
              >
                该月份暂无数据
              </div>
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
import api, { showGlobalError } from "@/lib/api";

// Reactive data
const { data } = useAuth();

const targetUserId = ref("");
const allUsers = ref([]);
const targetUser = ref(null);
const comparisonData = ref(null);
const isLoading = ref(false);
const isUsersLoading = ref(false);
const selectedMonth = ref(new Date().toISOString().slice(0, 7)); // 当前月份 YYYY-MM

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

// 获取可用的月份列表
const availableMonths = computed(() => {
  if (!comparisonData.value) return [];

  const months = new Set();

  // 从当前用户记录中提取月份
  comparisonData.value.currentUser.records.forEach((record) => {
    const month = record.date.slice(0, 7);
    months.add(month);
  });

  // 从目标用户记录中提取月份
  comparisonData.value.targetUser.records.forEach((record) => {
    const month = record.date.slice(0, 7);
    months.add(month);
  });

  return Array.from(months).sort().reverse(); // 按时间倒序排列
});

// 过滤当前月份的数据
const filteredComparisonData = computed(() => {
  if (!comparisonData.value) return null;

  const filterByMonth = (records) => {
    return records.filter((record) =>
      record.date.startsWith(selectedMonth.value)
    );
  };

  return {
    currentUser: {
      ...comparisonData.value.currentUser,
      records: filterByMonth(comparisonData.value.currentUser.records),
    },
    targetUser: {
      ...comparisonData.value.targetUser,
      records: filterByMonth(comparisonData.value.targetUser.records),
    },
  };
});

// Methods
const loadAllUsers = async () => {
  isUsersLoading.value = true;
  try {
    const users = await api.user.queryAll();
    // 过滤掉当前用户
    allUsers.value = users.filter(user => user.id !== data.value.user.id);
  } catch (err) {
    showGlobalError(err.message || "加载用户列表失败");
  } finally {
    isUsersLoading.value = false;
  }
};

const compareUsers = async () => {
  if (!targetUserId.value) {
    showGlobalError("请选择目标用户");
    return;
  }

  isLoading.value = true;

  try {
    const targetUserData = allUsers.value.find(
      (user) => user.id === targetUserId.value
    );

    if (!targetUserData) {
      showGlobalError("目标用户不存在");
      isLoading.value = false;
      return;
    }

    const currentUserRecords = await api.weight.query(data.value.user.id);
    const targetUserRecords = await api.weight.query(targetUserData.id);

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
        records: currentUserRecords.map((record) => ({
          date: record.date,
          weight: record.weight,
        })),
      },
      targetUser: {
        recordCount: targetUserRecords.length,
        averageWeight: targetUserStats.averageWeight,
        maxWeight: targetUserStats.maxWeight,
        minWeight: targetUserStats.minWeight,
        records: targetUserRecords.map((record) => ({
          date: record.date,
          weight: record.weight,
        })),
      },
    };

    // 设置默认选中的月份为最新的月份
    if (availableMonths.value.length > 0) {
      selectedMonth.value = availableMonths.value[0];
    }
  } catch (err) {
    showGlobalError(err.message || "对比失败，请重试");
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
      minWeight: 0,
    };
  }

  const weights = records.map((record) => record.weight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  return {
    averageWeight: (totalWeight / weights.length).toFixed(1),
    maxWeight: Math.max(...weights).toFixed(1),
    minWeight: Math.min(...weights).toFixed(1),
  };
};

// 格式化月份显示
const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split("-");
  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];
  return `${year}年${monthNames[parseInt(month) - 1]}`;
};

// Lifecycle
onMounted(async () => {
  // 加载所有用户列表
  await loadAllUsers();
});
</script>
