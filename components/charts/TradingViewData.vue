<template>
  <div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { Kline } from '~/db';
import type { ISeriesApi, CandlestickData } from 'lightweight-charts';

const props = defineProps<{
  klines: Kline[];
  candlestickSeries: ISeriesApi<'Candlestick'> | null;
}>();

// Function to format data for Lightweight Charts
// IMPORTANT: Lightweight Charts expects time in seconds (UTC) or business day object
const formatChartData = (data: Kline[]): CandlestickData[] => {
  return data.map(kline => ({
    time: (kline.timestamp / 1000), // Convert ms to seconds
    open: parseFloat(kline.open),
    high: parseFloat(kline.high),
    low: parseFloat(kline.low),
    close: parseFloat(kline.close),
  })).sort((a, b) => a.time - b.time); // Ensure data is sorted by time
};

const updateChartData = () => {
    if (!props.candlestickSeries) {
        console.log("updateChartData called, but candlestickSeries is null.");
        return;
    }
     if (!props.klines || props.klines.length === 0) {
        console.log("updateChartData called, but props.klines is empty.");
        // Optionally clear the series if klines become empty
        // candlestickSeries.value.setData([]);
        return;
    }

    const formattedData = formatChartData(props.klines);
    console.log('TradingView Lightweight Chart - Formatted data for setData:', formattedData); // Log formatted data

    // Call method on ref's value - no type assertion needed now
    props.candlestickSeries.setData(formattedData);
    console.log('TradingView Lightweight Chart setData called with:', formattedData.length, 'points');

    // Optional: Fit content after setting data initially or on significant changes
    // chartInstance?.timeScale().fitContent();
};

watch(() => props.klines, () => {
    // Only update if the series has been successfully initialized
    if (props.candlestickSeries) {
        updateChartData();
    } else {
        console.log("Kline data changed, but candlestickSeries is not yet initialized.");
    }
}, { deep: true });

</script>
