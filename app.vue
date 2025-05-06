<template>
  <v-app class="app">
    <v-main class="main">
      <v-container fluid class="container">
        <div class="app-layout">
          <div class="toolbar-grid">
            <SymbolManager class="symbol-manager" />
            <IntervalSelector class="interval-selector" />
          </div>
          <div class="content">
            <div class="content-section">
              <ChartView />
            </div>
            <div class="content-section-peer">
              <OpenTradesTable />
            </div>
            <div class="content-section-peer">
              <KlineTable />
            </div>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import SymbolManager from '~/components/SymbolManager.vue'
import IntervalSelector from '~/components/IntervalSelector.vue'
import DataSourcesView from '~/components/DataSourcesView.vue'
import ChartView from '~/components/ChartView.vue'
import { useKlineStore } from '~/stores/klineStore'
import { onMounted } from 'vue'

const klineStore = useKlineStore()

onMounted(() => {
  if (process.client) {
    klineStore.initializeStore()
  }
})
</script>

<style scoped>
.app {
  background-color: #007bff;
}

.main {
  background-color: #28a745;
}

.main-peer {
  background-color: #218838; /* Slightly darker green */
}

.container {
  background-color: #dc3545;
}

.container-peer {
  background-color: #c82333; /* Slightly darker red */
}

.toolbar {
  background-color: #ffc107;
}

.toolbar-peer {
  background-color: #e0a800; /* Slightly darker yellow */
}

.content-section {
  background-color: #e9ecef; /* Light gray for peer components */
}

.content-section-peer {
  background-color: #dee2e6; /* Slightly darker gray */
}
</style>
