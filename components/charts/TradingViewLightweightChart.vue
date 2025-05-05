<template>
  <div class="chart-container tradingview-lightweight-chart">
    <h4>TradingView Lightweight Chart</h4>
    <!-- Wrap chart rendering in ClientOnly -->
    <ClientOnly>
      <div ref="chartTarget" class="chart-render-target" style="height: 100%; width: 100%;"></div>
      <!-- Show messages as overlays or placeholders if needed -->
      <div v-if="isLoading && !chartInstance" class="chart-message">Loading Chart Data...</div>
      <div v-if="error" class="chart-message error">{{ error }}</div>
      <template #fallback>
        <!-- Optional: Placeholder while waiting for client-side render -->
        <div class="chart-message">Initializing chart...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import type { Kline } from '~/db';
// Revert to named imports for lightweight-charts v4
// Import additional types needed for price lines
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData, type Time, type PriceLineOptions, type IPriceLine, LineStyle } from 'lightweight-charts';
import { storeToRefs } from 'pinia'; // Import storeToRefs
import { useKlineStore } from '~/stores/klineStore'; // Import store

const props = defineProps<{
  klines: Kline[];
  isLoading: boolean;
  error: string | null;
}>();

const klineStore = useKlineStore();
const { currentSymbolOpenOrders: openOrders, selectedOrderId } = storeToRefs(klineStore);

const chartTarget = ref<HTMLDivElement | null>(null);
// Use ref with specific types
const chartInstance = ref<IChartApi | null>(null);
const candlestickSeries = ref<ISeriesApi<'Candlestick'> | null>(null);
const priceLines = ref<Map<number, IPriceLine>>(new Map()); // Store price lines by orderId

// Function to format data for Lightweight Charts
// IMPORTANT: Lightweight Charts expects time in seconds (UTC) or business day object
const formatChartData = (data: Kline[]): CandlestickData[] => {
  return data.map(kline => ({
    time: (kline.timestamp / 1000) as Time, // Convert ms to seconds
    open: parseFloat(kline.open),
    high: parseFloat(kline.high),
    low: parseFloat(kline.low),
    close: parseFloat(kline.close),
  })).sort((a, b) => a.time as number - (b.time as number)); // Ensure data is sorted by time
};

