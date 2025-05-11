<template>
  <div class="chart-container chartjs-candlestick">
    <canvas ref="chartCanvas"></canvas>
    <div v-if="isLoading && !klines.length" class="loading-overlay">Loading Chart Data...</div>
    <div v-if="!isLoading && error" class="error-overlay">{{ error }}</div>
    <div v-if="!isLoading && !error && klines.length === 0" class="no-data-overlay">No data to display.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import type { Kline } from '~/db';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import { useThemeStore, type ChartThemeColors } from '~/stores/themeStore'; // Import ChartThemeColors type
import type { ChartConfiguration, Color, ChartDataset, ChartOptions } from 'chart.js';

interface FinancialDatasetColorOptions {
  up: Color;
  down: Color;
  unchanged: Color;
}

interface CandlestickChartDataset extends ChartDataset<'candlestick', { x: number; o: number; h: number; l: number; c: number; }[]> {
  color?: FinancialDatasetColorOptions; 
}

Chart.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement, annotationPlugin, ...registerables);

const props = defineProps<{
  klines: Kline[];
  isLoading: boolean;
  error: string | null;
}>();

const klineStore = useKlineStore();
const themeStore = useThemeStore(); 

const { currentSymbolOpenOrders: openOrders, selectedOrderId } = storeToRefs(klineStore);
const { activeThemeConfig } = storeToRefs(themeStore); 

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null; 

const formatChartData = (data: Kline[]) => {
  return data.map(kline => ({
    x: kline.timestamp, o: parseFloat(kline.open), h: parseFloat(kline.high), l: parseFloat(kline.low), c: parseFloat(kline.close),
  }));
};

const currentAnnotationOptions = computed(() => {
    const annotationsConfig: Record<string, any> = {};
    const chartColors = activeThemeConfig.value?.chartTheme; // Use chartTheme
    const uiColors = activeThemeConfig.value?.vuetifyTheme.colors; // For non-chart specific UI elements like success/error

    const buyColorSelected = uiColors?.success || '#90EE90';
    const buyColorDefault = chartColors?.chartCandleUp || '#006400'; 
    const sellColorSelected = uiColors?.error || '#F08080';
    const sellColorDefault = chartColors?.chartCandleDown || '#8B0000'; 
    const tooltipBg = chartColors?.tooltipBackground || 'rgba(0,0,0,0.6)';
    const tooltipTxt = chartColors?.tooltipTextColor || 'white';

    openOrders.value.forEach(order => {
        const isSelected = order.orderId === selectedOrderId.value;
        const color = order.side === 'BUY' ? (isSelected ? buyColorSelected : buyColorDefault) : (isSelected ? sellColorSelected : sellColorDefault);
        const borderWidth = isSelected ? 3 : 1.5;
        const borderDash = isSelected ? [] : [6, 6];

        annotationsConfig[`order-${order.orderId}`] = {
            type: 'line', borderColor: color, borderWidth: borderWidth, borderDash: borderDash,
            label: { display: true, content: `${order.side} @ ${order.price}`, position: 'end', backgroundColor: tooltipBg, color: tooltipTxt, font: { size: 10 }, padding: 2, yAdjust: -5, },
            scaleID: 'y', value: parseFloat(order.price)
        };
    });
    return { annotations: annotationsConfig }; 
});

