<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"
          >
            <Icon name="lucide:message-circle" class="h-8 w-8 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">Telegram 认证</h3>
          <p class="text-gray-600 leading-relaxed">
            请登录您的 Telegram 账号以使用聊天功能
          </p>
        </div>

        <!-- 初始化状态 -->
        <div v-if="initializing" class="text-center py-8">
          <div
            class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4"
          >
            <Icon
              name="lucide:loader-2"
              class="h-6 w-6 text-blue-600 animate-spin"
            />
          </div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">
            正在检查登录状态...
          </h4>
          <p class="text-gray-600 text-sm">请稍候，正在尝试恢复您的登录会话</p>
        </div>

        <!-- 认证状态 -->
        <div v-else-if="authStatus.isAuthenticated" class="text-center py-8">
          <div
            class="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4"
          >
            <Icon name="lucide:check-circle" class="h-6 w-6 text-green-600" />
          </div>
          <h4 class="text-lg font-semibold text-gray-900 mb-2">认证成功</h4>
          <p class="text-gray-600 mb-6 text-sm">
            已登录: {{ authStatus.phoneNumber }}
          </p>
          <button
            @click="handleLogout"
            class="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
            退出登录
          </button>
        </div>

        <!-- 认证表单 -->
        <div v-else-if="!initializing" class="space-y-6">
          <!-- 手机号输入 -->
          <div v-if="authStep === 'phone'" class="space-y-4">
            <div>
              <label
                for="phoneNumber"
                class="block text-sm font-semibold text-gray-700 mb-2"
              >
                手机号
              </label>
              <div class="relative">
                <Icon
                  name="lucide:phone"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                <input
                  id="phoneNumber"
                  v-model="phoneNumber"
                  type="tel"
                  placeholder="+8613800138000"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  :disabled="loading"
                />
              </div>
              <p class="text-sm text-gray-500 mt-2">
                请输入包含国家代码的完整手机号
              </p>
            </div>
            <button
              @click="handleStartAuth"
              :disabled="loading || !phoneNumber"
              class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              <Icon
                v-if="loading"
                name="lucide:loader-2"
                class="animate-spin mr-2"
              />
              <Icon v-else name="lucide:send" class="mr-2" />
              {{ loading ? "发送验证码中..." : "发送验证码" }}
            </button>
          </div>

          <!-- 验证码输入 -->
          <div v-if="authStep === 'code'" class="space-y-4">
            <div>
              <label
                for="phoneCode"
                class="block text-sm font-semibold text-gray-700 mb-2"
              >
                验证码
              </label>
              <div class="relative">
                <Icon
                  name="lucide:key"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                <input
                  id="phoneCode"
                  v-model="phoneCode"
                  type="text"
                  placeholder="12345"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  :disabled="loading"
                />
              </div>
              <p class="text-sm text-gray-500 mt-2">
                请输入发送到您 Telegram 应用的验证码
              </p>
            </div>
            <div class="flex gap-3">
              <button
                @click="handleSubmitCode"
                :disabled="loading || !phoneCode"
                class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                <Icon
                  v-if="loading"
                  name="lucide:loader-2"
                  class="animate-spin mr-2"
                />
                <Icon v-else name="lucide:check" class="mr-2" />
                {{ loading ? "验证中..." : "提交验证码" }}
              </button>
              <button
                @click="resetAuth"
                :disabled="loading"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Icon name="lucide:refresh-cw" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 两步验证 -->
          <div v-if="authStep === 'twoFactor'" class="space-y-4">
            <div>
              <label
                for="twoFactorPassword"
                class="block text-sm font-semibold text-gray-700 mb-2"
              >
                两步验证密码
              </label>
              <div class="relative">
                <Icon
                  name="lucide:shield"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                <input
                  id="twoFactorPassword"
                  v-model="twoFactorPassword"
                  type="password"
                  placeholder="输入两步验证密码"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  :disabled="loading"
                />
              </div>
              <p class="text-sm text-gray-500 mt-2">
                请输入您的 Telegram 两步验证密码
              </p>
            </div>
            <div class="flex gap-3">
              <button
                @click="handleSubmitTwoFactor"
                :disabled="loading || !twoFactorPassword"
                class="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                <Icon
                  v-if="loading"
                  name="lucide:loader-2"
                  class="animate-spin mr-2"
                />
                <Icon v-else name="lucide:check" class="mr-2" />
                {{ loading ? "验证中..." : "提交密码" }}
              </button>
              <button
                @click="resetAuth"
                :disabled="loading"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Icon name="lucide:refresh-cw" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api, showGlobalError } from "@/lib/api";

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
const authStep = ref<"phone" | "code" | "twoFactor">("phone");
const authStatus = ref<AuthStatus>({ isAuthenticated: false });

// 表单数据
const phoneNumber = ref("");
const phoneCode = ref("");
const twoFactorPassword = ref("");

// 检查认证状态
const checkAuthStatus = async () => {
  try {
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
    return;
  }

  try {
    loading.value = true;

    await api.telegram.startAuth(phoneNumber.value);
    authStep.value = "code";
  } finally {
    loading.value = false;
  }
};

// 提交验证码
const handleSubmitCode = async () => {
  if (!phoneCode.value) {
    showGlobalError("请输入验证码");
    return;
  }

  try {
    loading.value = true;
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
    showGlobalError(err.message || "验证码验证失败");
  } finally {
    loading.value = false;
  }
};

// 提交两步验证
const handleSubmitTwoFactor = async () => {
  if (!twoFactorPassword.value) {
    showGlobalError("请输入两步验证密码");
    return;
  }

  try {
    loading.value = true;

    const result = await api.telegram.submitTwoFactor(twoFactorPassword.value);

    if (result.success) {
      // 认证成功
      await checkAuthStatus();
      props.onAuthSuccess?.();
    }
  } catch (err: any) {
    showGlobalError(err.message || "两步验证失败");
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
    showGlobalError(err.message || "退出登录失败");
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
};

// 生命周期
onMounted(async () => {
  await checkAuthStatus();
});
</script>
