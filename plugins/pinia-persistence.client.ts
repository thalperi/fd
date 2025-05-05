import { defineNuxtPlugin } from '#app';
import { useKlineStore } from '~/stores/klineStore';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hook('app:mounted', () => {
    const klineStore = useKlineStore();

    // Function to load state from localStorage
    const loadState = () => {
      if (localStorage) {
        try {
          const storedState = JSON.parse(localStorage.getItem('klineStoreState') || '{}');
          if (storedState) {
            klineStore.$patch(storedState);
            console.log('Loaded state from localStorage:', storedState);
          }
        } catch (error) {
          console.error('Error loading state from localStorage:', error);
        }
      }
    };

    // Function to persist state to localStorage
    const persistState = () => {
      if (localStorage) {
        const stateToPersist = {
          selectedSymbol: klineStore.selectedSymbol,
          selectedInterval: klineStore.selectedInterval,
          selectedChartType: klineStore.selectedChartType,
          selectedOrderId: klineStore.selectedOrderId
        };
        localStorage.setItem('klineStoreState', JSON.stringify(stateToPersist));
        // console.log('Persisted state to localStorage:', stateToPersist); // Keep logging minimal
      }
    };

    // Load state on app mount
    loadState();

    // Watch for changes in relevant store properties and persist them
    watch(() => ({
      selectedSymbol: klineStore.selectedSymbol,
      selectedInterval: klineStore.selectedInterval,
      selectedChartType: klineStore.selectedChartType,
      selectedOrderId: klineStore.selectedOrderId
    }), persistState, { deep: true }); // Deep watch for nested objects if needed

    console.log('Pinia persistence plugin initialized.');
  });
});
