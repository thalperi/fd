<template>
  <div class="app-layout">
    <div class="toolbar-grid" :style="{ backgroundColor: getComponentBgColor('ToolbarArea') || 'transparent' }">
      <SymbolManager 
        class="symbol-manager" 
        :style="symbolManagerStyle" 
      />
      <IntervalSelector 
        class="interval-selector" 
        :style="intervalSelectorStyle" 
      />
    </div>
    <!-- Updated content grid -->
    <div class="content-grid" :style="{ backgroundColor: getComponentBgColor('ContentArea') || 'transparent' }">
      <div class="chart-area content-section" :style="chartViewStyle">
        <ChartView />
      </div>
      <div class="trades-area content-section-peer" :style="openTradesTableStyle">
        <OpenTradesTable />
      </div>
      <div class="klines-area content-section-peer" :style="klineTableStyle">
        <KlineTable />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'; 
import { useThemeStore } from '~/stores/themeStore'; 
import SymbolManager from '~/components/SymbolManager.vue'
import IntervalSelector from '~/components/IntervalSelector.vue'
import ChartView from '~/components/ChartView.vue'
import OpenTradesTable from '~/components/OpenTradesTable.vue'
import KlineTable from '~/components/KlineTable.vue'

const themeStore = useThemeStore();

// Helper to get component background color from the active theme
const getComponentBgColor = (componentKey: string): string | undefined => {
  return themeStore.activeThemeConfig?.componentBackgrounds?.[componentKey] || undefined; 
};

// Computed styles for easier binding in template
const symbolManagerStyle = computed(() => ({
  backgroundColor: getComponentBgColor('SymbolManager')
}));
const intervalSelectorStyle = computed(() => ({
  backgroundColor: getComponentBgColor('IntervalSelector')
}));
const chartViewStyle = computed(() => ({
  backgroundColor: getComponentBgColor('ChartView')
}));
const openTradesTableStyle = computed(() => ({
  backgroundColor: getComponentBgColor('OpenTradesTable')
}));
const klineTableStyle = computed(() => ({
  backgroundColor: getComponentBgColor('KlineTable')
}));

</script>

<style scoped>
.toolbar-grid {
  display: grid; 
  grid-template-columns: auto auto 1fr; 
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  background-color: v-bind("getComponentBgColor('ToolbarArea') || 'transparent'");
  padding: 8px; 
  border-radius: 4px; 
}

/* New Content Grid Layout */
.content-grid {
  display: grid;
  gap: 16px;
  /* Single column layout, rows defined by areas */
  grid-template-columns: 1fr; 
  grid-template-areas: 
    "chart"
    "trades"
    "klines";
   background-color: v-bind("getComponentBgColor('ContentArea') || 'transparent'");
}

/* Media query is no longer needed for this layout */
/* @media (min-width: 960px) { ... } */

/* Assign components to grid areas */
.chart-area { grid-area: chart; }
.trades-area { grid-area: trades; }
.klines-area { grid-area: klines; }


.content-section,
.content-section-peer {
  padding: 16px;
  border-radius: 4px;
  /* Background is handled by :style binding */
}

/* Component specific styles (non-background) */
.symbol-manager {
  padding: 8px; 
}

.interval-selector {
   padding: 8px;
}

</style>
