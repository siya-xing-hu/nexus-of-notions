<template>
  <div
    class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow w-full"
  >
    <!-- 消息头部 -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-2">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          消息 #{{ message.id }}
        </span>
        <span v-if="message.from" class="text-sm text-gray-500">
          来自: {{ formatFrom(message.from) }}
        </span>
      </div>
    </div>

    <!-- 消息内容 -->
    <div class="prose max-w-none mb-3">
      <!-- 回复信息 -->
      <div
        v-if="message.replyContent"
        class="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-blue-400"
      >
        <div class="flex items-start">
          <Icon name="lucide:reply" class="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-700 mb-1">
              回复消息 #{{ message.replyContent.id }}
            </div>
            <div
              v-if="message.replyContent.text"
              class="text-gray-600 break-words"
            >
              {{ message.replyContent.text }}
            </div>
            <div v-else class="text-gray-500 italic">消息内容不可用</div>
          </div>
        </div>
      </div>

      <p
        class="text-gray-900 whitespace-pre-wrap leading-relaxed break-words"
        v-html="formatMessageText(message.text)"
      ></p>

      <!-- 回复统计 -->
      <div v-if="message.hasReplies" class="mt-2 text-xs text-gray-500">
        <Icon name="lucide:message-circle" class="w-3 h-3 inline mr-1" />
        {{ message.replyCount }} 条回复
      </div>
    </div>

    <!-- 消息统计 -->
    <div class="flex items-center justify-between text-sm text-gray-500">
      <div class="flex items-center space-x-4">
        <div v-if="message.views" class="flex items-center">
          <Icon name="lucide:eye" class="mr-1" />
          <span>{{ message.views }}</span>
        </div>
        <div class="flex items-center">
          <Icon name="lucide:clock" class="mr-1" />
          <span>{{ formatRelativeTime(message.date) }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center space-x-2">
        <button
          @click="copyMessage"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="复制消息内容"
        >
          <Icon name="lucide:copy" class="h-4 w-4" />
        </button>
        <button
          @click="toggleExpand"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          :title="isExpanded ? '收起' : '展开'"
        >
          <Icon
            :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="h-4 w-4"
          />
        </button>
      </div>
    </div>

    <!-- 展开的详细信息 -->
    <div v-if="isExpanded" class="mt-3 pt-3 border-t border-gray-100">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium text-gray-700">消息ID:</span>
          <span class="ml-2 text-gray-900 font-mono">{{ message.id }}</span>
        </div>
        <div>
          <span class="font-medium text-gray-700">发送时间:</span>
          <span class="ml-2 text-gray-900">{{ formatDate(message.date) }}</span>
        </div>
        <div v-if="message.views">
          <span class="font-medium text-gray-700">浏览数:</span>
          <span class="ml-2 text-gray-900">{{ message.views }}</span>
        </div>
        <div v-if="message.from">
          <span class="font-medium text-gray-700">发送者:</span>
          <span class="ml-2 text-gray-900">{{ formatFrom(message.from) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TelegramMessage } from "@/lib/telegram";

interface Props {
  message: TelegramMessage;
}

const props = defineProps<Props>();
const isExpanded = ref(false);

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 格式化消息文本，支持 Markdown 样式和自动链接检测
const formatMessageText = (text: string) => {
  if (!text) return "";

  let formattedText = text;

  // 处理粗体文本 (**text**)
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // 处理代码文本 (`text`) - 在代码块内的内容不处理链接
  formattedText = formattedText.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>'
  );

  // 处理 Markdown 链接 [text](url) - 只显示文本部分
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );

  // 检测并转换纯文本中的 URL（排除已经在 HTML 标签内的内容）
  formattedText = formattedText.replace(
    /(?<!<[^>]*)(https?:\/\/[^\s<>"{}|\\^`\[\]]+)(?![^<]*>)/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );

  // 处理换行
  formattedText = formattedText.replace(/\n/g, "<br>");

  return formattedText;
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
