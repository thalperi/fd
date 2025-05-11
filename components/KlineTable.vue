<template>
  <!-- Container styling handled by parent div in index.vue -->
  <!-- Use v-expansion-panels for collapsible behavior -->
  <v-expansion-panels v-model="panelState">
    <v-expansion-panel elevation="0"> <!-- Use elevation 0 if parent provides shadow -->
      <v-expansion-panel-title>
        <!-- Display title and potentially row count -->
        Kline Data ({{ symbol }} - {{ interval }}) 
        <v-chip v-if="klines.length > 0" size="small" class="ml-2">{{ klines.length }} rows</v-chip>
        <template v-slot:actions="{ expanded }">
           <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <!-- Content goes inside the panel text -->
        <div v-if="isLoading && klines.length === 0" class="text-center pa-4"> 
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p>Loading data...</p>
        </div>

        <v-alert v-else-if="error" type="error" density="compact" class="mb-4">
          {{ error }}
        </v-alert>

        <div v-else-if="klines.length === 0" class="text-center text-medium-emphasis pa-4">
          No data available.
        </div>

        <v-table v-else density="compact" hover>
          <thead>
            <tr>
              <th class="text-left">Timestamp</th>
              <th class="text-left">Open</th>
              <th class="text-left">High</th>
              <th class="text-left">Low</th>
              <th class="text-left">Close</th>
              <th class="text-left">Volume</th>
            </tr>
          </thead>
          <tbody>
            <!-- Limit to latest 20 rows -->
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
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import type { Kline } from '~/db'; 

const klineStore = useKlineStore();

// Get reactive state refs from the store
const {
  selectedSymbol: symbol, 
  selectedInterval: interval, 
  klineData: klines, 
  isLoading,
  error
} = storeToRefs(klineStore);

// State to control expansion panel (empty array means closed by default)
const panelState = ref<number[]>([]); 

// Computed property to display latest data first
const reversedKlines = computed(() => {
  return [...klines.value].reverse();
});

// Helper function to format timestamp
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return '';
  try {
      return new Intl.DateTimeFormat(undefined, { 
          year: 'numeric', month: 'numeric', day: 'numeric', 
          hour: 'numeric', minute: 'numeric', second: 'numeric' 
      }).format(new Date(timestamp));
  } catch (e) {
      // console.warn("Error formatting date:", e); // Removed console.warn
      return new Date(timestamp).toLocaleString(); // Fallback
  }
};

// Computed property to limit visible klines to latest 20
const visibleKlines = computed(() => {
  return reversedKlines.value.slice(0, 20);
});
</script>

<style scoped>
/* Add any essential scoped styles here if needed */
.v-table {
  width: 100%;
}
/* Optional: Remove default padding from expansion panel text if table has its own */
.v-expansion-panel-text :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 12px 12px; /* Adjust as needed */
}
</style>
