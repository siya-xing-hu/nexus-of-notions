<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        加密工具箱
      </h1>

      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            @click="currentTab = tab.name"
            :class="[
              currentTab === tab.name
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="mt-6">
        <div v-if="currentTab === 'SM2'">
          <SM2Crypto />
        </div>
        <div v-if="currentTab === 'SM3'">
          <SM3Crypto />
        </div>
        <div v-if="currentTab === 'SM4'">
          <SM4Crypto />
        </div>
        <div v-if="currentTab === 'RSA'">
          <RSACrypto />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SM2Crypto from "@/components/crypto/SM2Crypto.vue";
import SM3Crypto from "@/components/crypto/SM3Crypto.vue";
import SM4Crypto from "@/components/crypto/SM4Crypto.vue";
import RSACrypto from "@/components/crypto/RSACrypto.vue";

const tabs = [
  { name: "SM2" },
  { name: "SM3" },
  { name: "SM4" },
  { name: "RSA" },
];

const currentTab = ref("SM2");

definePageMeta({
  auth: false,
});
</script>

<style scoped>
/* Add any additional styling here */
</style>
