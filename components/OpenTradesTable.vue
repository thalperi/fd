<template>
  <!-- Container styling handled by parent div in index.vue -->
  <div> 
    <div class="text-h6 mb-2">Open Trades ({{ symbol }})</div> <!-- Use typography class -->

    <div v-if="isLoading" class="text-center pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p>Loading trades...</p>
    </div>

    <v-alert v-else-if="error" type="error" density="compact" class="mb-4">
      {{ error }}
    </v-alert>

    <div v-else-if="trades.length === 0" class="text-center text-medium-emphasis pa-4">
      No open trades.
    </div>

    <v-table v-else density="compact" hover> <!-- Use v-table props -->
      <thead>
        <tr>
          <th class="text-left">Order ID</th>
          <th class="text-left">Symbol</th>
          <th class="text-left">Side</th>
          <th class="text-left">Price</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Time</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="trade in trades"
          :key="trade.orderId"
          @click="selectTrade(trade)"
          :class="{ selected: selectedOrderId === trade.orderId }" 
          style="cursor: pointer;"
        >
          <td>{{ trade.orderId }}</td>
          <td>{{ trade.symbol }}</td>
          <td>
            <!-- Use chips for side indication -->
            <v-chip :color="trade.side === 'BUY' ? 'success' : 'error'" size="small" variant="tonal">
              {{ trade.side }}
            </v-chip>
          </td>
          <td>{{ trade.price }}</td>
          <td>{{ trade.origQty }}</td>
          <td>{{ formatTimestamp(trade.time) }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import type { OpenOrder } from '~/stores/klineStore'; // Import OpenOrder type from store

const klineStore = useKlineStore();
// Get reactive refs from store
const {
    selectedSymbol: symbol,
    currentSymbolOpenOrders: trades, // Use computed property from store, rename for template
    selectedOrderId, // Get selected order ID from store
    isLoading, // Use general loading state for now
    error // Use general error state for now
} = storeToRefs(klineStore);

// Function to handle trade selection
const selectTrade = (trade: OpenOrder) => {
  console.log('Selected Trade:', trade);
  // Call store action to set the globally selected trade ID
  klineStore.setSelectedOrder(trade.orderId);
};

// Helper function to format timestamp (same as KlineTable)
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return '';
  try {
      // Use a more common format that includes seconds
      return new Intl.DateTimeFormat(undefined, { 
          year: 'numeric', month: 'numeric', day: 'numeric', 
          hour: 'numeric', minute: 'numeric', second: 'numeric' 
      }).format(new Date(timestamp));
  } catch (e) {
      return new Date(timestamp).toLocaleString();
  }
};
</script>

<style scoped>
/* Remove the import */
/* @import '../assets/css/OpenTradesTable.css'; */

/* Style for selected row using theme variable */
.v-table tbody tr.selected {
  background-color: rgba(var(--v-theme-primary), 0.1); /* Use primary color with alpha */
}

/* Ensure table respects container width */
.v-table {
  width: 100%;
}
</style>
