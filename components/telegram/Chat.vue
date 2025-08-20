<template>
  <div class="h-full flex flex-col">
    <!-- 聊天头部 -->
    <div class="p-4 border-b flex items-center bg-white">
      <div class="relative sm:hidden mr-3">
        <button
          @click="$emit('close-chat')"
          class="p-1 text-gray-500 hover:text-gray-700"
        >
          <Icon name="lucide:arrow-left" class="h-6 w-6" />
        </button>
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 truncate">
          {{ channel.title || `@${channel.username}` }}
        </h3>
        <p class="text-xs text-gray-500 truncate">@{{ channel.username }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="$emit('refresh-messages')"
          :disabled="loading"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        >
          <Icon
            name="lucide:refresh-cw"
            :class="['w-4 h-4', { 'animate-spin': loading }]"
          />
        </button>
      </div>
    </div>

    <!-- 聊天内容区域 -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div v-if="messages.length > 0" class="space-y-4 w-full">
        <!-- 消息列表 - 按时间顺序显示（历史消息在上，新消息在下） -->
        <div v-for="message in messages" :key="message.id" class="w-full">
          <MessageCard :message="message" class="w-full" />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-4">
        <div class="flex items-center text-gray-500">
          <Icon name="lucide:loader-2" class="animate-spin mr-2" />
          加载消息中...
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && messages.length === 0" class="text-center py-8">
        <Icon
          name="lucide:message-circle"
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无消息</h3>
        <p class="text-gray-500">开始发送消息吧</p>
      </div>
    </div>

    <!-- 消息输入区域 -->
    <div class="p-4 border-t bg-white">
      <!-- 权限提示 -->
      <div
        v-if="!canSendMessages"
        class="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
      >
        <div class="flex items-center">
          <Icon
            name="lucide:alert-triangle"
            class="w-4 h-4 text-yellow-600 mr-2"
          />
          <span class="text-sm text-yellow-800">
            您没有在此频道发送消息的权限，只有频道管理员才能发送消息
          </span>
        </div>
      </div>

      <div class="flex gap-3">
        <textarea
          v-model="messageText"
          rows="2"
          placeholder="输入消息内容..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          @keydown.ctrl.enter="sendMessage"
          :disabled="loading || !canSendMessages"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="loading || !messageText.trim() || !canSendMessages"
          class="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Icon
            v-if="loading"
            name="lucide:loader-2"
            class="animate-spin mr-1 md:mr-2"
          />
          <Icon v-else name="lucide:send" class="mr-1 md:mr-2" />
          <span class="hidden md:inline">发送</span>
        </button>
      </div>
      <div class="mt-2 text-xs text-gray-500 hidden md:block">
        <span v-if="canSendMessages">按 Ctrl+Enter 快速发送</span>
        <span v-else>只读模式，无法发送消息</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from "vue";
import { TelegramMessage } from "@/lib/telegram";
import { DbTelegramChannel } from "@/lib/db/types";

interface Props {
  channel: DbTelegramChannel;
  messages: TelegramMessage[];
  loading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "send-message": [string];
  "close-chat": [];
  "refresh-messages": [];
}>();

// 消息处理
const messageText = ref("");
const messagesContainer = ref<HTMLElement | null>(null);

// 检查是否可以发送消息
const canSendMessages = computed(() => {
  return props.channel.permissions?.canSendMessages ?? false;
});

// 发送消息
const sendMessage = () => {
  if (messageText.value.trim() === "" || !canSendMessages.value) return;

  emit("send-message", messageText.value);
  messageText.value = "";

  // 自动滚动到底部
  scrollToBottom();
};

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: "smooth",
      });
    }
  });
};

// 当消息变化时滚动到底部
watch(() => props.messages, scrollToBottom);

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
/* 移动端优化 */
@media (max-width: 768px) {
  .message-content {
    font-size: 14px;
    line-height: 1.5;
  }

  .message-links {
    font-size: 12px;
  }
}

/* 自定义滚动条 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
