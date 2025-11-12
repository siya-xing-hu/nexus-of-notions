<template>
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-8">
    <!-- SM4 Key Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        SM4 密钥
      </h2>
      <div class="flex items-center space-x-4 mb-6">
        <button
          @click="generateSm4Key"
          class="self-end inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          <span>生成密钥</span>
        </button>
      </div>
      <div class="flex items-center space-x-4">
        <div class="w-full">
          <div class="flex justify-between items-center mb-2">
            <label
              for="sm4-key"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >密钥 (16字节, 32位Hex)</label
            >
            <button
              @click="copyToClipboard(sm4Key)"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4" />
            </button>
          </div>
          <input
            id="sm4-key"
            v-model="sm4Key"
            placeholder="请输入32位十六进制密钥"
            class="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          />
        </div>
      </div>
    </div>

    <!-- SM4 Crypto Conversion Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        实时加解密
      </h2>
      <div class="flex items-center justify-center space-x-4">
        <!-- Plaintext -->
        <div class="w-full">
          <label
            for="sm4-plaintext"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >加密前文本</label
          >
          <textarea
            id="sm4-plaintext"
            v-model="inputText"
            @input="handleEncrypt"
            rows="10"
            placeholder="在此输入待加密文本"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
        <!-- Conversion Icon -->
        <div class="flex-shrink-0 px-2">
          <Icon
            name="mdi:arrow-left-right"
            class="w-8 h-8 text-gray-400 dark:text-gray-500"
          />
        </div>
        <!-- Ciphertext -->
        <div class="w-full">
          <label
            for="sm4-ciphertext"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >加密后文本 (Base64)</label
          >
          <textarea
            id="sm4-ciphertext"
            v-model="resultText"
            @input="handleDecrypt"
            rows="10"
            placeholder="在此输入加密后文本 (Base64)"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
      </div>
    </div>
    <div
      v-if="showToast"
      class="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg"
    >
      复制成功!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { sm4 } from "sm-crypto-v2";
import { showGlobalError } from "@/lib/api";

const sm4Key = ref("");
const inputText = ref("");
const resultText = ref("");
const showToast = ref(false);

const generateSm4Key = () => {
  let key = "";
  const hexChars = "0123456789abcdef";
  for (let i = 0; i < 32; i++) {
    key += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }
  sm4Key.value = key;
};

const handleEncrypt = () => {
  if (!inputText.value) {
    resultText.value = "";
    return;
  }
  if (!sm4Key.value || sm4Key.value.length !== 32) {
    showGlobalError("请输入有效的32位十六进制SM4密钥。");
    return;
  }
  try {
    const encrypted = sm4.encrypt(inputText.value, sm4Key.value);
    resultText.value = encrypted;
  } catch (e: any) {
    showGlobalError("加密失败: " + e.message);
  }
};

const handleDecrypt = () => {
  if (!resultText.value) {
    inputText.value = "";
    return;
  }
  if (!sm4Key.value || sm4Key.value.length !== 32) {
    showGlobalError("请输入有效的32位十六进制SM4密钥。");
    return;
  }
  try {
    const decrypted = sm4.decrypt(resultText.value, sm4Key.value);
    inputText.value = decrypted;
  } catch (e: any) {
    showGlobalError("解密失败: " + e.message);
  }
};

const copyToClipboard = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2000);
  });
};
</script>
