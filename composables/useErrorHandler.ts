import { ref, onMounted, onUnmounted } from 'vue'

export const useErrorHandler = () => {
  const errorMessage = ref('')
  const showError = ref(false)

  const handleError = (error: any) => {
    console.error('API Error:', error)
    
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else if (typeof error === 'string') {
      errorMessage.value = error
    } else {
      errorMessage.value = '发生未知错误，请重试'
    }
    
    showError.value = true
    
    // 3秒后自动清除错误消息
    setTimeout(() => {
      showError.value = false
      errorMessage.value = ''
    }, 3000)
  }

  const clearError = () => {
    showError.value = false
    errorMessage.value = ''
  }

  // 监听全局错误事件
  const handleGlobalError = (event: CustomEvent) => {
    handleError(event.detail.message)
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('show-error', handleGlobalError as EventListener)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('show-error', handleGlobalError as EventListener)
    }
  })

  return {
    errorMessage,
    showError,
    handleError,
    clearError
  }
}
