<template>
  <div class="data-sources-view">
    <!-- Kline Data Table -->
    <KlineTable class="data-table kline-data" />

    <!-- Open Trades Table -->
    <OpenTradesTable class="data-table trades-data" />
  </div>
</template>

<script setup lang="ts">
import KlineTable from './KlineTable.vue';
import OpenTradesTable from './OpenTradesTable.vue';

// No specific script logic needed here for now, just layout
</script>
<style scoped>
@import '../assets/css/DataSourcesView.css';
</style>

<!-- Styles moved to assets/css/DataSourcesView.css -->
