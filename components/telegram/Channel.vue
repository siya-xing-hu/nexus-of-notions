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
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
          @keyup.enter="addChannel"
        />
        <button
          @click="addChannel"
          :disabled="!newChannel.trim()"
          class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
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
        @click="handleChannelClick(channel, $event)"
        :class="[
          'p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors relative overflow-hidden',
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
            <div class="flex items-center gap-2">
              <p class="text-xs text-gray-500 truncate">
                @{{ channel.username }}
              </p>
              <!-- 权限标识 -->
              <div v-if="channel.permissions" class="flex items-center gap-1">
                <span
                  v-if="channel.permissions?.isCreator"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                  title="频道创建者"
                >
                  <Icon name="lucide:crown" class="w-3 h-3 mr-0.5" />
                  创建者
                </span>
                <span
                  v-else-if="channel.permissions?.isAdmin"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  title="频道管理员"
                >
                  <Icon name="lucide:shield" class="w-3 h-3 mr-0.5" />
                  管理员
                </span>
                <span
                  v-if="!channel.permissions?.canSendMessages"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                  title="只读模式"
                >
                  <Icon name="lucide:eye" class="w-3 h-3 mr-0.5" />
                  只读
                </span>
              </div>
            </div>
          </div>
          <!-- 频道操作组件 -->
          <div class="channel-actions">
            <button
              @click.stop="toggleActions(channel.username, $event)"
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center w-8 h-8 rounded"
              title="更多操作"
            >
              <Icon name="lucide:more-horizontal" class="w-4 h-4" />
            </button>

            <!-- 下拉菜单 -->
            <div
              v-if="showActions === channel.username"
              class="fixed bg-white border border-gray-200 rounded-md shadow-lg"
              :style="getDropdownStyle()"
            >
              <button
                @click.stop="handleRefresh(channel)"
                class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Icon name="lucide:refresh-cw" class="w-4 h-4 flex-shrink-0" />
              </button>
              <button
                @click.stop="handleRemove(channel.id)"
                class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4 flex-shrink-0" />
              </button>
            </div>
          </div>
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
import { onMounted, onUnmounted, ref } from "vue";
import { DbTelegramChannel } from "@/lib/db/types";

interface Props {
  channels: DbTelegramChannel[];
  selectedChannel?: DbTelegramChannel | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  channelSelected: [DbTelegramChannel];
  channelAdded: [string];
  channelRemoved: [string];
  channelRefreshed: [DbTelegramChannel];
}>();

// 响应式数据
const newChannel = ref("");
const showActions = ref<string | null>(null);
const dropdownPosition = ref<{ x: number; y: number } | null>(null);

// 处理频道选择
const handleChannelSelected = (channel: DbTelegramChannel) => {
  emit("channelSelected", channel);
};

// 处理频道点击事件（防止操作按钮点击冲突）
const handleChannelClick = (channel: DbTelegramChannel, event: Event) => {
  const target = event.target as HTMLElement;

  // 如果点击的是操作按钮或其子元素，不触发频道选择
  if (target.closest(".channel-actions") || target.closest("button")) {
    return;
  }

  handleChannelSelected(channel);
};

// 添加频道
const addChannel = () => {
  const username = newChannel.value.trim().replace("@", "");
  if (!username) return;

  emit("channelAdded", username);
  newChannel.value = "";
};

// 切换操作菜单显示状态
const toggleActions = (username: string, event?: Event) => {
  if (showActions.value === username) {
    showActions.value = null;
    dropdownPosition.value = null;
  } else {
    showActions.value = username;
    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      dropdownPosition.value = {
        x: rect.right - 40,
        y: rect.bottom + 4,
      };
    }
  }
};

// 获取下拉菜单样式
const getDropdownStyle = () => {
  if (!dropdownPosition.value) return {};
  return {
    left: `${dropdownPosition.value.x}px`,
    top: `${dropdownPosition.value.y}px`,
  };
};

// 处理刷新
const handleRefresh = (channel: DbTelegramChannel) => {
  showActions.value = null;
  dropdownPosition.value = null;
  emit("channelRefreshed", channel);
};

// 处理删除
const handleRemove = (id: string) => {
  showActions.value = null;
  dropdownPosition.value = null;
  emit("channelRemoved", id);
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".channel-actions")) {
    showActions.value = null;
    dropdownPosition.value = null;
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.channel-actions {
  position: relative;
}
</style>
