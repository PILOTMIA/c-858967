import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback prices if all APIs fail
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pairs = url.searchParams.get('pairs')?.split(',') || [];
    
    const results: Record<string, { rate: number; source: string }> = {};
    
    for (const pair of pairs) {
      const pairCode = pair.toUpperCase();
      
      // Try FreeForexAPI
      try {
        const freeForexRes = await fetch(
          `https://www.freeforexapi.com/api/live?pairs=${pairCode}`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (freeForexRes.ok) {
          const data = await freeForexRes.json();
          if (data.rates && data.rates[pairCode]) {
            results[pairCode] = { rate: data.rates[pairCode].rate, source: 'freeforexapi' };
            continue;
          }
        }
      } catch (e) {
        console.log(`FreeForexAPI failed for ${pairCode}`);
      }
      
      // Try ExchangeRate-API (free tier)
      try {
        const base = pairCode.substring(0, 3);
        const quote = pairCode.substring(3);
        const exchangeRes = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${base}`
        );
        
        if (exchangeRes.ok) {
          const data = await exchangeRes.json();
          if (data.rates && data.rates[quote]) {
            results[pairCode] = { rate: data.rates[quote], source: 'exchangerate-api' };
            continue;
          }
        }
      } catch (e) {
        console.log(`ExchangeRate-API failed for ${pairCode}`);
      }

      // Try Frankfurter API (free, no key needed)
      try {
        const base = pairCode.substring(0, 3);
        const quote = pairCode.substring(3);
        const frankfurterRes = await fetch(
          `https://api.frankfurter.app/latest?from=${base}&to=${quote}`
        );
        
        if (frankfurterRes.ok) {
          const data = await frankfurterRes.json();
          if (data.rates && data.rates[quote]) {
            results[pairCode] = { rate: data.rates[quote], source: 'frankfurter' };
            continue;
          }
        }
      } catch (e) {
        console.log(`Frankfurter failed for ${pairCode}`);
      }
      
      // Fallback
      if (fallbackPrices[pairCode]) {
        results[pairCode] = { rate: fallbackPrices[pairCode], source: 'fallback' };
      }
    }
    
    return new Response(JSON.stringify({ rates: results, timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching forex prices:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
