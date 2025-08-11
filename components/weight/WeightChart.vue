<template>
  <div>
    <h2 class="text-xl font-bold text-gray-800 mb-6">体重变化趋势</h2>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div
      v-else-if="chartData.length === 0"
      class="text-gray-500 text-center py-8"
    >
      暂无数据可显示
    </div>

    <div v-else class="space-y-6">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div class="text-sm text-blue-600 font-medium">当前体重</div>
          <div class="text-2xl font-bold text-blue-800">
            {{ currentWeight }} kg
          </div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <div class="text-sm text-green-600 font-medium">历史最低体重</div>
          <div class="text-2xl font-bold text-green-800">
            {{ minWeight }} kg
          </div>
        </div>

        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
          <div class="text-sm text-red-600 font-medium">历史最高体重</div>
          <div class="text-2xl font-bold text-red-800">{{ maxWeight }} kg</div>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div class="text-sm text-purple-600 font-medium">月初体重</div>
          <div class="text-2xl font-bold text-purple-800">
            {{ monthStartWeight }} kg
          </div>
        </div>

        <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div class="text-sm text-orange-600 font-medium">本月体重变化</div>
          <div
            class="text-2xl font-bold"
            :class="getChangeColorClass(monthWeightChange)"
          >
            {{ formatWeightChange(monthWeightChange) }} kg
          </div>
        </div>

        <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <div class="text-sm text-indigo-600 font-medium">整体体重变化</div>
          <div
            class="text-2xl font-bold"
            :class="getChangeColorClass(totalWeightChange)"
          >
            {{ formatWeightChange(totalWeightChange) }} kg
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/lib/api";
import { DbWeightRecord } from "@/lib/db/types";

// Props
const props = defineProps<{
  userId: number;
}>();

const loading = ref(false);
const error = ref("");
const chartData = ref<DbWeightRecord[]>([]);

const currentWeight = ref(0);
const minWeight = ref(0);
const maxWeight = ref(0);
const monthStartWeight = ref(0);
const monthWeightChange = ref(0);
const totalWeightChange = ref(0);

// 获取当前月份的开始和结束日期
const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startOfMonth, endOfMonth };
};

// 获取月初体重
const getMonthStartWeight = () => {
  const { startOfMonth, endOfMonth } = getCurrentMonthRange();
  const monthRecords = chartData.value.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= startOfMonth && recordDate <= endOfMonth;
  });

  if (monthRecords.length === 0) return 0;

  return monthRecords[monthRecords.length - 1].weight;
};

// 获取本月体重变化
const getMonthWeightChange = () => {
  const { startOfMonth, endOfMonth } = getCurrentMonthRange();
  const monthRecords = chartData.value.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= startOfMonth && recordDate <= endOfMonth;
  });

  if (monthRecords.length < 2) return 0;

  const monthEndRecord = monthRecords[0];
  const monthStartRecord = monthRecords[monthRecords.length - 1];
  return monthEndRecord.weight - monthStartRecord.weight;
};

// 获取整体体重变化
const getTotalWeightChange = () => {
  if (chartData.value.length < 2) return 0;
  const endRecord = chartData.value[0];
  const startRecord = chartData.value[chartData.value.length - 1];
  return endRecord.weight - startRecord.weight;
};

const fetchData = async () => {
  loading.value = true;
  error.value = "";

  const data = await api.weight.query(props.userId);

  if (data) {
    chartData.value = data;

    if (chartData.value.length > 0) {
      const weights = chartData.value.map((r) => r.weight);
      currentWeight.value = weights[0]; // 最新的体重
      minWeight.value = Math.min(...weights);
      maxWeight.value = Math.max(...weights);
      monthStartWeight.value = getMonthStartWeight();
      monthWeightChange.value = getMonthWeightChange();
      totalWeightChange.value = getTotalWeightChange();
    }
  }

  loading.value = false;
};

// 格式化函数
const formatWeightChange = (change: number) => {
  if (change > 0) {
    return `+${change.toFixed(2)}`;
  }
  return change.toFixed(2);
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
  fetchData();
});
</script>
