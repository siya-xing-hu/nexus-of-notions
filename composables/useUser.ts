import { useUserStore } from "@/stores/user";

export const useUser = () => {
  const userStore = useUserStore();

  return {
    // 用户信息
    user: userStore.user.value,
    isLoggedIn: userStore.isLoggedIn.value,

    // 方法
    getUser: userStore.getUser,
    setUser: userStore.setUser,
    clearUser: userStore.clearUser,
  };
};
