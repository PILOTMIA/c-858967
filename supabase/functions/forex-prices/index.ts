import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback prices if all APIs fail - Updated Jan 17, 2026 (accurate market levels)
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
