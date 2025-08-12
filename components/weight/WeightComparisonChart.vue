<template>
  <div class="w-full h-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Props
const props = defineProps({
  currentUserData: {
    type: Array,
    default: () => []
  },
  targetUserData: {
    type: Array,
    default: () => []
  },
  currentUserName: {
    type: String,
    required: true
  },
  targetUserName: {
    type: String,
    required: true
  }
});

// Reactive data
const chartCanvas = ref(null);
let chart = null;

// Methods
const getCommonDates = () => {
  const currentDates = props.currentUserData.map(item => item.date);
  const targetDates = props.targetUserData.map(item => item.date);
  const allDates = [...new Set([...currentDates, ...targetDates])];
  return allDates.sort();
};

const getCurrentUserData = () => {
  const dateMap = {};
  props.currentUserData.forEach(item => {
    dateMap[item.date] = item.weight;
  });
  
  return getCommonDates().map(date => dateMap[date] || null);
};

const getTargetUserData = () => {
  const dateMap = {};
  props.targetUserData.forEach(item => {
    dateMap[item.date] = item.weight;
  });
  
  return getCommonDates().map(date => dateMap[date] || null);
};

const initChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: getCommonDates(),
      datasets: [
        {
          label: props.currentUserName,
          data: getCurrentUserData(),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.1,
          fill: false
        },
        {
          label: props.targetUserName,
          data: getTargetUserData(),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          tension: 0.1,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '体重趋势对比',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} kg`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: '日期'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: '体重 (kg)'
          },
          beginAtZero: false
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
};

const updateChart = () => {
  if (!chart) return;
  
  chart.data.labels = getCommonDates();
  chart.data.datasets[0].data = getCurrentUserData();
  chart.data.datasets[1].data = getTargetUserData();
  chart.update();
};

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

// Watch for data changes
watch([() => props.currentUserData, () => props.targetUserData], () => {
  updateChart();
}, { deep: true });

// Cleanup
onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>
