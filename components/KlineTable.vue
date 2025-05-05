<template>
  <div class="kline-table-container">
    <h3>Kline Data ({{ symbol }} - {{ interval }})</h3>
    <div v-if="isLoading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="klines.length === 0" class="no-data">No data available.</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
            <!-- Add more columns if needed -->
          </tr>
        </thead>
        <tbody>
          <!-- Iterate in reverse to show latest first -->
          <tr v-for="kline in reversedKlines" :key="kline.timestamp">
            <td>{{ formatTimestamp(kline.timestamp) }}</td>
            <td>{{ kline.open }}</td>
            <td>{{ kline.high }}</td>
            <td>{{ kline.low }}</td>
            <td>{{ kline.close }}</td>
            <td>{{ kline.volume }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import type { Kline } from '~/db'; // Import the Kline type for type safety if needed

const klineStore = useKlineStore();

// Get reactive state refs from the store
const {
  selectedSymbol: symbol, // Rename for template usage
  selectedInterval: interval, // Rename for template usage
  klineData: klines, // Rename for template usage
  isLoading,
  error
} = storeToRefs(klineStore);

// Computed property to display latest data first
const reversedKlines = computed(() => {
  // klines from the store is already reactive
  return [...klines.value].reverse();
});

// Helper function to format timestamp
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return '';
  // Consider using Intl.DateTimeFormat for better locale support
  try {
      return new Intl.DateTimeFormat(undefined, { // Use user's default locale
          dateStyle: 'short',
          timeStyle: 'medium',
      }).format(new Date(timestamp));
  } catch (e) {
      console.warn("Error formatting date:", e);
      return new Date(timestamp).toLocaleString(); // Fallback
  }
};

// No local state or watchers needed, data comes directly from the store via storeToRefs

</script>
