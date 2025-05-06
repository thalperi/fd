<template>
  <div class="chart-container chartjs-candlestick">
    <h4>Chart.js Candlestick</h4>
    <canvas ref="chartCanvas"></canvas>
    <div v-if="isLoading">Loading Chart Data...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'; // Add computed
import type { Kline } from '~/db';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, OhlcController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns'; // Import adapter
import annotationPlugin from 'chartjs-plugin-annotation'; // Import annotation plugin
import { storeToRefs } from 'pinia'; // Import storeToRefs
import { useKlineStore } from '~/stores/klineStore'; // Import store

// Register Chart.js components including the annotation plugin
Chart.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement, annotationPlugin, ...registerables);

const props = defineProps<{
  klines: Kline[];
  isLoading: boolean;
  error: string | null;
}>();

const klineStore = useKlineStore();
const { currentSymbolOpenOrders: openOrders, selectedOrderId } = storeToRefs(klineStore);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
import type { ChartConfiguration, ChartTypeRegistry } from 'chart.js';

type CustomChartInstance = Chart<'candlestick', { x: number; o: number; h: number; l: number; c: number; }[], unknown> & {
  options: ChartConfiguration<'candlestick'> & {
    plugins: NonNullable<ChartConfiguration<'candlestick'>['options']['plugins']>;
  };
};

let chartInstance: CustomChartInstance | null = null; // Keep as let for reassignment

// Function to format data for Chart.js financial chart
const formatChartData = (data: Kline[]) => {
  return data.map(kline => ({
    x: kline.timestamp, // Use timestamp directly (requires time scale)
    o: parseFloat(kline.open),
    h: parseFloat(kline.high),
    l: parseFloat(kline.low),
    c: parseFloat(kline.close),
  }));
};

// Compute annotation options based on open orders and selected order
const annotationOptions = computed(() => {
    const annotations: Record<string, any> = {};
    openOrders.value.forEach(order => {
        const isSelected = order.orderId === selectedOrderId.value;
        const color = order.side === 'BUY' ? (isSelected ? '#90EE90' : '#006400') : (isSelected ? '#F08080' : '#8B0000');
        const borderWidth = isSelected ? 3 : 1.5; // Highlight selected order
        const borderDash = isSelected ? [] : [6, 6]; // Solid or dashed

        annotations[`order-${order.orderId}`] = {
            type: 'line',
            borderColor: color,
            borderWidth: borderWidth,
            borderDash: borderDash, // Make it dashed
            label: {
                display: true,
                content: `${order.side} @ ${order.price}`,
                position: 'end',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                font: { size: 10 },
                padding: 2,
                yAdjust: -5, // Adjust label position slightly
            },
            scaleID: 'y', // Attach to the Y-axis
            value: parseFloat(order.price) // The price level for the line
        };
    });
    return annotations; // Return annotations directly instead of wrapping in an object
});

const renderOrUpdateChart = () => {
  if (!chartCanvas.value) return;

  const formattedData = formatChartData(props.klines);

  if (chartInstance) {
    // Update existing chart
    chartInstance.data.datasets[0].data = formattedData;
    chartInstance.options.plugins.annotation = annotationOptions.value; // Update annotations
    chartInstance.update();
    console.log('Chart.js updated with', formattedData.length, 'points');
    console.log('Annotations updated:', annotationOptions.value);
  } else {
    // Create new chart instance
    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;

    chartInstance = new Chart(ctx, {
      type: 'candlestick', // Use the registered candlestick type
      data: {
        datasets: [{
          label: 'Candlestick',
          data: formattedData,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Important for filling container height
        scales: {
          x: {
            type: 'time', // Use time scale
            time: {
              // unit: 'minute', // Adjust based on interval?
              tooltipFormat: 'PPpp', // Date fns format for tooltip
            },
            title: {
              display: true,
              text: 'Time'
            },
            ticks: {
              source: 'auto', // Automatically determine ticks
              maxRotation: 0,
              autoSkip: true,
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price'
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          annotation: annotationOptions.value, // Set annotations here
          legend: {
            display: false // Hide legend for single dataset
          },
          // zoom: { // Optional zoom plugin (requires separate import/install)
          //   pan: { enabled: true, mode: 'x' },
          //   zoom: { wheel: { enabled: true }, mode: 'x' },
          // }
        }
      }
    });

    // Ensure plugins is initialized
    if (!chartInstance.options.plugins) {
      chartInstance.options.plugins = {};
    }

    console.log('Chart.js created with', formattedData.length, 'points');
    console.log('Annotations set:', annotationOptions.value);
  }
};

onMounted(() => {
  console.log("ChartJsCandlestick mounted.");
  if (chartCanvas.value) {
    console.log("ChartJsCandlestick - Target dimensions before init:", {
      offsetWidth: chartCanvas.value.offsetWidth,
      offsetHeight: chartCanvas.value.offsetHeight,
      clientWidth: chartCanvas.value.clientWidth,
      clientHeight: chartCanvas.value.clientHeight
    });
  }

  // Render chart when component mounts if data is available
  if (props.klines.length > 0) {
    renderOrUpdateChart();
  }

  if (chartCanvas.value) {
    console.log("ChartJsCandlestick - Target dimensions after init:", {
      offsetWidth: chartCanvas.value.offsetWidth,
      offsetHeight: chartCanvas.value.offsetHeight,
      clientWidth: chartCanvas.value.clientWidth,
      clientHeight: chartCanvas.value.clientHeight
    });
  }
  console.log("ChartJsCandlestick - selectedChartType:", klineStore.selectedChartType);
});

onBeforeUnmount(() => {
  // Destroy chart instance to prevent memory leaks
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
    console.log('Chart.js instance destroyed.');
  }
});

// Watch for changes in klines data and update the chart
watch(() => props.klines, () => {
  renderOrUpdateChart();
}, { deep: true });

// Watch for changes in orders or selected order to update annotations
watch([openOrders, selectedOrderId], () => {
    if (chartInstance) {
        console.log("Orders or selected order changed, updating annotations...");
        try {
            if (!chartInstance.options.plugins) {
                chartInstance.options.plugins = {};
            }
            if (!chartInstance.options.plugins.annotation) {
                chartInstance.options.plugins.annotation = {};
            }
            chartInstance.options.plugins.annotation = annotationOptions.value;
            chartInstance.update();
        } catch (e) {
            console.error("Error updating chart annotations:", e);
        }
    }
}, { deep: true });


// Watch for loading state to potentially clear chart or show overlay
watch(() => props.isLoading, (loading) => {
    if (loading && chartInstance) {
        // Optionally clear chart or show loading indicator over canvas
        // chartInstance.data.datasets[0].data = [];
        // chartInstance.update();
    }
});

</script>

<!-- Styles will be moved to assets/css/ChartJsCandlestick.css -->
