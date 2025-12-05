// Free Forex Price Service - No API key required
// Uses freeforexapi.com for real-time prices

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
  // Cross pairs
  if (currency === 'EURJPY') return 'EURJPY';
  if (currency === 'GBPJPY') return 'GBPJPY';
  if (currency === 'EURGBP') return 'EURGBP';
  if (currency === 'GBPCAD') return 'GBPCAD';
  if (currency === 'AUDJPY') return 'AUDJPY';
  if (currency === 'EURAUD') return 'EURAUD';
  if (currency === 'GBPAUD') return 'GBPAUD';
  if (currency === 'EURCAD') return 'EURCAD';
  if (currency === 'NZDJPY') return 'NZDJPY';
  if (currency === 'CADJPY') return 'CADJPY';
  
  // USD pairs - determine base/quote order
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF'];
  if (usdBasePairs.includes(currency)) {
    return `USD${currency}`;
  }
  return `${currency}USD`;
};

// Fallback prices (updated Dec 2024) - used when API fails
const fallbackPrices: Record<string, number> = {
  EURUSD: 1.0520,
  GBPUSD: 1.2680,
  USDJPY: 150.20,
  USDCHF: 0.8820,
  AUDUSD: 0.6480,
  USDCAD: 1.4020,
  USDMXN: 20.30,
  EURJPY: 158.10,
  GBPJPY: 190.40,
  EURGBP: 0.8300,
  GBPCAD: 1.7780,
  AUDJPY: 97.30,
  EURAUD: 1.6230,
  GBPAUD: 1.9560,
  EURCAD: 1.4750,
  NZDJPY: 86.50,
  CADJPY: 107.10,
};

export const fetchForexPrice = async (currency: string): Promise<number> => {
  const pairCode = getPairCode(currency);
  
  // Check cache first
  const cached = priceCache[pairCode];
  if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
    return cached.price.rate;
  }

  try {
    // Try freeforexapi.com first
    const response = await fetch(
      `https://www.freeforexapi.com/api/live?pairs=${pairCode}`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
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
        return price;
      }
    }
  } catch (error) {
    console.log('FreeForexAPI failed, trying fallback...');
  }

  // Try ExchangeRate API as backup (for USD pairs)
  if (!currency.includes('JPY') || currency.startsWith('USD')) {
    try {
      const base = pairCode.substring(0, 3);
      const quote = pairCode.substring(3);
      const response = await fetch(
        `https://api.exchangerate.host/latest?base=${base}&symbols=${quote}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.rates && data.rates[quote]) {
          const price = data.rates[quote];
          priceCache[pairCode] = {
            price: { rate: price, timestamp: Date.now() },
            fetchedAt: Date.now()
          };
          return price;
        }
      }
    } catch (error) {
      console.log('ExchangeRate API failed');
    }
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
