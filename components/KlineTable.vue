<template>
  <div class="kline-table-container">
    <h3>Kline Data ({{ symbol }} - {{ interval }})</h3>
    <div v-if="isLoading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="klines.length === 0" class="no-data">No data available.</div>
    <div v-else>
      <button @click="toggleTable" class="toggle-button">
        {{ isTableVisible ? 'Hide Kline Data' : 'Show Kline Data' }}
      </button>
      <div v-if="isTableVisible" class="table-wrapper" :style="{ maxHeight: isTableVisible ? 'none' : '400px' }">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Timestamp</th>
              <th class="text-left">Open</th>
              <th class="text-left">High</th>
              <th class="text-left">Low</th>
              <th class="text-left">Close</th>
              <th class="text-left">Volume</th>
              <!-- Add more columns if needed -->
            </tr>
          </thead>
          <tbody>
            <!-- Iterate in reverse to show latest first -->
            <tr v-for="kline in visibleKlines" :key="kline.timestamp">
              <td>{{ formatTimestamp(kline.timestamp) }}</td>
              <td>{{ kline.open }}</td>
              <td>{{ kline.high }}</td>
              <td>{{ kline.low }}</td>
              <td>{{ kline.close }}</td>
              <td>{{ kline.volume }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

// State to control table visibility
const isTableVisible = ref(true);

// Method to toggle table visibility
const toggleTable = () => {
  isTableVisible.value = !isTableVisible.value;
};

// Computed property to limit visible klines to 20
const visibleKlines = computed(() => {
  return reversedKlines.value.slice(0, 20);
});
</script>
<style scoped>
@import '../assets/css/KlineTable.css';
</style>
