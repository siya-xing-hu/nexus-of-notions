import { useUserStore } from '@/stores/user'

export const useUser = () => {
  const userStore = useUserStore()

  return {
    // 用户信息
    user: userStore.user,
    isLoggedIn: userStore.isLoggedIn,
    isLoaded: userStore.isLoaded,
    
    // 方法
    getUser: userStore.getUser,
    setUser: userStore.setUser,
    clearUser: userStore.clearUser,
    loadUserFromCache: userStore.loadUserFromCache
  }
}
