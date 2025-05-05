import { defineEventHandler, getQuery } from 'h3';
import axios from 'axios';

// Define the structure of the expected query parameters
interface KlineQuery {
  symbol?: string;
  interval?: string;
  startTime?: string;
  endTime?: string;
  limit?: string;
}

// Define the structure of the raw Kline data from Binance API
// [ openTime, open, high, low, close, volume, closeTime, quoteAssetVolume, numberOfTrades, takerBuyBaseAssetVolume, takerBuyQuoteAssetVolume, ignore ]
type BinanceRawKline = [
  number, string, string, string, string, string, number, string, number, string, string, string
];

const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

export default defineEventHandler(async (event) => {
  const query = getQuery<KlineQuery>(event);

  const {
    symbol,
    interval,
    startTime,
    endTime,
    limit = '1000' // Default limit if not provided
  } = query;

  // Basic validation
  if (!symbol || !interval) {
    // Use setResponseStatus for setting status code in Nitro/h3
    event.node.res.statusCode = 400;
    return { error: 'Missing required query parameters: symbol and interval' };
  }

  // Retrieve API Key from environment variables (set in .env)
  // Nuxt 3 automatically loads .env variables
  const apiKey = process.env.BINANCE_API_KEY;
  // Note: Binance public endpoints like /klines don't strictly require API key/secret
  // unless you hit rate limits or need access to private endpoints.
  // We include it here for potential future use or stricter rate limits.

  const params: Record<string, string | number> = {
    symbol: symbol.toUpperCase(), // Ensure symbol is uppercase
    interval,
    limit: parseInt(limit, 10) || 1000, // Ensure limit is a number
  };

  if (startTime) {
    params.startTime = parseInt(startTime, 10);
  }
  if (endTime) {
    params.endTime = parseInt(endTime, 10);
  }

  try {
    console.log(`Fetching klines from Binance: ${JSON.stringify(params)}`);
    const response = await axios.get<BinanceRawKline[]>(BINANCE_API_URL, {
      params,
      headers: {
        'X-MBX-APIKEY': apiKey || '', // Include API key if available
      },
    });

    // Optional: Transform data if needed before sending to client
    // For now, sending the raw array structure received from Binance
    return response.data;

  } catch (error: any) {
    console.error('Error fetching data from Binance API:', error.response?.data || error.message);
    // Use setResponseStatus for setting status code in Nitro/h3
    event.node.res.statusCode = error.response?.status || 500;
    return {
      error: 'Failed to fetch data from Binance API',
      details: error.response?.data || error.message,
    };
  }
});
