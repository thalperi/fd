<template>
  <div class="trades-table-container">
    <h3>Open Trades ({{ symbol }})</h3>
    <div v-if="isLoading" class="loading">Loading trades...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="trades.length === 0" class="no-data">No open trades.</div>
    <div v-else class="table-wrapper">
      <v-table>
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
            :class="{ selected: selectedOrderId === trade.orderId, buy: trade.side === 'BUY', sell: trade.side === 'SELL' }"
            style="cursor: pointer;"
          >
            <td>{{ trade.orderId }}</td>
            <td>{{ trade.symbol }}</td>
            <td>{{ trade.side }}</td>
            <td>{{ trade.price }}</td>
            <td>{{ trade.origQty }}</td>
            <td>{{ formatTimestamp(trade.time) }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
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
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(timestamp));
  } catch (e) {
      return new Date(timestamp).toLocaleString();
  }
};
</script>

<style scoped>
@import '../assets/css/OpenTradesTable.css';
</style>
