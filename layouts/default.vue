<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center">
              <img
                class="block h-8 w-auto"
                src="/favicon.svg"
                alt="Nexus of Notions"
              />
              <span class="ml-2 font-semibold text-lg text-gray-800"
                >Nexus of Notions</span
              >
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <div v-if="status === 'authenticated'" class="relative">
              <button
                @click="menuOpen = !menuOpen"
                class="flex items-center space-x-2"
              >
                <img
                  class="h-8 w-8 rounded-full"
                  :src="data?.user?.image || '/default-avatar.png'"
                  alt="User avatar"
                />
                <span class="text-sm font-medium text-gray-700">{{
                  data?.user?.name
                }}</span>
              </button>
              <div
                v-if="menuOpen"
                @click.away="menuOpen = false"
                class="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10"
              >
                <a
                  href="#"
                  @click.prevent="handleSignOut"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >退出登录</a
                >
              </div>
            </div>
            <div v-else>
              <NuxtLink
                to="/auth"
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
                >登录</NuxtLink
              >
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="py-10">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    <GlobalErrorToast />
  </div>
</template>

<script setup>
import { ref } from "vue";
const { status, data, signOut } = useAuth();

const menuOpen = ref(false);

const handleSignOut = async () => {
  await signOut({ callbackUrl: "/" });
};
</script>
