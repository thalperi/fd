<template>
  <div class="chart-view">
    <TabView v-model:activeIndex="activeIndex">
      <TabPanel header="Chart.js">
        <ChartJsCandlestick :klines="klines" :isLoading="isLoading" :error="error" />
      </TabPanel>
      <!-- Remove TradingView and ECharts -->
      <!-- <TabPanel header="TradingView LW">
        <TradingViewLightweightChart :klines="klines" :isLoading="isLoading" :error="error" />
      </TabPanel>
      <TabPanel header="ECharts">
        <EChartsCandlestick :klines="klines" :isLoading="isLoading" :error="error" />
      </TabPanel> -->
    </TabView>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import ChartJsCandlestick from './charts/ChartJsCandlestick.vue';
import TradingViewLightweightChart from './charts/TradingViewLightweightChart.vue';
import EChartsCandlestick from './charts/EChartsCandlestick.vue';

const klineStore = useKlineStore();

// Get reactive state refs from the store
const {
  klineData: klines, // Rename for prop binding
  isLoading,
  error,
  selectedChartType // Get selected chart type
} = storeToRefs(klineStore);

// Use a ref to track the active tab index
const activeIndex = ref(0);

// Watch for changes in selectedChartType and update the active tab
watch(selectedChartType, (newType) => {
  switch (newType) {
    case 'ChartJsCandlestick':
      activeIndex.value = 0;
      break;
    case 'TradingViewLightweightChart':
      activeIndex.value = 1;
      break;
    case 'EChartsCandlestick':
      activeIndex.value = 2;
      break;
    default:
      activeIndex.value = 0; // Default to Chart.js
  }
});

// Initialize the active tab based on the store's selectedChartType
// This ensures the correct tab is selected on initial load/reload
const initializeActiveIndex = () => {
  switch (selectedChartType.value) {
    case 'ChartJsCandlestick':
      activeIndex.value = 0;
      break;
    case 'TradingViewLightweightChart':
      activeIndex.value = 1;
      break;
    case 'EChartsCandlestick':
      activeIndex.value = 2;
      break;
    default:
      activeIndex.value = 0; // Default to Chart.js
  }
};

// Call initializeActiveIndex on component mount
onMounted(() => {
  initializeActiveIndex();
});

</script>

<style scoped>
/* Styles will be moved to assets/css/ChartView.css */
.chart-view {
  display: flex;
  flex-direction: column;
  height: 100%; /* Fill the parent container height */
  border-left: 1px solid #ccc; /* Separator for split view */
  background-color: #fff;
}

/* Ensure the dynamically loaded chart container fills the area */
/* .dynamic-chart-area > .chart-container {
    flex-grow: 1;
} */

</style>