const initializeChart = () => { // No longer async
    // Check refs using .value
    if (!chartTarget.value || chartInstance.value || typeof window === 'undefined') return;

    // Re-add try...catch
    try {
        console.log("Attempting to create chart. Target element:", chartTarget.value); // Log target before createChart
        if (!chartTarget.value) throw new Error("Chart target element is null.");

        // Use named import createChart, restore options
        chartInstance.value = createChart(chartTarget.value, {
             width: chartTarget.value.clientWidth,
             height: chartTarget.value.clientHeight, // Use container dimensions
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

    // Log the created instance to inspect it
    console.log('Chart instance created:', chartInstance.value);

    // Ensure chart instance was created successfully and log methods
    if (!chartInstance.value || typeof chartInstance.value.addCandlestickSeries !== 'function') {
        console.error("Failed to create valid TradingView chart instance or addCandlestickSeries method missing.", chartInstance.value ? Object.keys(chartInstance.value) : 'Instance is null');
        return;
    }

    // Assign to ref's value - no type assertion needed now
    console.log("Attempting to add candlestick series...");
    candlestickSeries.value = chartInstance.value.addCandlestickSeries({
        upColor: '#00B746',
        downColor: '#EF403C',
        borderVisible: false,
        wickUpColor: '#00B746',
        wickDownColor: '#EF403C',
    });

    console.log('TradingView Lightweight Chart initialized.');

    // Call update immediately if data is already available
    if (props.klines.length > 0) {
        updateChartData();
    }

    // Call updateOrderLines after chart is initialized and data is loaded
    updateOrderLines();

    } catch (error) {
        console.error("Error during TradingView chart initialization:", error);
        // Optionally set an error state in Pinia store if needed
        // klineStore.setError('Failed to initialize TradingView chart.');
    }
};

const updateChartData = () => {
    // Check ref's value
    // Check ref's value
    if (!candlestickSeries.value) {
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
    candlestickSeries.value.setData(formattedData);
    console.log('TradingView Lightweight Chart setData called with:', formattedData.length, 'points');

    // Optional: Fit content after setting data initially or on significant changes
    // chartInstance?.timeScale().fitContent();
};

// Function to update or create price lines for orders
const updateOrderLines = () => {
    if (!candlestickSeries.value) return;

    const existingLineIds = new Set(priceLines.value.keys());
    const currentOrderIds = new Set(openOrders.value.map(o => o.orderId));

    // Remove lines for orders that no longer exist
    existingLineIds.forEach(orderId => {
        if (!currentOrderIds.has(orderId)) {
            const lineToRemove = priceLines.value.get(orderId);
            if (lineToRemove) {
                candlestickSeries.value?.removePriceLine(lineToRemove);
                priceLines.value.delete(orderId);
                console.log(`Removed price line for order ${orderId}`);
            }
        }
    });

    // Add or update lines for current orders
    openOrders.value.forEach(order => {
        const isSelected = order.orderId === selectedOrderId.value;
        // Use lighter/darker shades for better visibility
        const color = order.side === 'BUY' ? (isSelected ? '#90EE90' : '#006400') : (isSelected ? '#F08080' : '#8B0000');
        const lineWidth = isSelected ? 2 : 1;
        const lineStyle = isSelected ? LineStyle.Solid : LineStyle.Dashed;

        const lineOptions: PriceLineOptions = {
            price: parseFloat(order.price),
            color: color,
            lineWidth: lineWidth,
            lineStyle: lineStyle,
            axisLabelVisible: true,
            title: `${order.side} @ ${order.price}`,
        };

        const existingLine = priceLines.value.get(order.orderId);
        if (existingLine) {
            // Update existing line
            existingLine.applyOptions(lineOptions);
        } else {
            // Create new line
            const newLine = candlestickSeries.value?.createPriceLine(lineOptions);
            if (newLine) {
                priceLines.value.set(order.orderId, newLine);
            }
        }
    });
     console.log(`Updated/Created price lines for ${openOrders.value.length} orders.`);
};


// Handle resizing
const resizeObserver = ref<ResizeObserver | null>(null);
const handleResize = () => {
    // Check ref's value
    if (chartTarget.value && chartInstance.value) {
        // Call method on ref's value - no type assertion needed now
        chartInstance.value.resize(chartTarget.value.clientWidth, chartTarget.value.clientHeight);
        console.log('TradingView Lightweight Chart resized.');
    }
};

onMounted(() => {
    console.log("TradingViewLightweightChart mounted.");
    if (chartTarget.value) {
        console.log("TradingViewLightweightChart - Target dimensions before init:", {
          offsetWidth: chartTarget.value.offsetWidth,
          offsetHeight: chartTarget.value.offsetHeight,
          clientWidth: chartTarget.value.clientWidth,
          clientHeight: chartTarget.value.clientHeight
        });
    }
    // Delay initialization slightly after mount to ensure DOM is fully ready
    setTimeout(() => { // No longer async
        if (chartTarget.value) {
            initializeChart(); // Call sync initialization

            // updateChartData is now called within initializeChart if data exists
            // No need to call it again here explicitly based on props.klines

            // Set up resize observer only after successful initialization attempt
            // Check ref's value
            if (chartInstance.value) {
                resizeObserver.value = new ResizeObserver(handleResize);
                resizeObserver.value.observe(chartTarget.value);
            }
        } else {
            console.error("TradingView chart target element not found on mount.");
        }

        if (chartTarget.value) {
            console.log("TradingViewLightweightChart - Target dimensions after init:", {
              offsetWidth: chartTarget.value.offsetWidth,
              offsetHeight: chartTarget.value.offsetHeight,
              clientWidth: chartTarget.value.clientWidth,
              clientHeight: chartTarget.value.clientHeight
            });
        }
    }, 50); // Small delay (e.g., 50ms)
    console.log("TradingViewLightweightChart - selectedChartType:", klineStore.selectedChartType);
});

onBeforeUnmount(() => {
    // Clean up resize observer
    if (resizeObserver.value && chartTarget.value) {
        resizeObserver.value.unobserve(chartTarget.value);
    }
    // Remove chart instance
    // Check and call remove on ref's value - no type assertion needed now
    if (chartInstance.value) {
        chartInstance.value.remove();
        chartInstance.value = null;
        candlestickSeries.value = null;
        console.log('TradingView Lightweight Chart instance removed.');
    }
});

// Watch for kline data changes - Simplify this
watch(() => props.klines, (newKlines) => {
    // Only update if the series exists and we have new data
    if (candlestickSeries.value && newKlines && newKlines.length > 0) {
        console.log("Watcher triggered: Updating chart data.");
        updateChartData();
        handleResize(); // Call handleResize after updating data
    } else if (candlestickSeries.value && newKlines && newKlines.length === 0) {
        console.log("Watcher triggered: Clearing chart data.");
        // Optionally clear data if klines becomes empty
        // candlestickSeries.value.setData([]);
    }
}, { deep: true });

// Watch for changes in openOrders or selectedOrderId
watch([openOrders, selectedOrderId], () => {
    if (chartInstance.value && candlestickSeries.value) {
        updateOrderLines();
    } else {
        console.log("Skipping updateOrderLines: chartInstance or candlestickSeries is null.");
    }
}, { deep: true });

// Watch loading/error states to potentially show overlays
// (Template already handles basic messages)

</script>

<!-- No <style> block needed, uses assets/css/ChartContainer.css -->
