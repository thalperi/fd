<template>
  <div class="tradingview-chart">
    <!-- Lightweight Charts renders into a div -->
    <div ref="chartTarget" style="height: 100%; width: 100%;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createChart, type IChartApi, type ISeriesApi, LineStyle } from 'lightweight-charts';

const chartTarget = ref<HTMLDivElement | null>(null);
const chartInstance = ref<IChartApi | null>(null);
const candlestickSeries = ref<ISeriesApi<'Candlestick'> | null>(null);

defineExpose({
  chartInstance,
  candlestickSeries,
  chartTarget
});

onMounted(() => {
    if (!chartTarget.value) {
        console.error("TradingView chart target element not found on mount.");
        return;
    }

    try {
        chartInstance.value = createChart(chartTarget.value, {
             width: chartTarget.value.clientWidth,
             height: chartTarget.value.clientHeight,
             layout: {
                 background: { color: '#ffffff' },
                 textColor: '#333',
             },
             grid: {
                 vertLines: { color: '#e1e4e8' },
                 horzLines: { color: '#e1e4e8' },
             },
             timeScale: {
                 timeVisible: true, // Show time
                 secondsVisible: false, // Hide seconds unless interval is very small
             },
             // Add crosshair, localization, etc. if needed
         });

    // Ensure chart instance was created successfully
    if (!chartInstance.value) {
        console.error("Failed to create TradingView chart instance.");
        return;
    }

    candlestickSeries.value = chartInstance.value.addCandlestickSeries({
        upColor: '#00B746',
        downColor: '#EF403C',
        borderVisible: false,
        wickUpColor: '#00B746',
        wickDownColor: '#EF403C',
    });

    console.log('TradingView Lightweight Chart initialized.');
    } catch (error) {
        console.error("Error during TradingView chart initialization:", error);
        // Optionally set an error state in Pinia store if needed
        // klineStore.setError('Failed to initialize TradingView chart.');
    }
});

onBeforeUnmount(() => {
    // Remove chart instance
    if (chartInstance.value) {
        chartInstance.value.remove();
        chartInstance.value = null;
        candlestickSeries.value = null;
        console.log('TradingView Lightweight Chart instance removed.');
    }
});
</script>

<style scoped>
.tradingview-chart {
    width: 100%;
    height: 100%;
}
</style>
