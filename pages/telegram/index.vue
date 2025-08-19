<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 认证组件 -->
    <div v-if="!isAuthenticated" class="p-4">
      <TelegramAuth @auth-success="handleAuthSuccess" />
    </div>

    <!-- 主聊天界面 -->
    <div v-else class="flex h-screen">
      <!-- 频道列表 (在PC端始终显示，在移动端仅当未选择频道时显示) -->
      <div
        class="w-full sm:w-60 bg-white transition-all duration-300"
        :class="{
          'hidden sm:block': selectedChannel,
          block: !selectedChannel,
        }"
      >
        <Channel
          :channels="channels"
          :selected-channel="selectedChannel"
          @channel-selected="handleChannelSelected"
          @channel-added="handleChannelAdded"
          @channel-removed="handleChannelRemoved"
        />
      </div>

      <!-- 聊天窗口 (在PC端始终显示，在移动端仅当选择频道时显示) -->
      <div
        class="flex-1 transition-all duration-300"
        :class="{
          'hidden sm:block': !selectedChannel,
          block: selectedChannel,
        }"
      >
        <Chat
          v-if="selectedChannel"
          :channel="selectedChannel"
          :messages="currentMessages"
          :loading="loading"
          @send-message="handleSendMessage"
          @close-chat="selectedChannel = null"
          @refresh-messages="refreshMessages"
        />
        <div v-else class="h-full flex items-center justify-center bg-gray-50">
          <div class="text-center p-6">
            <Icon
              name="lucide:message-circle"
              class="mx-auto h-16 w-16 text-gray-400 mb-4"
            />
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              选择频道开始聊天
            </h3>
            <p class="text-gray-500">从左侧选择一个频道查看消息</p>
            <p class="text-sm text-gray-400 mt-2">或在移动端点击频道进入聊天</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { api, showGlobalError } from "@/lib/api";
import { TelegramMessage, ChannelInfo } from "@/lib/telegram/TelegramService";

// 响应式数据
const loading = ref(false);
const isAuthenticated = ref(false);
const messages = ref<Map<number, TelegramMessage[]>>(new Map());

// 频道管理
const channels = ref<ChannelInfo[]>([]);
const selectedChannel = ref<ChannelInfo | null>(null);

// 当前频道的消息
const currentMessages = computed(() => {
  if (!selectedChannel.value) return [];
  return messages.value.get(selectedChannel.value.id) || [];
});

// 从 localStorage 加载频道列表
const loadChannels = () => {
  const channelsStr = localStorage.getItem("telegram-channels");
  if (channelsStr) {
    channels.value = JSON.parse(channelsStr);
    if (channels.value.length > 0) {
      handleChannelSelected(channels.value[0]);
    }
  } else {
    // 添加默认频道 yunpanchat
    handleChannelAdded("yunpanchat");
  }
};

// 保存频道列表到 localStorage
const saveChannels = () => {
  localStorage.setItem("telegram-channels", JSON.stringify(channels.value));
};

// 处理频道选择
const handleChannelSelected = async (channel: ChannelInfo) => {
  selectedChannel.value = channel;

  // 如果当前频道没有消息，自动加载
  if (!messages.value.has(channel.id)) {
    await refreshMessages();
  }
};

// 处理添加频道
const handleChannelAdded = async (username: string) => {
  try {
    loading.value = true;

    // 检查频道是否已存在
    if (channels.value.some((ch) => ch.username === username)) {
      showGlobalError("频道已存在");
      return;
    }

    // 获取频道信息
    const channelInfo = await api.telegram.getChannelInfo(username);

    // 添加到列表
    channels.value.push(channelInfo);
    saveChannels();

    // 如果只有1个频道，自动选择
    if (channels.value.length === 1) {
      handleChannelSelected(channelInfo);
    }
  } finally {
    loading.value = false;
  }
};

// 处理移除频道
const handleChannelRemoved = (username: string) => {
  const index = channels.value.findIndex((ch) => ch.username === username);
  if (index > -1) {
    const channel = channels.value[index];
    messages.value.delete(channel.id);
    if (selectedChannel.value?.id === channel.id) {
      selectedChannel.value = null;
    }

    channels.value.splice(index, 1);
    saveChannels();
  }
};

// 刷新消息
const refreshMessages = async () => {
  if (!selectedChannel.value) return;

  try {
    loading.value = true;

    const results = await api.telegram.getMessages(
      selectedChannel.value.username,
      20,
      0
    );

    messages.value.set(selectedChannel.value.id, results);
  } finally {
    loading.value = false;
  }
};

// 发送消息
const handleSendMessage = async (messageText: string) => {
  if (!selectedChannel.value || !messageText.trim()) {
    return;
  }

  try {
    loading.value = true;

    // 发送消息到频道
    await api.telegram.sendMessage(selectedChannel.value.username, messageText);

    // 异步1秒后刷新消息列表
    setTimeout(async () => {
      await refreshMessages();
    }, 1000);
  } finally {
    loading.value = false;
  }
};

// 处理认证成功
const handleAuthSuccess = () => {
  isAuthenticated.value = true;
};

// 监听认证状态变化
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loadChannels();
  }
});
</script>

<style scoped>
/* 平滑过渡效果 */
.transition-all {
  transition-property: all;
}
.duration-300 {
  transition-duration: 300ms;
}
</style>
