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

// Fallback prices - Updated Jan 17, 2026 (accurate market levels)
const fallbackPrices: Record<string, number> = {
  EURUSD: 1.0285,
  GBPUSD: 1.2195,
  USDJPY: 156.15,
  USDCHF: 0.9125,
  AUDUSD: 0.6185,
  USDCAD: 1.4445,
  USDMXN: 20.68,
  NZDUSD: 0.5595,
  USDBRL: 6.0650,
  EURJPY: 160.60,
  GBPJPY: 190.40,
  EURGBP: 0.8435,
  GBPCAD: 1.7620,
  AUDJPY: 96.55,
  EURAUD: 1.6635,
  GBPAUD: 1.9720,
  EURCAD: 1.4860,
  NZDJPY: 87.35,
  CADJPY: 108.10,
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
      
      if (data.rates && data.rates[pairCode]) {
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
