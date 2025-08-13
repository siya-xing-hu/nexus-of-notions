<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusClasses
    ]"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  status: 'WAITING' | 'PLAYING' | 'FINISHED'
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  switch (props.status) {
    case 'WAITING':
      return 'bg-yellow-100 text-yellow-800'
    case 'PLAYING':
      return 'bg-green-100 text-green-800'
    case 'FINISHED':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'WAITING':
      return '等待加入'
    case 'PLAYING':
      return '进行中'
    case 'FINISHED':
      return '已结束'
    default:
      return '未知'
  }
})
</script>
