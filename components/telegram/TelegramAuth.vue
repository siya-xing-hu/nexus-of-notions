<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="text-center mb-6">
      <Icon
        name="lucide:message-circle"
        class="mx-auto h-12 w-12 text-purple-600 mb-4"
      />
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Telegram 认证</h3>
      <p class="text-gray-600">请登录您的 Telegram 账号以使用搜索功能</p>
    </div>

    <!-- 初始化状态 -->
    <div v-if="initializing" class="text-center py-8">
      <div class="text-blue-600 mb-4">
        <Icon name="lucide:loader-2" class="mx-auto h-12 w-12 animate-spin" />
      </div>
      <h4 class="text-lg font-medium text-gray-900 mb-2">
        正在检查登录状态...
      </h4>
      <p class="text-gray-600">请稍候，正在尝试恢复您的登录会话</p>
    </div>

    <!-- 认证状态 -->
    <div v-else-if="authStatus.isAuthenticated" class="text-center py-8">
      <div class="text-green-600 mb-4">
        <Icon name="lucide:check-circle" class="mx-auto h-12 w-12" />
      </div>
      <h4 class="text-lg font-medium text-gray-900 mb-2">认证成功</h4>
      <p class="text-gray-600 mb-4">已登录: {{ authStatus.phoneNumber }}</p>
      <button
        @click="handleLogout"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        退出登录
      </button>
    </div>

    <!-- 认证表单 -->
    <div v-else-if="!initializing" class="space-y-4">
      <!-- 手机号输入 -->
      <div v-if="authStep === 'phone'">
        <label
          for="phoneNumber"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          手机号
        </label>
        <input
          id="phoneNumber"
          v-model="phoneNumber"
          type="tel"
          placeholder="+8613800138000"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          :disabled="loading"
        />
        <p class="text-sm text-gray-500 mt-1">请输入包含国家代码的完整手机号</p>
        <button
          @click="handleStartAuth"
          :disabled="loading || !phoneNumber"
          class="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon
            v-if="loading"
            name="lucide:loader-2"
            class="animate-spin mr-2"
          />
          {{ loading ? "发送验证码中..." : "发送验证码" }}
        </button>
      </div>

      <!-- 验证码输入 -->
      <div v-if="authStep === 'code'">
        <label
          for="phoneCode"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          验证码
        </label>
        <input
          id="phoneCode"
          v-model="phoneCode"
          type="text"
          placeholder="12345"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          :disabled="loading"
        />
        <p class="text-sm text-gray-500 mt-1">
          请输入发送到您 Telegram 应用的验证码
        </p>
        <div class="flex gap-2 mt-4">
          <button
            @click="handleSubmitCode"
            :disabled="loading || !phoneCode"
            class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              v-if="loading"
              name="lucide:loader-2"
              class="animate-spin mr-2"
            />
            {{ loading ? "验证中..." : "提交验证码" }}
          </button>
          <button
            @click="resetAuth"
            :disabled="loading"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            重新开始
          </button>
        </div>
      </div>

      <!-- 两步验证 -->
      <div v-if="authStep === 'twoFactor'">
        <label
          for="twoFactorPassword"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          两步验证密码
        </label>
        <input
          id="twoFactorPassword"
          v-model="twoFactorPassword"
          type="password"
          placeholder="输入两步验证密码"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          :disabled="loading"
        />
        <p class="text-sm text-gray-500 mt-1">
          请输入您的 Telegram 两步验证密码
        </p>
        <div class="flex gap-2 mt-4">
          <button
            @click="handleSubmitTwoFactor"
            :disabled="loading || !twoFactorPassword"
            class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              v-if="loading"
              name="lucide:loader-2"
              class="animate-spin mr-2"
            />
            {{ loading ? "验证中..." : "提交密码" }}
          </button>
          <button
            @click="resetAuth"
            :disabled="loading"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error && !initializing"
      class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <div class="flex">
        <Icon name="lucide:alert-circle" class="h-5 w-5 text-red-400 mr-2" />
        <div>
          <h3 class="text-sm font-medium text-red-800">认证失败</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "@/lib/api";

interface AuthStatus {
  isAuthenticated: boolean;
  phoneNumber?: string;
}

interface Props {
  onAuthSuccess?: () => void;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const initializing = ref(true);
const error = ref("");
const authStep = ref<"phone" | "code" | "twoFactor">("phone");
const authStatus = ref<AuthStatus>({ isAuthenticated: false });

// 表单数据
const phoneNumber = ref("");
const phoneCode = ref("");
const twoFactorPassword = ref("");

// 检查认证状态
const checkAuthStatus = async () => {
  try {
    console.log("检查认证状态...");
    initializing.value = true;
    const status = await api.telegram.checkAuth();
    authStatus.value = status;
    if (status.isAuthenticated) {
      props.onAuthSuccess?.();
    }
  } catch (err) {
    console.error("检查认证状态失败:", err);
  } finally {
    initializing.value = false;
  }
};

// 开始认证
const handleStartAuth = async () => {
  if (!phoneNumber.value) {
    error.value = "请输入手机号";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    await api.telegram.startAuth(phoneNumber.value);
    authStep.value = "code";
  } finally {
    loading.value = false;
  }
};

// 提交验证码
const handleSubmitCode = async () => {
  if (!phoneCode.value) {
    error.value = "请输入验证码";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    const result = await api.telegram.submitCode(phoneCode.value);

    if (result.success) {
      // 认证成功
      await checkAuthStatus();
      props.onAuthSuccess?.();
    } else if (result.needsTwoFactor) {
      // 需要两步验证
      authStep.value = "twoFactor";
    } else if (result.authRestart) {
      // 需要重新开始认证
      resetAuth();
    }
  } catch (err: any) {
    error.value = err.message || "验证码验证失败";
  } finally {
    loading.value = false;
  }
};

// 提交两步验证
const handleSubmitTwoFactor = async () => {
  if (!twoFactorPassword.value) {
    error.value = "请输入两步验证密码";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    const result = await api.telegram.submitTwoFactor(twoFactorPassword.value);

    if (result.success) {
      // 认证成功
      await checkAuthStatus();
      props.onAuthSuccess?.();
    }
  } catch (err: any) {
    console.error("两步验证失败:", err);
    error.value = err.message || "两步验证失败";
  } finally {
    loading.value = false;
  }
};

// 退出登录
const handleLogout = async () => {
  try {
    loading.value = true;
    await api.telegram.logout();
    authStatus.value = { isAuthenticated: false };
    resetAuth();
  } catch (err: any) {
    console.error("退出登录失败:", err);
    error.value = err.message || "退出登录失败";
  } finally {
    loading.value = false;
  }
};

// 重置认证状态
const resetAuth = () => {
  authStep.value = "phone";
  phoneNumber.value = "";
  phoneCode.value = "";
  twoFactorPassword.value = "";
  error.value = "";
};

// 生命周期
onMounted(async () => {
  console.log("TelegramAuth 组件挂载，尝试恢复会话...");
  await checkAuthStatus();
});
</script>
