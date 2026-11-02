import { usableQuote } from "@/lib/quoteQuality";
// Forex Price Service - Uses edge function for real-time prices
// Falls back to fallback prices if edge function unavailable


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
  // If it's already a 6-char pair code, use it directly
  if (currency.length === 6) return currency;
  
  // USD pairs - determine base/quote order
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF', 'CNY'];
  if (usdBasePairs.includes(currency)) {
    return `USD${currency}`;
  }
  return `${currency}USD`;
};

export const fetchForexPrice = async (currency: string): Promise<number> => {
  const pairCode = getPairCode(currency);
  
  // Check cache first
  const cached = priceCache[pairCode];
  if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
    console.log(`Using cached price for ${pairCode}: ${cached.price.rate}`);
    return cached.price.rate;
  }

  try {
    // Use edge function to avoid CORS issues
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'xkgsugennbdatwmetnxx';
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ3N1Z2VubmJkYXR3bWV0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTMyODIsImV4cCI6MjA4MDM2OTI4Mn0.Gm1gJ3CkqIn7eWidlFK-ohEVec-heE3Ts6m1dCY5ZOw';
    
    console.log(`Fetching price for ${pairCode} from edge function...`);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/forex-prices?pairs=${pairCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Edge function response for ${pairCode}:`, data);
      
      if (usableQuote(data.rates?.[pairCode])) {
        const price = data.rates[pairCode].rate;
        priceCache[pairCode] = {
          price: { rate: price, timestamp: Date.now() },
          fetchedAt: Date.now()
        };
        console.log(`Fetched ${pairCode}: ${price} from ${data.rates[pairCode].source}`);
        return price;
      }
    } else {
      console.error(`Edge function error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Edge function failed:', error);
  }

  throw new Error(`No verified price is available for ${pairCode}`);
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
