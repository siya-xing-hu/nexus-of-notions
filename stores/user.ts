import { DbUser } from "@/lib/db/types";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  // 状态
  const user = ref<DbUser | null>(null);

  // 从缓存加载用户信息
  const loadUserFromCache = () => {
    if (user.value) return user.value;

    try {
      const userInfoStr = localStorage.getItem("user-info");
      if (userInfoStr) {
        user.value = JSON.parse(userInfoStr);
        return user.value;
      }
    } catch (error) {
      console.error("加载用户信息失败:", error);
    }

    return null;
  };

  // 设置用户信息
  const setUser = (userData: DbUser | null) => {
    user.value = userData;

    if (userData) {
      localStorage.setItem("user-info", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user-info");
    }
  };

  // 清除用户信息
  const clearUser = () => {
    user.value = null;
    localStorage.removeItem("user-info");
  };

  // 获取用户信息（如果未加载则自动加载）
  const getUser = () => {
    if (!user.value) {
      return loadUserFromCache();
    }
    return user.value;
  };

  // 检查是否已登录
  const isLoggedIn = computed(() => {
    return user.value !== null && user.value !== undefined;
  });

  return {
    // 状态
    user: readonly(user),

    // 计算属性
    isLoggedIn,

    // 方法
    getUser,
    setUser,
    clearUser,
    loadUserFromCache,
  };
});
