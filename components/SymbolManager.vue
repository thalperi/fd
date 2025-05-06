<template>
  <div class="symbol-manager">
    <label for="symbol-input">Symbol:</label>
    <input
      id="symbol-input"
      type="text"
      v-model="currentSymbolInput"
      @input="handleInput"
      @keyup.enter="confirmSymbol"
      placeholder="e.g., PEPEUSDC"
    />
    <input
      id="favorite-checkbox"
      type="checkbox"
      :checked="isCurrentSymbolFavorite"
      @change="toggleFavorite"
      :disabled="!currentSymbolInput"
      title="Favorite this symbol"
    />
    <label for="favorite-checkbox" class="favorite-label">⭐</label>

    <label for="favorite-select">Favorites:</label>
    <select id="favorite-select" v-model="selectedFavorite" @change="selectFavorite">
      <option disabled value="">-- Select Favorite --</option>
      <!-- Use favoritesList from the store -->
      <option v-for="fav in favoritesList" :key="fav" :value="fav">
        {{ fav }}
      </option>
    </select>
    <button @click="confirmSymbol" :disabled="!currentSymbolInput">Load Data</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia'; // Import storeToRefs for reactive state access
import { useKlineStore } from '~/stores/klineStore';

const klineStore = useKlineStore();

// Use storeToRefs to keep reactivity for state properties
const { selectedSymbol, favoritesList } = storeToRefs(klineStore);

// Local state for the input field and dropdown selection
const currentSymbolInput = ref('');
const selectedFavorite = ref(''); // Model for the dropdown selection

// Update local input when the store's selectedSymbol changes
watch(selectedSymbol, (newSymbol) => {
  currentSymbolInput.value = newSymbol;
  // Clear dropdown selection if symbol changes externally
  if (selectedFavorite.value !== newSymbol) {
      selectedFavorite.value = '';
  }
}, { immediate: true }); // Run immediately to set initial value

// Computed property to check if the *current input* is a favorite
const isCurrentSymbolFavorite = computed(() => {
  return favoritesList.value.includes(currentSymbolInput.value.toUpperCase());
});

// Clear dropdown selection when user types in the input
const handleInput = () => {
  selectedFavorite.value = '';
};

// Call store actions to manage favorites
const toggleFavorite = async () => {
  const symbol = currentSymbolInput.value.toUpperCase();
  if (!symbol) return;

  if (isCurrentSymbolFavorite.value) {
    await klineStore.removeFavorite(symbol);
  } else {
    await klineStore.addFavorite(symbol);
  }
};

// Update input and trigger store action when selecting from dropdown
const selectFavorite = () => {
  if (selectedFavorite.value) {
    currentSymbolInput.value = selectedFavorite.value; // Update input field
    klineStore.setSymbol(selectedFavorite.value); // Update store state (triggers fetch)
  }
};

// Trigger store action when confirming input (e.g., pressing Enter or Load button)
const confirmSymbol = () => {
  const symbolToLoad = currentSymbolInput.value.toUpperCase();
  if (!symbolToLoad) return;
  klineStore.setSymbol(symbolToLoad); // Update store state (triggers fetch)
};

// Ensure the input reflects the initial store state on mount
// (The immediate watcher handles this now)
// onMounted(() => {
//   currentSymbolInput.value = selectedSymbol.value;
// });

</script>
<style scoped>
@import '../assets/css/SymbolManager.css';
</style>
