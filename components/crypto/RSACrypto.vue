<template>
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-8">
    <!-- Key Management Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        RSA 密钥对
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
        <div>
          <label
            for="rsa-key-size"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >密钥长度</label
          >
          <select
            id="rsa-key-size"
            v-model="rsaKeySize"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          >
            <option :value="1024">1024位</option>
            <option :value="2048">2048位</option>
            <option :value="4096">4096位</option>
          </select>
        </div>
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
import { JSEncrypt } from "jsencrypt";
import { showGlobalError } from "@/lib/api";

// State
const rsaKeySize = ref(2048);
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
  publicKey.value = "";
  privateKey.value = "";
  await new Promise((resolve) => setTimeout(resolve, 50));
  try {
    const encrypt = new JSEncrypt({
      default_key_size: rsaKeySize.value.toString(),
    });
    privateKey.value = encrypt.getPrivateKey();
    publicKey.value = encrypt.getPublicKey();
  } catch (error) {
    console.error("密钥生成失败", error);
    showGlobalError("密钥生成失败");
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
  if (!publicKey.value) {
    showGlobalError("请先生成或提供公钥。");
    return;
  }
  isProcessing.value = true;
  try {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey.value);
    const encrypted = encrypt.encrypt(inputText.value);
    if (encrypted === false) {
      throw new Error("加密失败，请检查公钥或文本长度。");
    }
    resultText.value = encrypted;
  } catch (e) {
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
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey.value);
    const decrypted = decrypt.decrypt(resultText.value);
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

<style scoped></style>
