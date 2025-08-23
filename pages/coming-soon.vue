<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
    <div class="max-w-2xl mx-auto text-center px-6">
      <!-- 动画图标 -->
      <div class="mb-8">
        <div class="relative">
          <div class="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center animate-pulse">
            <Icon name="lucide:construction" class="w-12 h-12 text-white" />
          </div>
          <!-- 装饰性圆圈 -->
          <div class="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
          <div class="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.5s;"></div>
        </div>
      </div>

      <!-- 标题 -->
      <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
        功能开发中
      </h1>

      <!-- 副标题 -->
      <p class="text-xl text-gray-600 mb-8 leading-relaxed">
        这个功能正在紧锣密鼓地开发中，很快就会和大家见面！
      </p>

      <!-- 进度条 -->
      <div class="mb-8">
        <div class="flex justify-between text-sm text-gray-500 mb-2">
          <span>开发进度</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div 
            class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>

      <!-- 功能描述 -->
      <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">即将推出的功能</h3>
        <div class="grid md:grid-cols-2 gap-4 text-left">
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 class="font-medium text-gray-800">智能聊天</h4>
              <p class="text-sm text-gray-600">基于 AI 的智能对话系统</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 class="font-medium text-gray-800">实时同步</h4>
              <p class="text-sm text-gray-600">多设备数据实时同步</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 class="font-medium text-gray-800">个性化设置</h4>
              <p class="text-sm text-gray-600">完全自定义的用户体验</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 class="font-medium text-gray-800">数据分析</h4>
              <p class="text-sm text-gray-600">深度数据分析和可视化</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 倒计时 -->
      <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">预计发布时间</h3>
        <div class="flex justify-center space-x-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ countdown.days }}</div>
            <div class="text-sm text-gray-600">天</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ countdown.hours }}</div>
            <div class="text-sm text-gray-600">时</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ countdown.minutes }}</div>
            <div class="text-sm text-gray-600">分</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ countdown.seconds }}</div>
            <div class="text-sm text-gray-600">秒</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="handleBackHome"
          class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          返回首页
        </button>
        <button
          @click="handleNotifyMe"
          class="px-8 py-3 bg-white text-purple-600 font-medium rounded-lg border-2 border-purple-200 hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          功能上线提醒
        </button>
      </div>

      <!-- 装饰性元素 -->
      <div class="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute bottom-10 right-10 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-5 w-12 h-12 bg-blue-200 rounded-full opacity-20 animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- 通知提示 -->
    <Transition name="notification">
      <div
        v-if="showNotification"
        class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
      >
        <div class="flex items-center space-x-2">
          <Icon name="lucide:check-circle" class="w-5 h-5" />
          <span>{{ notificationMessage }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Meta tags
useHead({
  title: '功能开发中 - Nexus of Notions',
  meta: [
    {
      name: 'description',
      content: '功能正在开发中，敬请期待！'
    }
  ]
})

// 响应式数据
const progress = ref(0)
const showNotification = ref(false)
const notificationMessage = ref('')
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

// 目标发布时间（30天后）
const targetDate = new Date()
targetDate.setDate(targetDate.getDate() + 30)

// 更新倒计时
const updateCountdown = () => {
  const now = new Date().getTime()
  const distance = targetDate.getTime() - now

  if (distance > 0) {
    countdown.value = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    }
  } else {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
}

// 模拟进度更新
const updateProgress = () => {
  if (progress.value < 85) {
    progress.value += Math.random() * 5
  }
}

// 返回首页
const handleBackHome = () => {
  navigateTo('/')
}

// 功能上线提醒
const handleNotifyMe = () => {
  notificationMessage.value = '已设置提醒，功能上线时会通知您！'
  showNotification.value = true
  
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// 定时器
let progressTimer: NodeJS.Timeout
let countdownTimer: NodeJS.Timeout

onMounted(() => {
  // 启动进度动画
  progressTimer = setInterval(updateProgress, 2000)
  
  // 启动倒计时
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
/* 通知动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 自定义动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
