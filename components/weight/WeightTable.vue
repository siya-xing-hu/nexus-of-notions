<template>
  <div>
    <h2 class="text-xl font-bold text-gray-800 mb-6">体重记录</h2>

    <!-- 当月体重变化概览 -->
    <div v-if="!loading && filteredRecords.length > 0" class="mb-6">
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div class="text-center">
          <div class="text-sm text-gray-600 mb-2">{{ currentMonthDisplay }} 体重变化概览</div>
          <div class="flex items-center justify-center space-x-8">
            <div class="text-center">
              <div class="text-xs text-gray-500">月初体重</div>
              <div class="text-lg font-bold text-blue-800">{{ monthFirstWeight }} kg</div>
              <div class="text-xs text-gray-500">{{ formatDate(monthFirstDate) }}</div>
            </div>
            
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div class="text-center">
                <div class="text-sm font-medium" :class="getChangeColorClass(monthWeightChange)">
                  {{ formatWeightChange(monthWeightChange) }} kg
                </div>
                <div class="text-xs text-gray-500">变化</div>
              </div>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </div>
            
            <div class="text-center">
              <div class="text-xs text-gray-500">月末体重</div>
              <div class="text-lg font-bold text-purple-800">{{ monthLastWeight }} kg</div>
              <div class="text-xs text-gray-500">{{ formatDate(monthLastDate) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月份选择器 -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="previousMonth"
          class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          :disabled="loading"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="text-lg font-semibold text-gray-800">
          {{ currentMonthDisplay }}
        </div>
        
        <button
          @click="nextMonth"
          class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          :disabled="loading"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <button
        @click="goToCurrentMonth"
        class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        :disabled="loading"
      >
        回到本月
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div
      v-else-if="filteredRecords.length === 0"
      class="text-gray-500 text-center py-8"
    >
      {{ currentMonthDisplay }} 暂无体重记录
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              日期
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              体重 (kg)
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              变化
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              记录时间
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(record, index) in filteredRecords"
            :key="record.id"
            class="hover:bg-gray-50 transition-colors duration-200"
          >
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
            >
              {{ formatDate(record.date) }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium"
            >
              {{ record.weight }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                v-if="index < filteredRecords.length - 1"
                :class="
                  getChangeColor(record.weight - filteredRecords[index + 1].weight)
                "
                class="font-medium"
              >
                {{
                  formatWeightChange(record.weight - filteredRecords[index + 1].weight)
                }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDateTime(record.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 flex justify-between items-center">
      <button
        @click="refreshData"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        刷新数据
      </button>
      <div class="text-sm text-gray-600">
        {{ currentMonthDisplay }} 共 {{ filteredRecords.length }} 条记录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from "@/lib/api";
import { DbWeightRecord } from "@/lib/db/types";
import { ref, onMounted, computed } from "vue";

// Props
const props = defineProps<{
  userId: number;
}>();

const records = ref<DbWeightRecord[]>([]);
const loading = ref(false);
const error = ref("");

// 月份选择相关
const currentMonth = ref(new Date());

// 计算当前显示的月份文本
const currentMonthDisplay = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth() + 1;
  return `${year}年${month}月`;
});

// 过滤当前月份的记录
const filteredRecords = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  
  return records.value.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === year && recordDate.getMonth() === month;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// 当月体重变化相关
const monthFirstWeight = computed(() => {
  if (filteredRecords.value.length === 0) return 0;
  return filteredRecords.value[filteredRecords.value.length - 1].weight;
});

const monthLastWeight = computed(() => {
  if (filteredRecords.value.length === 0) return 0;
  return filteredRecords.value[0].weight;
});

const monthFirstDate = computed(() => {
  if (filteredRecords.value.length === 0) return '';
  return filteredRecords.value[filteredRecords.value.length - 1].date;
});

const monthLastDate = computed(() => {
  if (filteredRecords.value.length === 0) return '';
  return filteredRecords.value[0].date;
});

const monthWeightChange = computed(() => {
  if (filteredRecords.value.length < 2) return 0;
  return monthLastWeight.value - monthFirstWeight.value;
});

const fetchRecords = async () => {
  loading.value = true;
  error.value = "";

  const data = await api.weight.query(props.userId);

  records.value = data;
  loading.value = false;
};

const refreshData = () => {
  fetchRecords();
};

// 月份切换功能
const previousMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  );
};

const goToCurrentMonth = () => {
  currentMonth.value = new Date();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN");
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("zh-CN");
};

const formatWeightChange = (change: number) => {
  if (change > 0) {
    return `+${change.toFixed(2)}`;
  }
  return change.toFixed(2);
};

const getChangeColor = (change: number) => {
  if (change > 0) {
    return "text-red-600";
  } else if (change < 0) {
    return "text-green-600";
  }
  return "text-gray-600";
};

const getChangeColorClass = (change: number) => {
  if (change > 0) {
    return "text-red-600";
  } else if (change < 0) {
    return "text-green-600";
  }
  return "text-gray-600";
};

onMounted(() => {
  fetchRecords();
});
</script>
