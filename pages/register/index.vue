<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
  >
    <div class="max-w-md w-full mx-auto px-4">
      <!-- 返回首页按钮 -->
      <div class="text-center mb-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          返回首页
        </NuxtLink>
      </div>

      <!-- 注册卡片 -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserPlus class="w-8 h-8 text-green-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">用户注册</h1>
          <p class="text-gray-600">请输入信息注册新账号</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              姓名
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              placeholder="请输入您的姓名"
            />
          </div>

          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              邮箱
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              placeholder="请输入您的邮箱"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <div
              v-if="loading"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></div>
            {{ loading ? "注册中..." : "注册" }}
          </button>
        </form>

        <!-- 切换到登录页面 -->
        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm mb-2">已有账号？</p>
          <NuxtLink
            :to="`/login?redirect=${$route.query.redirect || '/'}`"
            class="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
          >
            立即登录
          </NuxtLink>
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
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ArrowLeft, UserPlus } from "lucide-vue-next";
import { api } from "@/lib/api";

// Meta tags for SEO
useHead({
  title: "用户注册 - Nexus of Notions",
  meta: [{ name: "description", content: "注册新账号，开始使用体重记录系统" }],
});

// Reactive data
const name = ref("");
const email = ref("");
const loading = ref(false);
const errorMessage = ref("");

// Methods
const handleSubmit = async () => {
  if (!name.value || !email.value) {
    errorMessage.value = "请填写所有必填字段";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  const data = await api.user.register(name.value, email.value);

  if (data) {
    // 保存用户信息到 localStorage
    localStorage.setItem("user-info", JSON.stringify(data));

    // 获取来源页面，智能跳转
    const route = useRoute();
    const redirect = route.query.redirect;

    if (redirect) {
      // 如果有指定的重定向页面，跳转到指定页面
      await navigateTo(redirect);
    } else {
      // 默认跳转到首页
      await navigateTo("/");
    }
  }

  loading.value = false;
};
</script>
