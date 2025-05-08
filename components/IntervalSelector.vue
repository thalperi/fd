<template>
  <v-sheet rounded border elevation="1" class="pa-2">
    <v-row dense align="center" justify="space-between">
      <v-col cols="auto">
        <v-label class="mr-2">Interval:</v-label>
      </v-col>
      <v-col cols="12" sm="" style="flex-grow: 1;"> 
         <v-btn-toggle
           :model-value="selectedInterval" 
           @update:model-value="handleIntervalChange" 
           color="primary" 
           variant="outlined"
           density="compact"
           mandatory
           :multiple="false"  
           class="interval-toggle-group"
         >
           <v-btn
             v-for="interval in availableIntervals"
             :key="interval"
             :value="interval"
             size="small"
             :style="intervalButtonStyle" 
           >
             {{ interval }}
           </v-btn>
         </v-btn-toggle>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'; // Import computed
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import { useThemeStore, INTERVAL_BTN_KEY } from '~/stores/themeStore'; // Import theme store and key

const klineStore = useKlineStore();
const themeStore = useThemeStore();

// Get reactive state from the store
const { selectedInterval } = storeToRefs(klineStore);

// Define the intervals available in the UI
const availableIntervals = [
  '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d'
];

// --- Button Theming ---
const intervalButtonOverrides = computed(() => {
    return themeStore.activeThemeConfig?.componentOverrides?.[INTERVAL_BTN_KEY];
});
// Apply overrides as a style object. Fallback to undefined to let Vuetify handle defaults.
const intervalButtonStyle = computed(() => ({
  backgroundColor: intervalButtonOverrides.value?.backgroundColor || undefined,
  color: intervalButtonOverrides.value?.color || undefined,
}));
// --- End Button Theming ---

// Method to call the store action when interval changes
const handleIntervalChange = (newInterval: string | undefined) => {
  if (newInterval && newInterval !== selectedInterval.value) { 
    klineStore.setInterval(newInterval); 
  }
};

</script>

<style scoped>
/* Remove the import - styles are now handled by Vuetify */
/* @import '../assets/css/IntervalSelector.css'; */

/* Allow button toggle to wrap on smaller screens */
.interval-toggle-group {
  flex-wrap: wrap;
  height: auto; /* Allow height to adjust for wrapped items */
  justify-content: flex-start; /* Align items to the start */
}
/* Optional: Add some gap between wrapped rows */
.interval-toggle-group > .v-btn {
   margin-bottom: 4px;
   margin-right: 4px; /* Add right margin for spacing */
}

</style>
