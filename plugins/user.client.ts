export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  
  // 在客户端启动时自动加载用户信息
  userStore.loadUserFromCache()
})