const getChartOptions = (): ChartOptions<'candlestick'> => {
  const chartColors = activeThemeConfig.value?.chartTheme; // Use chartTheme
  const isDark = activeThemeConfig.value?.vuetifyTheme.dark; // Still need global dark mode for fallbacks

  const chartBg = chartColors?.chartBackground || (isDark ? '#1E1E1E' : '#FFFFFF');
  const gridColor = chartColors?.chartGridColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
  const textColor = chartColors?.chartTextColor || (isDark ? '#B0BEC5' : '#666666');
  const tooltipBg = chartColors?.tooltipBackground || (isDark ? 'rgba(20,20,20,0.9)' : 'rgba(0,0,0,0.8)');
  const tooltipTxt = chartColors?.tooltipTextColor || (isDark ? '#E0E0E0' : '#FFFFFF');

  if (chartCanvas.value) {
      chartCanvas.value.style.backgroundColor = chartBg;
  }

  const options = { 
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { type: 'time', time: { tooltipFormat: 'PPpp' }, title: { display: true, text: 'Time', color: textColor as Color }, grid: { color: gridColor as Color }, ticks: { source: 'auto', maxRotation: 0, autoSkip: true, color: textColor as Color } },
      y: { title: { display: true, text: 'Price', color: textColor as Color }, grid: { color: gridColor as Color }, ticks: { color: textColor as Color } }
    },
    plugins: { 
      tooltip: { mode: 'index', intersect: false, backgroundColor: tooltipBg as Color, titleColor: tooltipTxt as Color, bodyColor: tooltipTxt as Color, borderColor: gridColor as Color, borderWidth: 1, },
      annotation: currentAnnotationOptions.value, 
      legend: { display: false },
    },
  };
  return options as ChartOptions<'candlestick'>;
};

const renderOrUpdateChart = () => {
  if (!chartCanvas.value) return;
  const formattedData = formatChartData(props.klines);
  const options = getChartOptions(); 

  const chartColors = activeThemeConfig.value?.chartTheme; // Use chartTheme
  const candleUp = (chartColors?.chartCandleUp || '#26A69A') as Color;
  const candleDown = (chartColors?.chartCandleDown || '#EF5350') as Color;
  const candleUnchanged = (chartColors?.chartCandleWick || chartColors?.chartCandleUp || '#26A69A') as Color;

  if (chartInstance) {
    const chart = chartInstance as Chart<'candlestick'>; 
    chart.data.datasets[0].data = formattedData;
    (chart.data.datasets[0] as CandlestickChartDataset).color = { up: candleUp, down: candleDown, unchanged: candleUnchanged };
    chart.options = options; 
    chart.update();
  } else {
    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;
    const datasetWithColors: CandlestickChartDataset = {
        label: 'Candlestick', data: formattedData,
        color: { up: candleUp, down: candleDown, unchanged: candleUnchanged, }
    };
    chartInstance = new Chart(ctx, { type: 'candlestick', data: { datasets: [datasetWithColors] }, options: options });
  }
};

onMounted(() => { if (props.klines.length > 0) { renderOrUpdateChart(); } });
onBeforeUnmount(() => { if (chartInstance) { chartInstance.destroy(); chartInstance = null; } });
watch(() => props.klines, () => { renderOrUpdateChart(); }, { deep: true });
watch([openOrders, selectedOrderId, activeThemeConfig], () => { 
    if (chartInstance) {
        const newAnnotations = currentAnnotationOptions.value;
        const chart = chartInstance as Chart<'candlestick'>;
        if (chart.options && chart.options.plugins) { 
            chart.options.plugins.annotation = newAnnotations;
            chart.update();
        }
    }
}, { deep: true });

watch(activeThemeConfig, () => {
    // console.log("Theme changed, re-rendering Chart.js with new theme options"); // Keep for debugging if needed
    renderOrUpdateChart(); 
}, { deep: true });

</script>

<style scoped>
.chart-container.chartjs-candlestick {
  width: 100%;
  min-height: 300px; 
  position: relative;
}
.loading-overlay, .error-overlay, .no-data-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  border-radius: 4px;
  background-color: rgba(var(--v-theme-surface-variant, 0,0,0), 0.8); 
  color: rgb(var(--v-theme-on-surface-variant, 255,255,255)); 
  z-index: 10;
}
.error-overlay {
  background-color: rgba(var(--v-theme-error, 200,0,0), 0.8);
  color: rgb(var(--v-theme-on-error, 255,255,255));
}
canvas {
  width: 100%;
  height: 100%;
  display: block; 
}
</style>
