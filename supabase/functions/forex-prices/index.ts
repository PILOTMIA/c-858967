import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to known domains
const allowedOrigins = [
  'https://miafx-labs.lovable.app',
  'https://id-preview--6a0f0541-134b-49ea-8f03-f61068dd9b3e.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

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
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const pairsParam = url.searchParams.get('pairs');
    
    // Validate pairs parameter
    if (!pairsParam) {
      return new Response(JSON.stringify({ error: 'Missing pairs parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate and sanitize pairs input
    const pairs = pairsParam.split(',')
      .map(p => p.trim().toUpperCase())
      .filter(p => /^[A-Z]{6}$/.test(p))
      .slice(0, 20); // Limit to 20 pairs max
    
    if (pairs.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid currency pairs provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const results: Record<string, { rate: number; source: string }> = {};
    
    for (const pairCode of pairs) {
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
      } catch {
        // Silent fallback to next API
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
      } catch {
        // Silent fallback to next API
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
      } catch {
        // Silent fallback
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
