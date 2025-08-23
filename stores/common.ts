// 格式化日期
export const formatDate = (dateString: string) => {
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
export const formatRelativeTime = (dateString: string) => {
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

// 格式化消息文本，支持 Markdown 样式和自动链接检测
export const formatMessageText = (text: string) => {
  if (!text) return "";

  let formattedText = text;

  // 处理粗体文本 (**text**)
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>",
  );

  // 处理代码文本 (`text`) - 在代码块内的内容不处理链接
  formattedText = formattedText.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>',
  );

  // 处理 Markdown 链接 [text](url) - 只显示文本部分
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>',
  );

  // 检测并转换纯文本中的 URL（排除已经在 HTML 标签内的内容）
  formattedText = formattedText.replace(
    /(?<!<[^>]*)(https?:\/\/[^\s<>"{}|\\^`\[\]]+)(?![^<]*>)/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>',
  );

  // 处理换行
  formattedText = formattedText.replace(/\n/g, "<br>");

  return formattedText;
};
