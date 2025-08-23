<template>
  <div
    class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow w-full"
  >
    <!-- 消息内容 -->
    <div class="prose max-w-none mb-3">
      <p
        class="text-gray-900 whitespace-pre-wrap leading-relaxed break-words"
        v-html="formatMessageText(message.text)"
      ></p>
    </div>

    <!-- 消息统计 -->
    <div class="flex items-center justify-between text-sm text-gray-500">
      <!-- 操作按钮 -->
      <div class="flex items-center space-x-2">
        <button
          @click="copyMessage"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="复制消息内容"
        >
          <Icon name="lucide:copy" class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TelegramMessage } from "@/lib/telegram";
import { formatMessageText } from "@/stores/common";

interface Props {
  message: TelegramMessage;
}

const props = defineProps<Props>();

// 复制消息内容
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.text);
    // 可以添加一个简单的提示
    console.log("消息已复制到剪贴板");
  } catch (err) {
    console.error("复制失败:", err);
  }
};
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose p {
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 确保链接能够正确换行 */
a {
  word-break: break-all;
}
</style>
