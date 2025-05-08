<template>
  <!-- Remove the outer div, container styling is handled by parent -->
  <!-- <div class="chart-view"> --> 
    <v-tabs v-model="activeIndex" grow>
      <v-tab value="0">Chart.js</v-tab>
      <v-tab value="1">ECharts</v-tab>
      <v-tab value="2">TradingView</v-tab>
    </v-tabs>
    <v-window v-model="activeIndex">
      <v-window-item value="0"> <!-- Removed class="full-width" -->
        <ChartJsCandlestick :klines="klines" :isLoading="isLoading" :error="error" />
      </v-window-item>
      <v-window-item value="1">
        <EChartsCandlestick :klines="klines" :isLoading="isLoading" :error="error" />
      </v-window-item>
      <v-window-item value="2">
        <TradingViewChart :klines="klines" :isLoading="isLoading" :error="error" />
      </v-window-item>
    </v-window>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'; // Added onMounted import
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import ChartJsCandlestick from './charts/ChartJsCandlestick.vue';
import EChartsCandlestick from './charts/EChartsCandlestick.vue';
import TradingViewChart from './charts/TradingViewChart.vue';

const klineStore = useKlineStore();

// Get reactive state refs from the store
const {
  klineData: klines, // Rename for prop binding
  isLoading,
  error,
  selectedChartType // Get selected chart type
} = storeToRefs(klineStore);

// Use a ref to track the active tab index
const activeIndex = ref('0'); // Keep as string to match v-tab value

// Watch for changes in selectedChartType and update the active tab
watch(selectedChartType, (newType) => {
  switch (newType) {
    case 'ChartJsCandlestick':
      activeIndex.value = '0';
      break;
    case 'EChartsCandlestick':
      activeIndex.value = '1';
      break;
    case 'TradingViewChart':
      activeIndex.value = '2';
      break;
    default:
      activeIndex.value = '0'; // Default to Chart.js
  }
}, { immediate: true }); // Run immediately to sync on load

// The initializeActiveIndex function is redundant because the watcher runs immediately
// const initializeActiveIndex = () => { ... };
// onMounted(() => { initializeActiveIndex(); });

</script>

<style scoped>
/* Remove the import - styles are now handled by parent or Vuetify */
/* @import '../assets/css/ChartView.css'; */

/* Add any essential scoped styles here if needed, e.g., min-height */
.v-window {
  min-height: 300px; /* Example: ensure window has some height */
}
</style>
