import { defineEventHandler, getQuery } from 'h3';
import axios from 'axios';
import crypto from 'crypto-js'; // Use crypto-js for HMAC SHA256

// Define the structure of the expected query parameters (optional, e.g., for a specific symbol)
interface OpenOrdersQuery {
  symbol?: string;
}

// Define the structure of the open order data from Binance API (adjust based on actual response)
interface BinanceOpenOrder {
  symbol: string;
  orderId: number;
  orderListId: number; // Unless OCO, value will be -1
  clientOrderId: string;
  price: string;
  origQty: string; // Original quantity
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string; // e.g., NEW, PARTIALLY_FILLED
  timeInForce: string;
  type: string; // e.g., LIMIT, MARKET
  side: 'BUY' | 'SELL';
  stopPrice: string;
  icebergQty: string;
  time: number; // Order creation time
  updateTime: number;
  isWorking: boolean;
  origQuoteOrderQty: string;
}


const BINANCE_API_BASE_URL = 'https://api.binance.com'; // Use base URL

export default defineEventHandler(async (event) => {
  const query = getQuery<OpenOrdersQuery>(event);
  const symbol = query.symbol; // Optional: Filter by symbol

  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret) {
    event.node.res.statusCode = 500;
    return { error: 'API key or secret not configured in environment variables.' };
  }

  const timestamp = Date.now();
  let queryString = `timestamp=${timestamp}`;
  const endpoint = '/api/v3/openOrders';

  // Add symbol to query string if provided
  if (symbol) {
    queryString += `&symbol=${symbol.toUpperCase()}`;
  }

  // Generate signature
  const signature = crypto.HmacSHA256(queryString, apiSecret).toString(crypto.enc.Hex);
  queryString += `&signature=${signature}`;

  const url = `${BINANCE_API_BASE_URL}${endpoint}?${queryString}`;

  try {
    console.log(`Fetching open orders from Binance. URL: ${endpoint}?symbol=${symbol || 'ALL'}&timestamp=...`);
    const response = await axios.get<BinanceOpenOrder[]>(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    // Filter orders if a symbol was specified in the query (Binance API might return all if symbol param is optional)
    // Note: The /api/v3/openOrders endpoint *requires* the symbol parameter if you want to filter by it.
    // If no symbol is passed, it returns *all* open orders. Let's return all for now.
    // If filtering is desired, the frontend should pass the symbol query param.

    return response.data;

  } catch (error: any) {
    console.error('Error fetching open orders from Binance API:', error.response?.data || error.message);
    event.node.res.statusCode = error.response?.status || 500;
    return {
      error: 'Failed to fetch open orders from Binance API',
      details: error.response?.data || error.message,
    };
  }
});
