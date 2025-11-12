<template>
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-8">
    <!-- SM3 Hash Section -->
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        SM3 哈希
      </h2>
      <div class="space-y-4">
        <div>
          <label
            for="sm3-input"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >输入文本</label
          >
          <textarea
            id="sm3-input"
            v-model="inputText"
            rows="8"
            placeholder="在此输入任意文本"
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs"
          ></textarea>
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <label
              for="sm3-output"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >SM3 哈希值 (Hex)</label
            >
            <button
              @click="copyToClipboard(hashOutput)"
              class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Icon name="mdi:content-copy" class="w-4 h-4" />
            </button>
          </div>
          <textarea
            id="sm3-output"
            v-model="hashOutput"
            rows="4"
            readonly
            class="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-mono text-xs cursor-not-allowed"
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
import { ref, watch } from "vue";
import { sm3 } from "sm-crypto-v2";

const inputText = ref("");
const hashOutput = ref("");
const showToast = ref(false);

watch(inputText, (newVal) => {
  if (newVal) {
    hashOutput.value = sm3(newVal);
  } else {
    hashOutput.value = "";
  }
});

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
