<template>
  <v-sheet rounded border elevation="1" class="pa-3">
    <v-row dense align="center">
      <v-col cols="12" sm="auto" class="flex-grow-1">
        <v-text-field
          v-model="currentSymbolInput"
          label="Symbol"
          placeholder="e.g., PEPEUSDC"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="handleInput"
          @keydown.enter="confirmSymbol"
          class="mr-2"
        ></v-text-field>
      </v-col>
      <v-col cols="auto">
         <v-checkbox-btn
            :model-value="isCurrentSymbolFavorite"
            @update:model-value="toggleFavorite"
            :disabled="!currentSymbolInput"
            icon="mdi-star"
            false-icon="mdi-star-outline"
            color="warning"
            density="compact"
            title="Favorite this symbol"
          ></v-checkbox-btn>
      </v-col>
    </v-row>

    <v-row dense align="center" class="mt-2">
       <v-col cols="12" sm="auto" class="flex-grow-1">
         <v-select
           v-model="selectedFavorite"
           :items="favoritesList"
           label="Favorites"
           placeholder="-- Select Favorite --"
           variant="outlined"
           density="compact"
           hide-details
           @update:model-value="selectFavorite"
           class="mr-2"
         ></v-select>
       </v-col>
       <v-col cols="auto">
         <v-btn 
           @click="confirmSymbol" 
           :disabled="!currentSymbolInput"
           :color="loadDataButtonBgColor || 'primary'" 
           :style="{ color: loadDataButtonTextColor }" 
           >
           Load Data
         </v-btn>
       </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia'; 
import { useKlineStore } from '~/stores/klineStore';
import { useThemeStore, LOAD_DATA_BTN_KEY } from '~/stores/themeStore'; // Import theme store and key

const klineStore = useKlineStore();
const themeStore = useThemeStore();

// Use storeToRefs to keep reactivity for state properties
const { selectedSymbol, favoritesList } = storeToRefs(klineStore);

// Local state for the input field and dropdown selection
const currentSymbolInput = ref('');
const selectedFavorite = ref(''); // Model for the dropdown selection

// Update local input when the store's selectedSymbol changes
watch(selectedSymbol, (newSymbol) => {
  currentSymbolInput.value = newSymbol || ''; // Ensure it's a string
  if (selectedFavorite.value !== newSymbol) {
      selectedFavorite.value = '';
  }
}, { immediate: true }); 

// Computed property to check if the *current input* is a favorite
const isCurrentSymbolFavorite = computed(() => {
  const symbol = currentSymbolInput.value?.toUpperCase();
  return !!symbol && favoritesList.value.includes(symbol);
});

// --- Button Theming ---
const loadDataButtonOverrides = computed(() => {
    return themeStore.activeThemeConfig?.componentOverrides?.[LOAD_DATA_BTN_KEY];
});
const loadDataButtonBgColor = computed(() => loadDataButtonOverrides.value?.backgroundColor);
const loadDataButtonTextColor = computed(() => loadDataButtonOverrides.value?.color);
// --- End Button Theming ---

// Clear dropdown selection when user types in the input
const handleInput = () => {
  selectedFavorite.value = '';
};

// Call store actions to manage favorites based on the NEW state from the event
const toggleFavorite = async (isNowFavorite: boolean | null) => { 
  const symbol = currentSymbolInput.value.toUpperCase();
  if (!symbol) return;

  if (isNowFavorite === false) { 
    console.log('Removing favorite:', symbol);
    await klineStore.removeFavorite(symbol);
  } else if (isNowFavorite === true) { 
    console.log('Adding favorite:', symbol);
    await klineStore.addFavorite(symbol);
  }
};

// Update input and trigger store action when selecting from dropdown
const selectFavorite = () => {
  if (selectedFavorite.value) {
    currentSymbolInput.value = selectedFavorite.value; 
    klineStore.setSymbol(selectedFavorite.value); 
  }
};

// Trigger store action when confirming input (e.g., pressing Enter or Load button)
const confirmSymbol = () => {
  const symbolToLoad = currentSymbolInput.value.toUpperCase();
  if (!symbolToLoad) return;
  klineStore.setSymbol(symbolToLoad); 
};

</script>

<style scoped>
/* Remove the import - styles are now handled by Vuetify */
/* @import '../assets/css/SymbolManager.css'; */

/* Add any minor scoped adjustments if needed, but prefer Vuetify props/utils */
</style>
