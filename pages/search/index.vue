<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-center mb-6">
      <Icon
        name="lucide:film"
        class="w-8 h-8 text-primary mr-3 text-green-900"
      />
      <h1 class="text-3xl font-bold text-foreground text-green-900">
        影视资源搜索
      </h1>
    </div>

    <!-- Search Interface -->
    <div class="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
      <select
        v-model="selectedCategory"
        class="select select-bordered w-full md:w-48"
      >
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category"
        >
          {{ category.name }}
        </option>
      </select>

      <div class="flex-1 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="请输入搜索关键词..."
          class="input input-bordered w-full pl-1"
          :disabled="isPolling"
          @keyup.enter="handleSearch"
        />
      </div>

      <button
        @click="handleSearch"
        :disabled="loading || !searchQuery.trim()"
        class="btn btn-primary px-8 border-2 rounded-lg bg-green-900 text-white"
      >
        <Icon
          v-if="loading"
          name="lucide:loader-2"
          class="animate-spin w-4 h-4 mr-2 text-white"
        />
        <Icon v-else name="lucide:search" class="w-4 h-4 mr-2" />
        <span class="text-white">{{ searchButtonText }}</span>
      </button>
    </div>

    <!-- Results Area -->
    <div class="max-w-4xl mx-auto mt-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <p class="text-lg text-gray-600 mb-4">{{ loadingText }}</p>
        <div
          class="radial-progress animate-spin text-primary"
          style="--value: 70"
        ></div>
      </div>

      <!-- Result -->
      <div v-if="result?.message" class="space-y-6">
        <ResultCard :message="result.message" :keyword="lastSearchedKeyword" />
      </div>

      <!-- No results -->
      <div
        v-else-if="searched && !loading && !result?.message"
        class="text-center py-10"
      >
        <Icon
          name="lucide:database-zap"
          class="w-16 h-16 mx-auto text-gray-400 mb-4"
        />
        <h3 class="text-xl font-semibold text-gray-700">未找到任何结果</h3>
        <p class="text-gray-500 mt-2">请尝试更换关键词或检查频道是否正确。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { api, showGlobalError } from "@/lib/api";
import { SearchResult } from "@/lib/handler/SearchHandler";

// 缓存键名
const CACHE_KEY = "non-search-cache";

const searchQuery = ref("");
const result = ref<SearchResult | null>(null);
const loading = ref(false);
const searched = ref(false);
const sentMessageId = ref<number | null>(null);
const pollingInterval = ref<NodeJS.Timeout | null>(null);
const pollingTimeout = ref<NodeJS.Timeout | null>(null);
const lastSearchedKeyword = ref("");
const categories = ref<any[]>([]);
const selectedCategory = ref<any>();

const isPolling = computed(() => pollingInterval.value !== null);

const searchButtonText = computed(() => {
  if (isPolling.value) return "获取中...";
  if (loading.value) return "搜索中...";
  if (sentMessageId.value && !result.value?.message) return "重试查询";
  return "搜索";
});

const loadingText = computed(() => {
  if (isPolling.value) return "已发送搜索指令，正在等待机器人回复...";
  return "正在搜索...";
});

// 缓存相关函数
const saveSearchCache = (searchResult: SearchResult) => {
  const cacheData = {
    searchQuery: searchQuery.value,
    selectedCategory: selectedCategory.value,
    lastSearchedKeyword: lastSearchedKeyword.value,
    result: searchResult,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
};

// 清理轮询
const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
  if (pollingTimeout.value) {
    clearTimeout(pollingTimeout.value);
    pollingTimeout.value = null;
  }
};

const startPolling = (msgId: number) => {
  sentMessageId.value = msgId;

  // 设置轮询器
  pollingInterval.value = setInterval(async () => {
    try {
      const data = await api.search.getResult({
        channel_id: selectedCategory.value.id,
        sentMessageId: msgId,
        keyword: lastSearchedKeyword.value,
      });

      if (data && data.message) {
        result.value = data;
        stopPolling();
        loading.value = false;
        // 保存搜索缓存
        saveSearchCache(data);
      }
    } catch (err: any) {
      showGlobalError(err.message || "获取结果失败");
      stopPolling();
      loading.value = false;
    }
  }, 2000); // 每2秒轮询一次

  // 设置30秒超时
  pollingTimeout.value = setTimeout(() => {
    if (isPolling.value) {
      showGlobalError("获取结果超时，请稍后再试或检查机器人是否正常工作。");
      stopPolling();
      loading.value = false;
    }
  }, 30000);
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    showGlobalError("搜索关键词不能为空");
    return;
  }

  const keywordWithPrefix = searchQuery.value.trim();

  // 情况2：重试查询
  if (sentMessageId.value && lastSearchedKeyword.value === keywordWithPrefix) {
    loading.value = true;
    searched.value = true;
    result.value = null;
    stopPolling();
    startPolling(sentMessageId.value);
    return;
  }

  // 情况1：新搜索
  loading.value = true;
  searched.value = true;
  result.value = null;
  lastSearchedKeyword.value = keywordWithPrefix;
  sentMessageId.value = null;
  stopPolling();

  try {
    const searchResult = await api.search.search({
      channel_id: selectedCategory.value.id,
      keyword: keywordWithPrefix,
    });

    if (searchResult && searchResult.message) {
      // 立即返回结果
      result.value = searchResult;
      loading.value = false;
      // 保存搜索缓存
      saveSearchCache(searchResult);
    } else if (searchResult && searchResult.sentMessageId) {
      // 需要轮询
      startPolling(searchResult.sentMessageId);
    } else {
      loading.value = false;
    }
  } finally {
    loading.value = false;
  }
};

// 如果用户修改搜索条件，则停止当前的轮询并重置状态
watch(
  [searchQuery, selectedCategory],
  () => {
    if (sentMessageId.value) {
      stopPolling();
      loading.value = false;
      sentMessageId.value = null;
    }
  },
  { deep: true }
);

const fetchCategories = async () => {
  categories.value = await api.search.search_channels();
  if (categories.value.length > 0) {
    selectedCategory.value = categories.value[0];
  }
};

const loadCachedData = async () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) {
    return;
  }
  const cachedData = JSON.parse(cached);

  searchQuery.value = cachedData.searchQuery || "";
  lastSearchedKeyword.value = cachedData.lastSearchedKeyword || "";

  // 等待分类加载完成后再设置选中的分类
  if (cachedData.selectedCategory && categories.value.length > 0) {
    // 查找匹配的分类
    const matchedCategory = categories.value.find(
      (channel) => channel.id === cachedData.selectedCategory.id
    );
    if (matchedCategory) {
      selectedCategory.value = matchedCategory;
    }
  }

  // 加载缓存的搜索结果
  if (cachedData.result) {
    result.value = cachedData.result;
    searched.value = true;
  }
};

onMounted(async () => {
  await fetchCategories();
  await loadCachedData();
});
</script>

<style scoped>
/* Custom styles if needed */
</style>
