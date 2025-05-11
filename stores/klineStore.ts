import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // Import computed
import Dexie, { liveQuery } from 'dexie'; // Import Dexie class and liveQuery
import { db, type Kline, type Favorite } from '~/db'; // Import Dexie instance and types

// Define the structure for the raw Kline data from our API
type ApiRawKline = [
  number, string, string, string, string, string, number, string, number, string, string, string
];

// Define the structure for the open order data from our API (matching backend)
export interface OpenOrder {
  symbol: string;
  orderId: number;
  price: string;
  origQty: string; // Original quantity - using string as received from API
  type: string; // e.g., LIMIT, MARKET
  side: 'BUY' | 'SELL';
  time: number; // Order creation time
  // Add other relevant fields from BinanceOpenOrder if needed
}

export const useKlineStore = defineStore('klineStore', () => {
  // === State ===
  const selectedSymbol = ref('PEPEUSDC');
  const selectedInterval = ref('5m');
  const selectedChartType = ref('ChartJsCandlestick');
  const favoritesList = ref<string[]>([]);
  const klineData = ref<Kline[]>([]);
  const isLoading = ref(false); // General loading state, might need refinement for separate actions
  const error = ref<string | null>(null);
  const openOrders = ref<OpenOrder[]>([]); // State for all open orders
  const selectedOrderId = ref<number | null>(null); // State for selected order ID
  const isInitialized = ref(false); // Flag to prevent multiple initializations

  // === Actions ===

  // Initialize Store (Load favorites, set initial symbol)
  async function initializeStore() {
    if (isInitialized.value) return; // Prevent re-initialization
    // console.log('Initializing Kline Store...');
    // isLoading.value = true; // Remove this - let fetchKlineData handle it
    try {
      // Use liveQuery for reactive updates to favorites
      liveQuery(() => db.favorites.orderBy('symbol').toArray())
        .subscribe({
          next: (favs: Favorite[]) => {
            favoritesList.value = favs.map(f => f.symbol);
            // console.log('Favorites list updated from DB:', favoritesList.value);
            // Set initial symbol if current one isn't a favorite or list is empty
            if (!favoritesList.value.includes(selectedSymbol.value)) {
              selectedSymbol.value = favoritesList.value[0] || 'PEPEUSDC'; // Fallback if list empty after init
            }
            // Trigger initial data fetch only after favorites are loaded
            if (!isInitialized.value) {
                isInitialized.value = true; // Mark as initialized
                fetchOpenOrders(); // Fetch open orders on init
                fetchKlineData(); // Fetch data for the initial/validated symbol
            }
          },
          error: (err) => {
            console.error('Error subscribing to favorites:', err);
            error.value = 'Failed to load favorites list.';
            isInitialized.value = true; // Mark initialized even on error to prevent loops
            isLoading.value = false;
          }
        });
    } catch (err) {
        console.error("Initialization error:", err);
        error.value = 'Failed to initialize store.';
        isInitialized.value = true; // Mark initialized even on error
        isLoading.value = false;
    }
    // Note: isLoading will be set to false within fetchKlineData or the error handler
  }

  // Getter to filter open orders for the currently selected symbol
  const currentSymbolOpenOrders = computed(() => {
      return openOrders.value.filter(order => order.symbol === selectedSymbol.value);
  });

  // Setters for user selections
  function setSymbol(symbol: string) {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol && selectedSymbol.value !== upperSymbol) {
      // console.log(`Setting symbol: ${upperSymbol}`);
      selectedSymbol.value = upperSymbol;
      fetchKlineData(); // Fetch data for new symbol
    }
  }

  function setInterval(interval: string) {
    if (interval && selectedInterval.value !== interval) {
      // console.log(`Setting interval: ${interval}`);
      selectedInterval.value = interval;
      fetchKlineData(); // Fetch data for new interval
    }
  }

  function setChartType(type: string) {
    if (type && selectedChartType.value !== type) {
      // console.log(`Setting chart type: ${type}`);
      selectedChartType.value = type;
    }
  }

  // Setter for selected order
  function setSelectedOrder(orderId: number | null) {
      // console.log(`Setting selected order ID: ${orderId}`);
      selectedOrderId.value = orderId;
  }

  // Favorite Management
  async function addFavorite(symbol: string) {
    const upperSymbol = symbol.toUpperCase();
    if (!upperSymbol) return;
    try {
      await db.favorites.add({ symbol: upperSymbol });
      // console.log(`Added favorite: ${upperSymbol}`);
    } catch (err: any) {
      if (err.name !== 'ConstraintError') {
        console.error(`Failed to add favorite ${upperSymbol}:`, err);
        error.value = `Failed to add favorite ${upperSymbol}.`;
      } else {
        // console.log(`Favorite ${upperSymbol} already exists.`);
      }
    }
  }

  async function removeFavorite(symbol: string) {
    const upperSymbol = symbol.toUpperCase();
    if (!upperSymbol) return;
    try {
      await db.favorites.delete(upperSymbol);
      // console.log(`Removed favorite: ${upperSymbol}`);
      // If the currently selected symbol was removed, select another favorite or default
      if (selectedSymbol.value === upperSymbol) {
          setSymbol(favoritesList.value[0] || 'PEPEUSDC'); // Fetch will be triggered by setSymbol
      }
    } catch (err) {
      console.error(`Failed to remove favorite ${upperSymbol}:`, err);
      error.value = `Failed to remove favorite ${upperSymbol}.`;
    }
  }

  // Fetch Open Orders Action
  async function fetchOpenOrders() {
      // console.log("Fetching open orders...");
      try {
          const response = await $fetch<OpenOrder[]>(`/api/openOrders`);
          openOrders.value = response.map(o => ({
              symbol: o.symbol,
              orderId: o.orderId,
              price: o.price, 
              origQty: o.origQty, 
              type: o.type,
              side: o.side,
              time: o.time
          }));
          // console.log(`Fetched ${openOrders.value.length} open orders.`);
      } catch (err: any) {
          console.error('Error fetching open orders:', err);
          error.value = `Failed to load open orders. ${err.data?.message || err.message || ''}`;
          openOrders.value = []; // Clear orders on error
      }
  }


  // Data Fetching Logic (Intelligent Fetching)
  async function fetchKlineData(fetchMode: 'latest' | 'historical' = 'latest', endTime?: number) {
    // console.log(`fetchKlineData called. Mode: ${fetchMode}`); 
    const symbol = selectedSymbol.value;
    const interval = selectedInterval.value;
    if (!symbol || !interval) {
      klineData.value = [];
      return;
    }

    if (isLoading.value) {
        // console.log(`Fetch already in progress for ${symbol}-${interval}. Skipping.`);
        return;
    }

    isLoading.value = true;
    error.value = null; 
    // console.log(`Fetching ${fetchMode} data for ${symbol} - ${interval}...`);

    try {
      let startTime: number | undefined = undefined;
      let apiEndTime: number | undefined = undefined;
      const limit = 1000; 

      if (fetchMode === 'latest') {
        const latestKline = await db.klines
          .where('[symbol+interval+timestamp]')
          .between([symbol, interval, Dexie.minKey], [symbol, interval, Dexie.maxKey], false, false) 
          .last(); 

        if (latestKline) {
          startTime = latestKline.timestamp + 1; 
          // console.log(`Found latest local kline at ${new Date(latestKline.timestamp)}. Fetching from ${new Date(startTime)}...`);
        } else {
          // console.log(`No local data found for ${symbol}-${interval}. Fetching initial set.`);
        }
      } else if (fetchMode === 'historical') {
         const oldestKline = await db.klines
           .where('[symbol+interval+timestamp]')
           .between([symbol, interval, Dexie.minKey], [symbol, interval, Dexie.maxKey], false, false)
           .first(); 

         if (oldestKline) {
             apiEndTime = oldestKline.timestamp - 1; 
             // console.log(`Found oldest local kline at ${new Date(oldestKline.timestamp)}. Fetching historical data ending before ${new Date(apiEndTime + 1)}...`);
         } else {
             // console.log(`No local data found for ${symbol}-${interval}. Cannot fetch historical.`);
             isLoading.value = false;
             return; 
         }
      }

      const params: Record<string, string | number> = { symbol, interval, limit };
      if (startTime) params.startTime = startTime;
      if (apiEndTime) params.endTime = apiEndTime;

      const response = await $fetch<ApiRawKline[]>(`/api/klines`, { params });
      // console.log(`Received ${response.length} candles from API for ${symbol}-${interval} (${fetchMode}).`);

      if (response.length > 0) {
        const newKlines: Kline[] = response.map(k => ({
          symbol: symbol,
          interval: interval,
          timestamp: k[0], open: k[1], high: k[2], low: k[3], close: k[4], volume: k[5],
          closeTime: k[6], quoteAssetVolume: k[7], numberOfTrades: k[8],
          takerBuyBaseAssetVolume: k[9], takerBuyQuoteAssetVolume: k[10], ignore: k[11],
        }));

        await db.klines.bulkPut(newKlines);
        // console.log(`Stored/Updated ${newKlines.length} candles in DB.`);
      } else {
          // console.log(`No new ${fetchMode} candles received from API.`);
      }

      const displayLimit = 500;
      const dbKlines = await db.klines
        .where('[symbol+interval+timestamp]')
        .between([symbol, interval, Dexie.minKey], [symbol, interval, Dexie.maxKey])
        .reverse() 
        .limit(displayLimit)
        .toArray();

      klineData.value = dbKlines.sort((a, b) => a.timestamp - b.timestamp);
      // console.log(`Updated klineData state with ${klineData.value.length} candles from DB. First timestamp: ${klineData.value[0]?.timestamp}, Last timestamp: ${klineData.value[klineData.value.length - 1]?.timestamp}`); 

      if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('resize'));
          // console.log("Dispatched resize event after kline data update.");
      }

    } catch (err: any) {
      console.error(`Error fetching ${fetchMode} kline data:`, err);
      error.value = `Failed to load ${fetchMode} data for ${symbol} (${interval}). ${err.data?.message || err.message || ''}`;
      klineData.value = []; 
    } finally {
      isLoading.value = false;
    }
  }

  // === Return Store Interface ===
  return {
    // State
    selectedSymbol,
    selectedInterval,
    selectedChartType,
    favoritesList,
    klineData,
    openOrders, 
    currentSymbolOpenOrders, 
    selectedOrderId, 
    isLoading,
    error,
    isInitialized,

    // Actions
    initializeStore,
    setSymbol,
    setInterval,
    setChartType,
    addFavorite,
    setSelectedOrder, 
    fetchOpenOrders, 
    removeFavorite,
    fetchKlineData, 
  };
});
