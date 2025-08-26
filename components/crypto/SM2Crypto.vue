<template>
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-8">
    <!-- Key Management Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        SM2 密钥对
      </h2>
      <div class="flex items-center space-x-4 mb-6">
        <button
          @click="generateKeys"
          :disabled="isGenerating"
          class="self-end inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          <span v-if="isGenerating">生成中...</span>
          <span v-else>生成密钥</span>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="flex justify-between items-center mb-2">
            <label
              for="public-key"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >公钥</label
            >
            <button
              @click="copyToClipboard(publicKey)"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4" />
            </button>
          </div>
          <textarea
            id="public-key"
            v-model="publicKey"
            rows="9"
            placeholder="用于加密"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <label
              for="private-key"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >私钥</label
            >
            <button
              @click="copyToClipboard(privateKey)"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4" />
            </button>
          </div>
          <textarea
            id="private-key"
            v-model="privateKey"
            rows="9"
            placeholder="用于解密"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Crypto Conversion Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        实时加解密
      </h2>
      <div class="flex items-center justify-center space-x-4">
        <!-- Plaintext -->
        <div class="w-full">
          <label
            for="plaintext"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >加密前文本</label
          >
          <textarea
            id="plaintext"
            v-model="inputText"
            @paste="handleEncrypt"
            @blur="handleEncrypt"
            rows="10"
            placeholder="在此输入待加密文本"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
        <!-- Conversion Icon -->
        <div class="flex-shrink-0 px-2">
          <Icon
            v-if="!isProcessing"
            name="mdi:arrow-left-right"
            class="w-8 h-8 text-gray-400 dark:text-gray-500"
          />
          <Icon
            v-else
            name="eos-icons:loading"
            class="w-8 h-8 text-indigo-500"
          />
        </div>
        <!-- Ciphertext -->
        <div class="w-full">
          <label
            for="ciphertext"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >加密后文本</label
          >
          <textarea
            id="ciphertext"
            v-model="resultText"
            @paste="handleDecrypt"
            @blur="handleDecrypt"
            rows="10"
            placeholder="在此输入加密后文本"
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
import { sm2 } from "sm-crypto-v2";
import { showGlobalError } from "@/lib/api";

// State
const isGenerating = ref(false);
const publicKey = ref("");
const privateKey = ref("");
const inputText = ref("");
const resultText = ref("");
const isProcessing = ref(false);
const showToast = ref(false);
let debounceTimer: NodeJS.Timeout | null = null;

// Methods
const generateKeys = async () => {
  isGenerating.value = true;
  await new Promise((resolve) => setTimeout(resolve, 50));
  try {
    const keypair = sm2.generateKeyPairHex();
    privateKey.value = keypair.privateKey;
    publicKey.value = keypair.publicKey;
  } catch (error) {
    console.error("密钥生成失败:", error);
  } finally {
    isGenerating.value = false;
  }
};

const handleEncrypt = () => {
  if (!inputText.value) {
    resultText.value = "";
    return;
  }
  debounceProcess(performEncrypt);
};

const handleDecrypt = () => {
  if (!resultText.value) {
    inputText.value = "";
    return;
  }
  debounceProcess(performDecrypt);
};

const debounceProcess = (func: () => void) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    func();
  }, 500); // 500ms debounce
};

const performEncrypt = () => {
  isProcessing.value = true;
  resultText.value = "";
  if (!publicKey.value || !inputText.value) {
    showGlobalError("公钥和待加密文本不能为空。");
    isProcessing.value = false;
    return;
  }
  try {
    resultText.value = sm2.doEncrypt(inputText.value, publicKey.value, 1, {
      asn1: true,
    });
  } catch (e: any) {
    console.error("加密操作失败", e);
    showGlobalError("加密操作失败");
  } finally {
    isProcessing.value = false;
  }
};

const performDecrypt = () => {
  if (!privateKey.value) {
    showGlobalError("请先生成或提供私钥。");
    return;
  }
  isProcessing.value = true;
  try {
    const decrypted = sm2.doDecrypt(resultText.value, privateKey.value, 1, {
      asn1: false,
    });
    if (decrypted === false) {
      throw new Error("解密失败，请检查私钥或密文。");
    }
    inputText.value = decrypted;
  } catch (e) {
    console.error("解密操作失败", e);
    showGlobalError("解密操作失败");
  } finally {
    isProcessing.value = false;
  }
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 2000);
  });
};
</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200;
}
</style>
