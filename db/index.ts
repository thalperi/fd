import Dexie, { type Table } from 'dexie';

export interface Kline {
  // id?: number; // Remove auto-incrementing ID
  symbol: string;
  interval: string;
  timestamp: number; // Kline start time (milliseconds)
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number; // Kline close time
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignore: string; // Ignore field from Binance API
}

export interface Favorite {
  symbol: string; // Primary key for favorites
}

export class MySubClassedDexie extends Dexie {
  klines!: Table<Kline>;
  favorites!: Table<Favorite>;

  constructor() {
    super('binanceKlineData');
    this.version(1).stores({
      // Use [symbol+interval+timestamp] as the compound primary key
      // Add separate index on 'timestamp' if needed for sorting/range queries independent of symbol/interval
      klines: '[symbol+interval+timestamp], timestamp',
      // symbol is the primary key for favorites
      favorites: '&symbol' // Keep '&' for unique primary key constraint
    });
  }
}

export const db = new MySubClassedDexie();

// Function to add initial favorite if none exist
export async function initializeFavorites() {
  const count = await db.favorites.count();
  if (count === 0) {
    try {
      await db.favorites.add({ symbol: 'PEPEUSDC' });
      console.log('Initialized favorites with PEPEUSDC');
    } catch (error) {
      console.error('Failed to initialize favorites:', error);
      // Handle potential duplicate key error if initialization runs concurrently
      if (!(error instanceof Dexie.BulkError && error.failures.every(f => f.name === 'ConstraintError'))) {
         throw error;
      }
    }
  }
}

// Initialize favorites on script load (runs once when the module is imported)
// We need to ensure this runs client-side only in Nuxt
if (typeof window !== 'undefined') {
  initializeFavorites().catch(err => {
    console.error("Error during initial favorite check:", err);
  });
}
