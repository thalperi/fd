<template>
  <v-card :style="cardStyle" elevation="2" class="symbol-manager-card">
    <v-card-text class="pa-2">
      <v-row dense align="center">
        <v-col cols="12" sm="auto" class="flex-grow-1">
          <v-text-field
            v-model="selectedSymbolState"
            label="Symbol"
            dense
            outlined
            hide-details
            @keyup.enter="loadData"
            class="symbol-input"
          ></v-text-field>
        </v-col>
        <v-col cols="auto" class="shrink">
          <v-btn 
            icon 
            size="small"
            @click="toggleFavorite" 
            :color="isFavorite ? 'yellow-darken-2' : 'grey'"
            title="Add/Remove Favorite"
          >
            <v-icon>{{ isFavorite ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="12" sm="auto" class="flex-grow-0">
          <v-btn
            :loading="isLoading"
            @click="loadData"
            block
            :color="buttonStyleValues.backgroundColor || 'primary'"
            :style="loadButtonDynamicStyles"
            class="load-data-button"
          >
            Load Data
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="favoritesList.length > 0" dense>
        <v-col cols="12" class="pt-1">
          <v-chip-group 
            v-model="selectedFavoriteChip"
            column
            mandatory
            active-class="primary--text" 
          >
            <v-chip
              v-for="fav in favoritesList"
              :key="fav"
              label
              small
              @click="selectFavorite(fav)"
              @click:close="removeFavorite(fav)"
              close
              close-icon="mdi-close-circle"
              class="favorite-chip"
            >
              {{ fav }}
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue';
import { storeToRefs } from 'pinia';
import { useKlineStore } from '~/stores/klineStore';
import { useThemeStore, type ComponentStyleOverride, LOAD_DATA_BTN_KEY } from '~/stores/themeStore';

const klineStore = useKlineStore();
const themeStore = useThemeStore();

const { selectedSymbol, favoritesList, isLoading } = storeToRefs(klineStore);
const { activeThemeConfig, themeVersion } = storeToRefs(themeStore); // Added themeVersion

const selectedSymbolState = ref(selectedSymbol.value);
const selectedFavoriteChip = ref<string | undefined>(undefined);

watch(selectedSymbol, (newVal) => {
  selectedSymbolState.value = newVal;
  const favIndex = favoritesList.value.indexOf(newVal);
  selectedFavoriteChip.value = favIndex > -1 ? newVal : undefined;
});

watch(selectedFavoriteChip, (newVal) => {
  if (newVal && selectedSymbol.value !== newVal) {
    klineStore.setSymbol(newVal);
  }
});

const isFavorite = computed(() => favoritesList.value.includes(selectedSymbolState.value.toUpperCase()));

const toggleFavorite = () => {
  const upperSymbol = selectedSymbolState.value.toUpperCase();
  if (!upperSymbol) return;
  if (isFavorite.value) {
    klineStore.removeFavorite(upperSymbol);
  } else {
    klineStore.addFavorite(upperSymbol);
  }
};

const selectFavorite = (fav: string) => {
  klineStore.setSymbol(fav);
};

const removeFavorite = (fav: string) => {
  klineStore.removeFavorite(fav);
};

const loadData = () => {
  if (selectedSymbolState.value) {
    klineStore.setSymbol(selectedSymbolState.value);
  }
};

const cardStyle = computed(() => ({
  backgroundColor: activeThemeConfig.value?.componentBackgrounds?.['SymbolManager'] || undefined,
}));

const buttonStyleValues = computed<ComponentStyleOverride>(() => {
  // Explicitly watch themeVersion and the specific part of activeThemeConfig
  const version = themeVersion.value;
  const currentThemeName = themeStore.activeThemeName; // Get current theme name
  const configOverrides = activeThemeConfig.value?.componentOverrides?.[LOAD_DATA_BTN_KEY];
  
  console.log(
    `[SymbolManager] buttonStyleValues CALC: ActiveTheme='${currentThemeName}', Version=${version}, LOAD_DATA_BTN_KEY Overrides=`, 
    JSON.parse(JSON.stringify(configOverrides || {}))
  );
  
  return configOverrides || {};
});

const loadButtonDynamicStyles = computed(() => {
  const hoverBg = buttonStyleValues.value.hoverBackgroundColor;
  console.log(
    `[SymbolManager] loadButtonDynamicStyles CALC: Resolved hoverBackgroundColor='${hoverBg}' for LOAD_DATA_BTN_KEY. (Theme: '${themeStore.activeThemeName}', v${themeVersion.value})`
  );
  
  const styles: CSSProperties = {};
  if (buttonStyleValues.value.color) { // Default text color
    styles.color = buttonStyleValues.value.color;
  }

  // Set CSS variables ONLY if defined in theme, otherwise let Vuetify handle hover
  if (buttonStyleValues.value.hoverBackgroundColor) {
    styles['--load-btn-hover-bg'] = buttonStyleValues.value.hoverBackgroundColor;
  }
  if (buttonStyleValues.value.hoverColor) {
    styles['--load-btn-hover-text'] = buttonStyleValues.value.hoverColor;
  }
  return styles;
});

</script>

<style scoped>
/* .symbol-manager-card {} - Removed empty ruleset */
.symbol-input {
  min-width: 150px;
}
.favorite-chip {
  margin: 2px;
}

/* Apply hover styles only if CSS variables are set */
/* Increased specificity to override Vuetify defaults without !important */
.v-btn.v-btn--variant-elevated.load-data-button:hover,
.v-btn.v-btn--variant-flat.load-data-button:hover, /* common variant */
.v-btn.v-btn--variant-tonal.load-data-button:hover, /* common variant */
.v-btn.v-btn--variant-outlined.load-data-button:hover, /* common variant */
.v-btn.v-btn--variant-text.load-data-button:hover, /* common variant */
.v-btn.v-btn--variant-plain.load-data-button:hover, /* common variant */
.v-btn.load-data-button:hover { /* Fallback for any other variant or if no specific variant class is present */
  background-color: var(--load-btn-hover-bg, revert); /* Use theme variable */
  color: var(--load-btn-hover-text, revert); /* Use theme variable */
}
</style>
