<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div>
        <h2 class="text-2xl font-bold text-center text-gray-900">
          {{ isLogin ? "登录" : "注册" }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          欢迎来到 Nexus of Notions
        </p>
      </div>

      <!-- Login / Register Form -->
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div v-if="!isLogin">
          <label for="name" class="block text-sm font-medium text-gray-700"
            >姓名</label
          >
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >邮箱</label
          >
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >密码</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {{ loading ? "处理中..." : isLogin ? "登录" : "注册" }}
        </button>

        <!-- 没有账号？ -->
        <div v-if="isLogin" class="text-sm text-gray-500">
          还没有账号？<a
            href="#"
            @click.prevent="isLogin = false"
            class="text-indigo-600 hover:text-indigo-700"
            >点击注册</a
          >
        </div>
        <div v-else class="text-sm text-gray-500">
          已经有账号？<a
            href="#"
            @click.prevent="isLogin = true"
            class="text-indigo-600 hover:text-indigo-700"
            >点击登录</a
          >
        </div>
      </form>

      <!-- Divider -->
      <div class="relative flex items-center py-2">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="flex-shrink mx-4 text-sm text-gray-500"
          >或通过以下方式继续</span
        >
        <div class="flex-grow border-t border-gray-300"></div>
      </div>

      <!-- Social Logins -->
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-1">
        <button
          @click="signInWithGithub"
          class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-900"
        >
          <!-- Github Icon -->
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z"
              clip-rule="evenodd"
            />
          </svg>
          GitHub
        </button>
        <button
          @click="signInWithGoogle"
          class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          <!-- Google Icon -->
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-7.962l-6.571,4.82C9.656,39.663,16.318,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          Google
        </button>
      </div>
    </div>

    <GlobalErrorToast />
  </div>
</template>

<script setup lang="ts">
import api, { showGlobalError } from "@/lib/api";
import { ref } from "vue";

const { signIn } = useAuth();
const router = useRouter();

const isLogin = ref(true);
const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;

  if (isLogin.value) {
    // Handle Login
    const result = await signIn("credentials", {
      email: email.value,
      password: password.value,
      redirect: false, // We handle redirect manually
    });

    if (result?.error) {
      showGlobalError("邮箱或密码错误，请重试。");
    } else {
      router.push("/");
    }
  } else {
    // Handle Register
    try {
      await api.user.register(name.value, email.value, password.value);

      // Automatically log in after successful registration
      const result = await signIn("credentials", {
        email: email.value,
        password: password.value,
        redirect: false,
      });

      if (result?.error) {
        showGlobalError("注册成功，但自动登录失败。请手动登录。");
        isLogin.value = true; // Switch to login tab
      } else {
        router.push("/");
      }
    } catch (error: any) {
      showGlobalError(error.data?.error?.message || "注册失败，请稍后重试。");
    }
  }

  loading.value = false;
};

const signInWithGithub = () => {
  signIn("github", { callbackUrl: "/" });
};

const signInWithGoogle = () => {
  signIn("google", { callbackUrl: "/" });
};

definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
});
</script>
