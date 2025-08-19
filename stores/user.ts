import { DbUser } from "@/lib/db/types";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  // 状态
  const user = ref<DbUser | null>(null);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  // 从缓存加载用户信息
  const loadUserFromCache = () => {
    if (isLoaded.value) return user.value;

    try {
      const userInfoStr = localStorage.getItem("user-info");
      if (userInfoStr) {
        user.value = JSON.parse(userInfoStr);
        isLoaded.value = true;
        return user.value;
      }
    } catch (error) {
      console.error("加载用户信息失败:", error);
    }

    isLoaded.value = true;
    return null;
  };

  // 设置用户信息
  const setUser = (userData: DbUser | null) => {
    user.value = userData;
    isLoaded.value = true;

    if (userData) {
      localStorage.setItem("user-info", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user-info");
    }
  };

  // 清除用户信息
  const clearUser = () => {
    user.value = null;
    isLoaded.value = true;
    localStorage.removeItem("user-info");
  };

  // 获取用户信息（如果未加载则自动加载）
  const getUser = () => {
    if (!isLoaded.value) {
      return loadUserFromCache();
    }
    return user.value;
  };

  // 检查是否已登录
  const isLoggedIn = computed(() => {
    return user.value !== null;
  });

  return {
    // 状态
    user: readonly(user),
    isLoaded: readonly(isLoaded),
    isLoading: readonly(isLoading),

    // 计算属性
    isLoggedIn,

    // 方法
    loadUserFromCache,
    setUser,
    clearUser,
    getUser,
  };
});
