// Forex Price Service - Uses edge function for real-time prices
// Falls back to direct API calls if edge function unavailable

import { supabase } from "@/integrations/supabase/client";

interface ForexPrice {
  rate: number;
  timestamp: number;
}

interface PriceCache {
  [pair: string]: {
    price: ForexPrice;
    fetchedAt: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_DURATION = 60000; // 1 minute cache

// Convert internal currency codes to forex pair format
const getPairCode = (currency: string): string => {
  // Cross pairs - return as-is
  const crossPairs = ['EURJPY', 'GBPJPY', 'EURGBP', 'GBPCAD', 'AUDJPY', 'EURAUD', 'GBPAUD', 'EURCAD', 'NZDJPY', 'CADJPY'];
  if (crossPairs.includes(currency)) return currency;
  
  // USD pairs - determine base/quote order
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF'];
  if (usdBasePairs.includes(currency)) {
    return `USD${currency}`;
  }
  return `${currency}USD`;
};

// Fallback prices - Update regularly for accuracy when APIs fail
const fallbackPrices: Record<string, number> = {
  EURUSD: 1.0570,
  GBPUSD: 1.2750,
  USDJPY: 149.80,
  USDCHF: 0.8780,
  AUDUSD: 0.6450,
  USDCAD: 1.4020,
  USDMXN: 20.15,
  NZDUSD: 0.5920,
  EURJPY: 158.30,
  GBPJPY: 190.90,
  EURGBP: 0.8290,
  GBPCAD: 1.7880,
  AUDJPY: 96.60,
  EURAUD: 1.6390,
  GBPAUD: 1.9770,
  EURCAD: 1.4820,
  NZDJPY: 88.70,
  CADJPY: 106.80,
};

export const fetchForexPrice = async (currency: string): Promise<number> => {
  const pairCode = getPairCode(currency);
  
  // Check cache first
  const cached = priceCache[pairCode];
  if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
    return cached.price.rate;
  }

  try {
    // Use edge function to avoid CORS issues
    const { data, error } = await supabase.functions.invoke('forex-prices', {
      body: null,
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Construct URL with query params for GET request
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xkgsugennbdatwmetnxx';
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/forex-prices?pairs=${pairCode}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.rates && data.rates[pairCode]) {
        const price = data.rates[pairCode].rate;
        priceCache[pairCode] = {
          price: { rate: price, timestamp: Date.now() },
          fetchedAt: Date.now()
        };
        console.log(`Fetched ${pairCode}: ${price} from ${data.rates[pairCode].source}`);
        return price;
      }
    }
  } catch (error) {
    console.log('Edge function failed, using fallback...');
  }

  // Return fallback price if API calls fail
  console.log(`Using fallback price for ${pairCode}`);
  return fallbackPrices[pairCode] || 1.0;
};

export const fetchMultipleForexPrices = async (currencies: string[]): Promise<Record<string, number>> => {
  const results: Record<string, number> = {};
  
  // Fetch all prices in parallel
  const promises = currencies.map(async (currency) => {
    const price = await fetchForexPrice(currency);
    results[currency] = price;
  });
  
  await Promise.all(promises);
  return results;
};

// Calculate dynamic trade zones based on current price
export const calculateTradeZones = (currentPrice: number, currency: string) => {
  // Determine pip value based on currency
  const isJPYPair = currency.includes('JPY') || currency === 'JPY';
  const pipMultiplier = isJPYPair ? 100 : 10000;
  
  // Dynamic zone calculation (in pips, then converted to price)
  const entryPips = isJPYPair ? 50 : 30; // Entry zone buffer
  const targetPips = isJPYPair ? 200 : 150; // Target distance
  const stopPips = isJPYPair ? 100 : 80; // Stop distance
  
  const entryBuffer = entryPips / pipMultiplier;
  const targetDistance = targetPips / pipMultiplier;
  const stopDistance = stopPips / pipMultiplier;
  
  return {
    entryLow: currentPrice - entryBuffer,
    entryHigh: currentPrice,
    targetLow: currentPrice + (targetDistance * 0.8),
    targetHigh: currentPrice + targetDistance,
    stopPrice: currentPrice - stopDistance,
  };
};

// Format price based on currency pair
export const formatPrice = (price: number, currency: string): string => {
  const isJPYPair = currency.includes('JPY') || currency === 'JPY';
  const decimals = isJPYPair ? 2 : 4;
  
  // Special handling for exotic pairs like USDMXN
  if (currency === 'MXN') {
    return price.toFixed(2);
  }
  
  return price.toFixed(decimals);
};
