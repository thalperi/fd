<template>
  <v-card :style="cardStyle" elevation="2" class="interval-selector-card">
    <v-card-text class="pa-1">
      <v-btn-toggle
        v-model="selectedIntervalState"
        variant="flat"
        mandatory
        density="compact"
        class="interval-toggle"
      >
        <v-btn
          v-for="interval in intervals"
          :key="interval"
          :value="interval"
          @click="selectInterval(interval)"
          size="small"
          class="interval-button"
          :style="getButtonComputedStyles(interval)"
        >
          {{ interval }}
        </v-btn>
      </v-btn-toggle>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue';
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import { useThemeStore, type ComponentStyleOverride, INTERVAL_BTN_KEY, INTERVAL_BTN_ACTIVE_KEY } from '~/stores/themeStore';

const klineStore = useKlineStore();
const themeStore = useThemeStore();

const { selectedInterval } = storeToRefs(klineStore);
const { activeThemeConfig } = storeToRefs(themeStore);

const intervals = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d'];
const selectedIntervalState = ref(selectedInterval.value);

watch(selectedInterval, (newVal) => {
  selectedIntervalState.value = newVal;
});

const selectInterval = (interval: string) => {
  klineStore.setInterval(interval);
};

const cardStyle = computed(() => ({
  backgroundColor: activeThemeConfig.value?.componentBackgrounds?.['IntervalSelector'] || undefined,
}));

const getButtonBaseStyles = (key: string): ComponentStyleOverride => {
  return activeThemeConfig.value?.componentOverrides?.[key] || {};
};

const getButtonComputedStyles = (interval: string): CSSProperties => {
  const isActive = selectedIntervalState.value === interval;
  const key = isActive ? INTERVAL_BTN_ACTIVE_KEY : INTERVAL_BTN_KEY;
  const baseStyles = getButtonBaseStyles(key);
  
  const styles: CSSProperties = {};

  // Default state styles
  if (baseStyles.backgroundColor) {
    styles.backgroundColor = baseStyles.backgroundColor;
  } else if (isActive && activeThemeConfig.value?.vuetifyTheme.colors?.primary) {
    styles.backgroundColor = activeThemeConfig.value.vuetifyTheme.colors.primary;
  }

  if (baseStyles.color) {
    styles.color = baseStyles.color;
  } else if (isActive && activeThemeConfig.value?.vuetifyTheme.colors?.['on-primary']) {
    styles.color = activeThemeConfig.value.vuetifyTheme.colors['on-primary'];
  }
  
  // Set CSS variables for hover states ONLY if defined in theme
  if (baseStyles.hoverBackgroundColor) {
    styles['--interval-btn-hover-bg'] = baseStyles.hoverBackgroundColor;
  }
  if (baseStyles.hoverColor) {
    styles['--interval-btn-hover-text'] = baseStyles.hoverColor;
  }
  
  return styles;
};

</script>

<style scoped>
/* .interval-selector-card {} - Removed empty ruleset */
.interval-toggle {
  width: 100%;
  display: flex;
  justify-content: space-around;
}
.interval-button {
  flex-grow: 1;
}

/* Apply hover styles using CSS variables. Fallback to 'revert' or 'inherit' if vars not set. */
.v-btn.interval-button:hover {
  background-color: var(--interval-btn-hover-bg, revert); /* Use theme variable */
  color: var(--interval-btn-hover-text, revert); /* Use theme variable */
}
</style>
