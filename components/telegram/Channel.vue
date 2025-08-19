<template>
  <!-- 左侧频道列表 -->
  <div class="h-full flex flex-col">
    <!-- 频道列表标题 -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900">频道列表</h2>
    </div>

    <!-- 添加频道表单 -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex gap-2">
        <input
          v-model="newChannel"
          type="text"
          placeholder="输入频道用户名"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          @keyup.enter="addChannel"
        />
        <button
          @click="addChannel"
          :disabled="!newChannel.trim()"
          class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Icon name="lucide:plus" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 频道列表 -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="channel in channels"
        :key="channel.username"
        @click="handleChannelSelected(channel)"
        :class="[
          'p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors',
          selectedChannel?.username === channel.username
            ? 'border-blue-500 bg-blue-50'
            : 'border-transparent',
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-gray-900 truncate">
              {{ channel.title || `@${channel.username}` }}
            </h3>
            <p class="text-xs text-gray-500 truncate">
              @{{ channel.username }}
            </p>
          </div>
          <button
            @click.stop="removeChannel(channel.username)"
            class="text-gray-400 hover:text-red-500 p-1"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="channels.length === 0" class="p-8 text-center">
        <Icon
          name="lucide:message-circle"
          class="mx-auto h-8 w-8 text-gray-400 mb-2"
        />
        <p class="text-sm text-gray-500">暂无频道，请添加频道开始聊天</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ChannelInfo } from "@/lib/telegram/TelegramService";

interface Props {
  channels: ChannelInfo[];
  selectedChannel?: ChannelInfo | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  channelSelected: [ChannelInfo];
  channelAdded: [string];
  channelRemoved: [string];
}>();

// 响应式数据
const newChannel = ref("");

// 处理频道选择
const handleChannelSelected = (channel: ChannelInfo) => {
  emit("channelSelected", channel);
};

// 添加频道
const addChannel = () => {
  const username = newChannel.value.trim().replace("@", "");
  if (!username) return;

  emit("channelAdded", username);
  newChannel.value = "";
};

// 移除频道
const removeChannel = (username: string) => {
  emit("channelRemoved", username);
};
</script>
