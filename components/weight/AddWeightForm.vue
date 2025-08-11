<template>
  <div>
    <h2 class="text-xl font-bold text-gray-800 mb-6">添加体重记录</h2>

    <form @submit.prevent="submitForm" class="space-y-6">
      <div
        v-if="!userInfo"
        class="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg"
      >
        <p>
          请先
          <NuxtLink
            to="/login"
            class="text-blue-600 hover:text-blue-700 underline"
            >登录</NuxtLink
          >
          以开始记录体重
        </p>
      </div>

      <div
        v-if="userInfo"
        class="text-sm text-gray-600 mb-4 p-3 bg-green-50 rounded-lg"
      >
        <p>当前用户：{{ userInfo.name }} ({{ userInfo.email }})</p>
      </div>

      <div>
        <label
          for="weight"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          体重 (kg)
        </label>
        <input
          id="weight"
          v-model="weight"
          type="number"
          step="0.1"
          min="30"
          max="200"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          placeholder="请输入体重，如：70.5"
        />
      </div>

      <div>
        <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
          日期
        </label>
        <input
          id="date"
          v-model="date"
          type="date"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />
      </div>

      <div class="flex items-center justify-between">
        <button
          type="submit"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div
            v-if="loading"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
          ></div>
          {{ loading ? "添加中..." : "添加记录" }}
        </button>

        <button
          type="button"
          @click="resetForm"
          class="text-gray-600 hover:text-gray-800 px-4 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          重置
        </button>
      </div>
    </form>

    <!-- 成功消息 -->
    <div
      v-if="successMessage"
      class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
    >
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-green-600 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="text-green-800 font-medium">{{ successMessage }}</span>
      </div>

      <div v-if="weightChange" class="mt-3 text-sm text-green-700">
        <div>相比一个月前：</div>
        <div class="font-medium">
          {{ weightChange === 0 ? "持平" : weightChange > 0 ? "增加" : "减少" }}
          {{ weightChange }} kg
        </div>
      </div>
    </div>

    <!-- 错误消息 -->
    <div
      v-if="errorMessage"
      class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-600 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="text-red-800 font-medium">{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import api from "@/lib/api";
import { DbUser } from "@/lib/db/types";
import { ref } from "vue";

// Props
const props = defineProps<{
  userInfo: DbUser;
}>();

const weight = ref("");
const date = ref(new Date().toISOString().split("T")[0]);
const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const weightChange = ref<number | null>(null);

const emit = defineEmits<{
  recordAdded: [];
}>();

const submitForm = async () => {
  if (!weight.value || !date.value || !props.userInfo) {
    errorMessage.value = "请填写所有必填字段";
    return;
  }

  const weightValue = parseFloat(weight.value);
  if (weightValue < 30 || weightValue > 200) {
    errorMessage.value = "体重必须在 30-200 kg 之间";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  await api.weight.create(weightValue, date.value, props.userInfo.id);

  successMessage.value = "体重记录添加成功！";
  resetForm();
  emit("recordAdded");

  // 3秒后清除成功消息
  setTimeout(() => {
    successMessage.value = "";
    weightChange.value = null;
  }, 3000);
  loading.value = false;
};

const resetForm = () => {
  weight.value = "";
  date.value = new Date().toISOString().split("T")[0];
  // 不清除用户信息，保持用户登录状态
  errorMessage.value = "";
};

// 用户信息现在通过props传递，不再需要从localStorage获取
</script>
