import { onMounted, onUnmounted, ref } from "vue";

export const useErrorHandler = () => {
  const errorMessage = ref("");
  const showError = ref(false);

  const handleError = (error: any) => {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else if (typeof error === "string") {
      errorMessage.value = error;
    } else {
      errorMessage.value = "发生未知错误，请重试";
    }

    showError.value = true;

    console.log(errorMessage.value);
    console.log(showError.value);

    // 3秒后自动清除错误消息
    setTimeout(() => {
      showError.value = false;
      errorMessage.value = "";
    }, 3000);
  };

  const clearError = () => {
    showError.value = false;
    errorMessage.value = "";
  };

  // 监听全局错误事件
  const handleGlobalError = (event: CustomEvent) => {
    console.log("handleGlobalError");
    console.log(event.detail.message);
    handleError(event.detail.message);
  };

  onMounted(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("show-error", handleGlobalError as EventListener);
    }
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener(
        "show-error",
        handleGlobalError as EventListener,
      );
    }
  });

  return {
    errorMessage,
    showError,
    handleError,
    clearError,
  };
};
