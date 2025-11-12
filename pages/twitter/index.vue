<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-2xl mx-auto"
      >
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Twitter 视频下载器
        </h1>

        <!-- Input Section -->
        <div class="space-y-4">
          <div>
            <label
              for="tweet-url"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              推文链接
            </label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input
                id="tweet-url"
                v-model="tweetUrl"
                type="text"
                placeholder="https://x.com/user/status/1234567890"
                class="flex-1 block w-full rounded-none rounded-l-md px-3 py-2 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
                :class="{
                  'border-red-500 focus:border-red-500 focus:ring-red-500':
                    urlError,
                }"
                @keyup.enter="fetchVideo"
              />
              <button
                @click="fetchVideo"
                :disabled="loading || !!urlError || !tweetUrl"
                class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <span v-if="loading">
                  <Icon name="eos-icons:loading" class="w-5 h-5" />
                </span>
                <span v-else>获取视频</span>
              </button>
            </div>
            <p
              v-if="urlError"
              class="mt-2 text-sm text-red-600 dark:text-red-400"
            >
              {{ urlError }}
            </p>
          </div>
        </div>

        <!-- Error Display -->
        <div
          v-if="errorMessage"
          class="mt-4 bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong class="font-bold">出错啦!</strong>
          <span class="block sm:inline">{{ errorMessage }}</span>
        </div>

        <!-- Thumbnail Display -->
        <div v-if="thumbnailUrl && !loading" class="mt-8">
          <img
            :src="thumbnailUrl"
            alt="Video thumbnail"
            class="rounded-lg shadow-md mx-auto max-h-72"
          />
        </div>

        <!-- Video Variants Display -->
        <div v-if="videoVariants.length > 0 && !loading" class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            选择视频格式下载
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="variant in videoVariants"
              :key="variant.url"
              class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col justify-between text-center transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                <div class="flex items-center justify-center space-x-2 mb-2">
                  <span
                    class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full"
                    :class="getQualityClass(variant.resolution)"
                  >
                    {{ getQualityLabel(variant.resolution) }}
                  </span>
                  <div
                    class="font-bold text-lg text-gray-800 dark:text-gray-200"
                  >
                    {{ variant.resolution ? variant.resolution : "标准" }}
                  </div>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{
                    variant.bitrate
                      ? (variant.bitrate / 1000).toFixed(0) + " kbps"
                      : "N/A"
                  }}
                </div>
              </div>
              <button
                @click="downloadVideo(variant)"
                :disabled="variant.downloading"
                class="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                <Icon
                  v-if="variant.downloading"
                  name="eos-icons:loading"
                  class="w-5 h-5 mr-2"
                />
                <Icon v-else name="mdi:download" class="w-5 h-5 mr-2" />
                {{ variant.downloading ? "下载中..." : "下载" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { api, showGlobalError } from "@/lib/api";
import type { VideoVariant } from "@/lib/api/client/twitter";

useHead({
  title: "Twitter 视频下载器",
  meta: [
    {
      name: "description",
      content: "从 Twitter/X 链接下载视频",
    },
  ],
});

const tweetUrl = ref("");
const videoVariants = ref<(VideoVariant & { downloading: boolean })[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const urlError = ref("");
const thumbnailUrl = ref<string | null>(null);

const tweetId = computed(() => {
  if (!tweetUrl.value || urlError.value) return null;
  const match = tweetUrl.value.match(/status\/(\d+)/);
  return match ? match[1] : null;
});

const validateUrl = () => {
  if (!tweetUrl.value) {
    urlError.value = "";
    return true;
  }
  const twitterUrlRegex =
    /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  if (!twitterUrlRegex.test(tweetUrl.value)) {
    urlError.value = "请输入有效的 Twitter/X 链接。";
    return false;
  }
  urlError.value = "";
  return true;
};

watch(tweetUrl, validateUrl);

const fetchVideo = async () => {
  if (!tweetId.value) {
    errorMessage.value = "无效或不完整的推文链接。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  videoVariants.value = [];
  thumbnailUrl.value = null;

  try {
    const result = await api.twitter.getVideo(tweetId.value);
    if (result && result.variants && result.variants.length > 0) {
      thumbnailUrl.value = result.thumbnailUrl;
      videoVariants.value = result.variants
        .map((v) => ({ ...v, downloading: false }))
        .sort((a, b) => {
          const resA = a.resolution
            ? parseInt(a.resolution.split("x")[1], 10)
            : 0;
          const resB = b.resolution
            ? parseInt(b.resolution.split("x")[1], 10)
            : 0;
          if (resB !== resA) {
            return resB - resA;
          }
          return (b.bitrate || 0) - (a.bitrate || 0);
        });
    } else {
      errorMessage.value = "未找到视频或该推文不包含视频。";
    }
  } catch (e: any) {
    console.error(e);
    showGlobalError(e.message || "获取视频信息失败。");
    errorMessage.value = e.message || "获取视频信息失败。";
  } finally {
    loading.value = false;
  }
};

const downloadVideo = async (
  variant: VideoVariant & { downloading: boolean }
) => {
  if (!variant.url) return;
  variant.downloading = true;
  try {
    // 使用 fetch 获取视频 blob
    const response = await fetch(variant.url);
    if (!response.ok) throw new Error(`网络响应错误: ${response.statusText}`);
    const blob = await response.blob();

    // 创建一个隐藏的 a 标签来触发下载
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const filename = `twitter_video_${variant.resolution || "std"}.mp4`;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error: any) {
    showGlobalError(error.message || "下载失败，可能是跨域问题。");
    console.error("下载失败:", error);
  } finally {
    variant.downloading = false;
  }
};

const getQualityLabel = (resolution: string | null | undefined): string => {
  if (!resolution) return "标准";
  const height = parseInt(resolution.split("x")[1], 10);
  if (height >= 720) return "高清";
  if (height >= 480) return "标清";
  return "流畅";
};

const getQualityClass = (resolution: string | null | undefined): string => {
  if (!resolution) return "bg-gray-200 text-gray-800";
  const height = parseInt(resolution.split("x")[1], 10);
  if (height >= 720)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (height >= 480)
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
};

definePageMeta({
  auth: false,
});
</script>

<style scoped></style>
