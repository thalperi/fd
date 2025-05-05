<template>
  <div class="app-container">
    <header class="controls-bar">
      <!-- Symbol Manager and Interval Selector go here -->
      <SymbolManager />
      <IntervalSelector />
    </header>

    <main class="main-content">
      <aside class="left-panel">
        <!-- Data Sources View (Kline + Trades) goes here -->
        <DataSourcesView />
      </aside>
      <section class="right-panel">
        <!-- Chart View (which includes type selector and dynamic chart) goes here -->
        <ChartView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
// Import components needed for the layout
import SymbolManager from '~/components/SymbolManager.vue';
import IntervalSelector from '~/components/IntervalSelector.vue';
import DataSourcesView from '~/components/DataSourcesView.vue'; // Import the new wrapper
import ChartView from '~/components/ChartView.vue';
import { useKlineStore } from '~/stores/klineStore'; // Import the Pinia store
import { onMounted } from 'vue';

// Import global CSS - Nuxt 3 uses nuxt.config.ts for this primarily,
// but we can also import directly here if needed, though config is preferred.

// Import global CSS - Nuxt 3 uses nuxt.config.ts for this primarily,
// but we can also import directly here if needed, though config is preferred.

// Get the store instance
const klineStore = useKlineStore();

// Initialize the store when the app mounts
// This will load favorites and trigger the initial data fetch
onMounted(() => {
  // Ensure Dexie DB initialization runs client-side before store init
  // The check is already in db/index.ts, but good to be mindful
  if (process.client) {
      klineStore.initializeStore();
  }
});

</script>

<!-- No <style> block needed here, global styles are in CSS files -->
<!-- We will configure Nuxt to load these CSS files globally -->
