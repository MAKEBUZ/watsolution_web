<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  labels: string[]
  data: number[]
  title: string
  unit?: string
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (chartRef.value) {
    new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels: props.labels,
        datasets: [{
          label: props.title,
          data: props.data,
          backgroundColor: '#0077be',
          borderRadius: 6
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    })
  }
})
</script>

<template>
  <div class="portal-card consumption-chart">
    <div class="card-header">
      <h3>{{ title }}</h3>
      <span v-if="unit" class="badge">{{ unit }}</span>
    </div>
    <div class="chart-wrapper">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.portal-card {
  background: white;
  padding: $spacing-lg;
  border-radius: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid rgba(0, 0, 0, 0.03);

  h3 { font-size: 1.15rem; margin-bottom: $spacing-md; font-weight: 700; color: $color-text; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
  h3 { margin-bottom: 0; }
  
  .badge {
    padding: 4px 12px;
    background: #f1f5f9;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    color: $color-text-muted;
  }
}

.chart-wrapper { height: 220px; }
</style>
