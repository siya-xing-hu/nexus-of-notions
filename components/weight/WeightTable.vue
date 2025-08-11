<template>
  <div>
    <h2 class="text-xl font-bold text-gray-800 mb-6">体重记录</h2>

    <!-- 当月体重变化概览 -->
    <div v-if="!loading && filteredRecords.length > 0" class="mb-6">
      <div
        class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
      >
        <div class="text-center">
          <div class="text-sm text-gray-600 mb-2">
            {{ currentMonthDisplay }} 体重变化概览
          </div>
          <div class="flex items-center justify-center space-x-8">
            <div class="text-center">
              <div class="text-xs text-gray-500">月初体重</div>
              <div class="text-lg font-bold text-blue-800">
                {{ monthFirstWeight }} kg
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(monthFirstDate) }}
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              <div class="text-center">
                <div
                  class="text-sm font-medium"
                  :class="getChangeColorClass(monthWeightChange)"
                >
                  {{ formatWeightChange(monthWeightChange) }} kg
                </div>
                <div class="text-xs text-gray-500">变化</div>
              </div>
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
            </div>

            <div class="text-center">
              <div class="text-xs text-gray-500">月末体重</div>
              <div class="text-lg font-bold text-purple-800">
                {{ monthLastWeight }} kg
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDate(monthLastDate) }}
              </div>
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
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
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
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
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

        <!-- 当月记录视图 -->
    <div class="mb-6 bg-white rounded-lg border border-gray-200 p-4">
      <h3 class="text-sm font-medium text-gray-700 mb-3">当月记录概览</h3>
      
      <!-- 电脑端：一排显示 -->
      <div class="hidden md:block">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="day in monthCalendarDays.filter(day => day.dayNumber)"
            :key="day.date"
            class="w-8 h-8 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:scale-110 border border-gray-100 rounded"
            :class="getDayColorClass(day)"
            :title="getDayTooltip(day)"
          >
            <span :class="day.hasRecord ? 'text-white' : 'text-gray-700'">{{ day.dayNumber }}</span>
          </div>
        </div>
      </div>
      
      <!-- 手机端：日历格式显示 -->
      <div class="md:hidden">
        <div class="grid grid-cols-7 gap-1">
          <!-- 星期标题 -->
          <div class="text-center text-xs text-gray-500 font-medium py-1">日</div>
          <div class="text-center text-xs text-gray-500 font-medium py-1">一</div>
          <div class="text-center text-xs text-gray-500 font-medium py-1">二</div>
          <div class="text-center text-xs text-gray-500 font-medium py-1">三</div>
          <div class="text-center text-xs text-gray-500 font-medium py-1">四</div>
          <div class="text-center text-xs text-gray-500 font-medium py-1">五</div>
          <div class="text-center text-xs text-gray-500 font-medium py-1">六</div>
          
          <!-- 日历日期 -->
          <div
            v-for="day in monthCalendarDays"
            :key="day.date"
            class="aspect-square flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:scale-110 border border-gray-100"
            :class="getDayColorClass(day)"
            :title="getDayTooltip(day)"
          >
            <span v-if="day.dayNumber" :class="day.hasRecord ? 'text-white' : 'text-gray-700'">{{ day.dayNumber }}</span>
          </div>
        </div>
      </div>
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
                  getChangeColor(
                    record.weight - filteredRecords[index + 1].weight
                  )
                "
                class="font-medium"
              >
                {{
                  formatWeightChange(
                    record.weight - filteredRecords[index + 1].weight
                  )
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
  userId: string;
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

  return records.value
    .filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getFullYear() === year && recordDate.getMonth() === month
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  if (filteredRecords.value.length === 0) return "";
  return filteredRecords.value[filteredRecords.value.length - 1].date;
});

const monthLastDate = computed(() => {
  if (filteredRecords.value.length === 0) return "";
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

// 日历相关类型定义
interface CalendarDay {
  date: string;
  dayNumber: number | null;
  weight: number | null;
  status: 'down' | 'up' | 'same' | 'no-record';
  hasRecord: boolean;
}

// 生成当月日历数据
const monthCalendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // 获取当月第一天是星期几（0是星期日）
  const firstDayWeek = firstDay.getDay();
  
  const days: CalendarDay[] = [];
  
  // 添加月初的空白天数
  for (let i = 0; i < firstDayWeek; i++) {
    days.push({
      date: '',
      dayNumber: null,
      weight: null,
      status: 'no-record',
      hasRecord: false
    });
  }

  // 倒叙
  const reverseRecords = [...filteredRecords.value].reverse();

  // 添加当月的所有日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    // 月份需要补0
    const monthStr = (month + 1).toString().padStart(2, '0');
    // 日期需要补0
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    
    // 查找当天的记录
    const record = records.value.find(r => r.date === dateStr);
    
    // 查找前一天有记录的体重
    let prevWeight: number | null = null;
    const currentRecordIndex = reverseRecords.findIndex(r => r.date === dateStr);

    if (currentRecordIndex > 0) {
      prevWeight = reverseRecords[currentRecordIndex - 1].weight;
    } else if (currentRecordIndex === 0) {
      prevWeight = reverseRecords[currentRecordIndex].weight;
    }
    
    let status: 'down' | 'up' | 'same' | 'no-record' = 'no-record';
    if (record && prevWeight !== null) {
      if (record.weight < prevWeight) {
        status = 'down';
      } else if (record.weight > prevWeight) {
        status = 'up';
      } else {
        status = 'same';
      }
    } else if (record) {
      // 第一条记录，标记为无变化
      status = 'same';
    }
    
    days.push({
      date: dateStr,
      dayNumber: day,
      weight: record?.weight || null,
      status,
      hasRecord: !!record
    });
  }
  
  return days;
});

// 获取日期颜色类
const getDayColorClass = (day: CalendarDay) => {
  if (!day.hasRecord) {
    return 'bg-gray-100 hover:bg-gray-200';
  }
  
  switch (day.status) {
    case 'down':
      return 'bg-green-500 hover:bg-green-600';
    case 'up':
      return 'bg-red-500 hover:bg-red-600';
    case 'same':
      return 'bg-blue-500 hover:bg-blue-600';
    default:
      return 'bg-gray-100 hover:bg-gray-200';
  }
};

// 获取日期提示信息
const getDayTooltip = (day: CalendarDay) => {
  if (day.hasRecord) {
    const changeText = day.status === 'down' ? '下降' : 
                      day.status === 'up' ? '上涨' : '无变化';
    const date = new Date(day.date);
    const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
    return `${formattedDate}: ${day.weight}kg (${changeText})`;
  }
  if (day.dayNumber) {
    const date = new Date(day.date);
    const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
    return `${formattedDate}: 未记录`;
  }
  return '';
};

onMounted(() => {
  fetchRecords();
});
</script>
