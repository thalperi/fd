<template>
  <div class="interval-selector">
    <span>Interval:</span>
    <button
      v-for="interval in availableIntervals"
      :key="interval"
      :class="{ active: interval === selectedInterval }"
      @click="selectInterval(interval)"
    >
      {{ interval }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';

const klineStore = useKlineStore();

// Get reactive state from the store
const { selectedInterval } = storeToRefs(klineStore);

// Define the intervals available in the UI
const availableIntervals = [
  '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d'
  // Ensure these values match what the Binance API expects and what the store uses
];

// Call the store action when an interval button is clicked
const selectInterval = (interval: string) => {
  klineStore.setInterval(interval); // This action will update selectedInterval and trigger fetch
};

// No need for local state or watchers, store handles it

</script>
<style scoped>
@import '../assets/css/IntervalSelector.css';
</style>
