<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 认证组件 -->
    <div v-if="!isAuthenticated" class="p-4">
      <TelegramAuth @auth-success="handleAuthSuccess" />
    </div>

    <!-- 主聊天界面 -->
    <div v-else class="flex h-screen">
      <!-- 左侧频道列表 -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
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
            @click="selectChannel(channel)"
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

      <!-- 右侧聊天区域 -->
      <div class="flex-1 flex flex-col">
        <!-- 聊天头部 -->
        <div
          v-if="selectedChannel"
          class="p-4 border-b border-gray-200 bg-white"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ selectedChannel.title || `@${selectedChannel.username}` }}
              </h2>
              <p class="text-sm text-gray-500">
                @{{ selectedChannel.username }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="refreshMessages"
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
        </div>

        <!-- 聊天消息区域 -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto bg-gray-50">
          <div v-if="selectedChannel" class="p-4 space-y-3">
            <!-- 消息列表 - 按时间顺序显示（历史消息在上，新消息在下） -->
            <div
              v-for="(message, index) in [...messages].reverse()"
              :key="message.id"
              class="flex"
            >
              <div class="flex-1 max-w-2xl">
                <!-- 消息气泡 -->
                <div
                  class="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
                >
                  <!-- 消息头部 -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500"
                        >#{{ messages.length - index }}</span
                      >
                      <span v-if="message.from" class="text-xs text-blue-600">
                        {{ formatFrom(message.from) }}
                      </span>
                    </div>
                    <div
                      class="flex items-center space-x-2 text-xs text-gray-500"
                    >
                      <span v-if="message.views" class="flex items-center">
                        <Icon name="lucide:eye" class="w-3 h-3 mr-1" />
                        {{ message.views }}
                      </span>
                      <span>{{ formatRelativeTime(message.date) }}</span>
                    </div>
                  </div>

                  <!-- 消息内容 -->
                  <div
                    class="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed"
                  >
                    <!-- 回复信息 -->
                    <div
                      v-if="message.replyContent"
                      class="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-blue-400"
                    >
                      <div class="flex items-start">
                        <Icon
                          name="lucide:reply"
                          class="w-3 h-3 mt-0.5 mr-1 flex-shrink-0"
                        />
                        <div class="flex-1 min-w-0">
                          <div class="font-medium text-gray-700 mb-1">
                            回复消息 #{{ message.replyContent.id }}
                          </div>
                          <div
                            v-if="message.replyContent.text"
                            class="text-gray-600 truncate"
                          >
                            {{ message.replyContent.text }}
                          </div>
                          <div v-else class="text-gray-500 italic">
                            消息内容不可用
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 消息文本 -->
                    <div v-html="formatMessageText(message.text)"></div>

                    <!-- 链接列表 -->
                    <div
                      v-if="message.links && message.links.length > 0"
                      class="mt-3 space-y-1"
                    >
                      <div class="text-xs text-gray-500 font-medium">链接:</div>
                      <div class="space-y-1">
                        <a
                          v-for="(link, linkIndex) in message.links"
                          :key="linkIndex"
                          :href="link.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="block text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                          {{ link.text }} → {{ link.url }}
                        </a>
                      </div>
                    </div>

                    <!-- 回复统计 -->
                    <div
                      v-if="message.hasReplies"
                      class="mt-2 text-xs text-gray-500"
                    >
                      <Icon
                        name="lucide:message-circle"
                        class="w-3 h-3 inline mr-1"
                      />
                      {{ message.replyCount }} 条回复
                    </div>
                  </div>
                </div>
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
            <div
              v-if="!loading && messages.length === 0"
              class="text-center py-8"
            >
              <Icon
                name="lucide:message-circle"
                class="mx-auto h-12 w-12 text-gray-400 mb-4"
              />
              <h3 class="text-lg font-medium text-gray-900 mb-2">暂无消息</h3>
              <p class="text-gray-500">开始发送消息吧</p>
            </div>
          </div>

          <!-- 未选择频道状态 -->
          <div v-else class="flex items-center justify-center h-full">
            <div class="text-center">
              <Icon
                name="lucide:message-circle"
                class="mx-auto h-16 w-16 text-gray-400 mb-4"
              />
              <h3 class="text-xl font-medium text-gray-900 mb-2">
                选择频道开始聊天
              </h3>
              <p class="text-gray-500">从左侧选择一个频道查看消息</p>
            </div>
          </div>
        </div>

        <!-- 聊天输入区域 -->
        <div
          v-if="selectedChannel"
          class="p-4 bg-white border-t border-gray-200"
        >
          <div class="flex gap-3">
            <textarea
              v-model="messageText"
              rows="2"
              placeholder="输入消息内容..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              @keydown.ctrl.enter="sendMessage"
              :disabled="loading"
            ></textarea>
            <button
              @click="sendMessage"
              :disabled="loading || !messageText.trim()"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Icon
                v-if="loading"
                name="lucide:loader-2"
                class="animate-spin mr-2"
              />
              <Icon v-else name="lucide:send" class="mr-2" />
              发送
            </button>
          </div>
          <div class="mt-2 text-xs text-gray-500">按 Ctrl+Enter 快速发送</div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md"
    >
      <div class="flex">
        <Icon
          name="lucide:alert-circle"
          class="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
        />
        <div>
          <h3 class="text-sm font-medium text-red-800">操作失败</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
        <button
          @click="error = ''"
          class="ml-2 text-red-400 hover:text-red-600"
        >
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { api } from "@/lib/api";
import { TelegramMessage, ChannelInfo } from "@/lib/telegram/TelegramService";
import TelegramAuth from "@/components/telegram/TelegramAuth.vue";

// 响应式数据
const loading = ref(false);
const messages = ref<TelegramMessage[]>([]);
const error = ref("");
const isAuthenticated = ref(false);

// 频道管理
const channels = ref<ChannelInfo[]>([]);
const selectedChannel = ref<ChannelInfo | null>(null);
const newChannel = ref("");

// 消息输入
const messageText = ref("");

// 消息容器引用
const messagesContainer = ref<HTMLElement | null>(null);

// 用户信息管理
const user = ref(null);

// 从缓存加载用户信息
const loadUserFromCache = () => {
  const userInfoStr = localStorage.getItem("user-info");
  if (userInfoStr) {
    user.value = JSON.parse(userInfoStr);
  }
};

// 从 localStorage 加载频道列表
const loadChannels = () => {
  const channelsStr = localStorage.getItem("telegram-channels");
  if (channelsStr) {
    channels.value = JSON.parse(channelsStr);
    if (channels.value.length > 0) {
      selectChannel(channels.value[0]);
    }
  } else {
    // 添加默认频道 yunpanchat
    newChannel.value = "@yunpanchat";
    addChannel();
  }
};

// 保存频道列表到 localStorage
const saveChannels = () => {
  localStorage.setItem("telegram-channels", JSON.stringify(channels.value));
};

// 添加频道
const addChannel = async () => {
  const username = newChannel.value.trim().replace("@", "");
  if (!username) return;

  try {
    loading.value = true;
    error.value = "";

    // 检查频道是否已存在
    if (channels.value.some((ch) => ch.username === username)) {
      error.value = "频道已存在";
      return;
    }

    // 获取频道信息
    const channelInfo = await api.telegram.getChannelInfo(username);

    // 添加到列表
    channels.value.push(channelInfo);
    saveChannels();

    // 清空输入
    newChannel.value = "";

    // 如果只有1个频道，自动选择
    if (channels.value.length === 1) {
      selectChannel(channels.value[0]);
    }
  } finally {
    loading.value = false;
  }
};

// 移除频道
const removeChannel = (username: string) => {
  const index = channels.value.findIndex((ch) => ch.username === username);
  if (index > -1) {
    channels.value.splice(index, 1);
    saveChannels();

    // 如果删除的是当前选中的频道，清空选择
    if (selectedChannel.value?.username === username) {
      selectedChannel.value = null;
      messages.value = [];
    }
  }
};

// 选择频道
const selectChannel = async (channel: ChannelInfo) => {
  selectedChannel.value = channel;
  messages.value = [];

  // 自动加载消息
  await refreshMessages();
};

// 滚动到底部
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

// 刷新消息
const refreshMessages = async () => {
  if (!selectedChannel.value) return;

  try {
    loading.value = true;
    error.value = "";

    const results = await api.telegram.getMessages(
      selectedChannel.value.username,
      20,
      0
    );

    messages.value = results;

    // 获取消息后自动滚动到底部
    scrollToBottom();
  } finally {
    loading.value = false;
  }
};

// 格式化发送者信息
const formatFrom = (from: any) => {
  if (!from) return "未知";

  if (from.user_id) {
    return `用户 ${from.user_id}`;
  } else if (from.channel_id) {
    return `频道 ${from.channel_id}`;
  } else if (from.chat_id) {
    return `群组 ${from.chat_id}`;
  }

  return "未知";
};

// 格式化相对时间
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  }
};

// 格式化消息文本，支持 Markdown 样式
const formatMessageText = (text: string) => {
  let formattedText = text;

  // 处理粗体文本 (**text**)
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // 处理代码文本 (`text`)
  formattedText = formattedText.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>'
  );

  // 处理链接 [text](url)
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );

  // 处理换行
  formattedText = formattedText.replace(/\n/g, "<br>");

  return formattedText;
};

// 发送消息
const sendMessage = async () => {
  if (!selectedChannel.value || !messageText.value.trim()) {
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    // 发送消息到频道
    await api.telegram.sendMessage(
      selectedChannel.value.username,
      messageText.value
    );

    // 清空输入框
    messageText.value = "";

    // 刷新消息列表
    await refreshMessages();
  } finally {
    loading.value = false;
  }
};

// 处理认证成功
const handleAuthSuccess = () => {
  console.log("认证成功回调触发");
  isAuthenticated.value = true;
};

// 监听认证状态变化
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loadChannels();
  }
});

// 监听消息变化，自动滚动到底部
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);

// 生命周期
onMounted(() => {
  loadUserFromCache();
});
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose p {
  margin: 0;
}
</style>
