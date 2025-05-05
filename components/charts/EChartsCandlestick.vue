<template>
  <div class="chart-container echarts-candlestick">
    <h4>ECharts Candlestick</h4>
    <!-- ECharts renders into a div -->
    <div ref="chartTarget" class="chart-render-target"></div>
     <div v-if="isLoading">Loading Chart Data...</div>
     <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';
import type { Kline } from '~/db';
import * as echarts from 'echarts/core';
import { CandlestickChart, type CandlestickSeriesOption } from 'echarts/charts';
import {
  GridComponent, type GridComponentOption,
  TooltipComponent, type TooltipComponentOption,
  DataZoomComponent, type DataZoomComponentOption,
  VisualMapComponent, type VisualMapComponentOption // Optional for coloring
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features'; // For smoother updates
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';

// Combine option types
type ECOption = echarts.ComposeOption<
  | CandlestickSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | DataZoomComponentOption
  | VisualMapComponentOption // Optional
>;

// Register necessary ECharts components
echarts.use([
  CandlestickChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  VisualMapComponent, // Optional
  CanvasRenderer,
  UniversalTransition
]);

const props = defineProps<{
  klines: Kline[];
  isLoading: boolean;
  error: string | null;
}>();

const klineStore = useKlineStore();
const { currentSymbolOpenOrders: openOrders, selectedOrderId } = storeToRefs(klineStore);

const chartTarget = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Function to format data for ECharts
const formatChartData = (data: Kline[]) => {
  const categoryData: string[] = []; // Timestamps formatted as strings for axis
  const values: number[][] = []; // [open, close, low, high]

  data.forEach(kline => {
    // Format timestamp for display on axis (adjust format as needed)
    categoryData.push(new Date(kline.timestamp).toLocaleString());
    values.push([
      parseFloat(kline.open),
      parseFloat(kline.close), // Echarts order: open, close, low, high
      parseFloat(kline.low),
      parseFloat(kline.high)
    ]);
  });

  return { categoryData, values };
};

// Compute markLine data for open orders
const computedMarkLines = computed(() => {
    const markLineData: any[] = [];
    openOrders.value.forEach(order => {
        const isSelected = order.orderId === selectedOrderId.value;
        const color = order.side === 'BUY' ? (isSelected ? 'lightgreen' : 'darkgreen') : (isSelected ? '#F08080' : '#8B0000');
        markLineData.push({
            yAxis: parseFloat(order.price),
            name: `${order.side} @ ${order.price}`,
            lineStyle: {
                color: color,
                width: isSelected ? 3 : 1.5,
                type: isSelected ? 'solid' : 'dashed'
            },
            label: {
                formatter: '{b}', // Show name
                position: 'insideStartTop',
                color: 'white',
                backgroundColor: color,
                padding: [2, 5]
            }
        });
    });
    return markLineData;
});

const setChartOptions = () => {
    if (!chartInstance || !props.klines) return;

    const { categoryData, values } = formatChartData(props.klines);
    console.log('ECharts setting options with', values.length, 'points');

    const options: ECOption = {
        // title: { text: 'ECharts Candlestick', left: 'center' }, // Title inside chart
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        grid: { // Adjust grid padding
            left: '10%',
            right: '10%',
            bottom: '15%' // Increase bottom padding for dataZoom
        },
        xAxis: {
            type: 'category',
            data: categoryData,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin', // Show from the start of the data
            max: 'dataMax' // Show until the end of the data
        },
        yAxis: {
            scale: true, // Allow scaling based on data range
            splitArea: { show: true } // Optional background bands
        },
        dataZoom: [ // Enable zooming and panning
            { type: 'inside', start: 50, end: 100 }, // Initial zoom range
            { show: true, type: 'slider', bottom: '5%', start: 50, end: 100 }
        ],
        series: [
            {
                name: 'Candlestick',
                type: 'candlestick',
                data: values,
                itemStyle: { // Define colors for up/down candles
                    color: '#00B746', // Up color (green)
                    color0: '#EF403C', // Down color (red)
                    borderColor: '#00B746',
                    borderColor0: '#EF403C'
                },
                markLine: { // Add mark lines for open orders
                    data: computedMarkLines.value,
                    symbol: 'none', // Hide the default symbol
                    animation: false // Disable animation for smoother updates
                }
                // Optional: Mark points/lines, moving averages etc.
            }
        ]
    };

    chartInstance.setOption(options, { notMerge: false }); // Use notMerge: false for incremental updates if possible
};


// Handle resizing
const handleResize = () => {
    chartInstance?.resize();
};

onMounted(async () => {
    console.log("EChartsCandlestick mounted.");
    if (chartTarget.value) {
        console.log("EChartsCandlestick - Target dimensions before init:", {
          offsetWidth: chartTarget.value.offsetWidth,
          offsetHeight: chartTarget.value.offsetHeight,
          clientWidth: chartTarget.value.clientWidth,
          clientHeight: chartTarget.value.clientHeight
        });

        await nextTick(); // Ensure DOM is ready
        chartInstance = echarts.init(chartTarget.value);
        console.log('ECharts instance initialized.');
        setChartOptions(); // Set initial options
        window.addEventListener('resize', handleResize);
    }
    console.log("EChartsCandlestick - selectedChartType:", klineStore.selectedChartType);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
        console.log('ECharts instance disposed.');
    }
});

// Watch for kline data changes
watch(() => props.klines, () => {
    if (chartInstance) {
        setChartOptions(); // Update chart with new data
        handleResize(); // Call handleResize after updating data
    }
}, { deep: true });

// Watch for changes in openOrders or selectedOrderId
watch([openOrders, selectedOrderId], () => {
    if (chartInstance) {
        setChartOptions(); // Re-set options to update markLines
    }
});

// Watch loading/error states
// (Template already handles basic messages)

</script>

<!-- No <style> block needed, uses assets/css/ChartContainer.css -->
