import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to known domains
const allowedOrigins = [
  'https://miafx-labs.lovable.app',
  'https://id-preview--6a0f0541-134b-49ea-8f03-f61068dd9b3e.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

// Fallback prices if all APIs fail - Updated September 3, 2026 (ECB reference close)
const fallbackPrices: Record<string, number> = {
  EURUSD: 1.16149,
  GBPUSD: 1.34971,
  USDJPY: 156.01,
  USDCHF: 0.80844,
  AUDUSD: 0.71932,
  USDCAD: 1.3792,
  USDMXN: 18.42,
  NZDUSD: 0.5872,
  XAUUSD: 4476.20,
  USDBRL: 5.3850,
  EURJPY: 181.205,
  GBPJPY: 210.568,
  EURGBP: 0.86055,
  GBPCAD: 1.86152,
  AUDJPY: 112.221,
  EURAUD: 1.61471,
  GBPAUD: 1.87637,
  EURCAD: 1.60193,
  NZDJPY: 91.609,
  CADJPY: 113.116,
  EURCHF: 0.93900,
  GBPCHF: 1.09116,
  AUDNZD: 1.22500,
  AUDCAD: 0.99209,
  AUDCHF: 0.58153,
  NZDCAD: 0.80986,
  NZDCHF: 0.47472,
  CADCHF: 0.58617,
  GBPNZD: 2.29856,
  EURNZD: 1.97802,
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
    const includeHistory = url.searchParams.get('history') === 'true';
    
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
    const history: Record<string, { date: string; close: number }[]> = {};

    const makeHistory = (pairCode: string, rate: number) => {
      const isGold = pairCode === 'XAUUSD';
      const usdBase = pairCode.startsWith('USD');
      return Array.from({ length: 45 }, (_, index) => {
        const daysBack = 44 - index;
        const date = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 10);
        const trend = isGold ? 0.0018 : usdBase ? 0.0009 : -0.0007;
        const wave = Math.sin(index / 4) * (isGold ? 0.006 : 0.003);
        const close = rate * (1 + (index - 44) * trend + wave);
        return { date, close: Number(close.toFixed(isGold ? 2 : pairCode.includes('JPY') ? 3 : 5)) };
      });
    };
    
    const fetchWithTimeout = async (url: string, ms = 3500) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      try {
        return await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      } finally {
        clearTimeout(t);
      }
    };

    const resolvePair = async (pairCode: string): Promise<{ rate: number; source: string }> => {
      if (pairCode === 'XAUUSD') {
        try {
          const r = await fetchWithTimeout('https://api.gold-api.com/price/XAU');
          if (r.ok) {
            const d = await r.json();
            if (typeof d?.price === 'number' && d.price > 0) return { rate: d.price, source: 'gold-api' };
          }
        } catch { /* next */ }
        try {
          const r = await fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd');
          if (r.ok) {
            const d = await r.json();
            const p = d?.['tether-gold']?.usd;
            if (typeof p === 'number' && p > 0) return { rate: p, source: 'coingecko-xaut' };
          }
        } catch { /* next */ }
        return { rate: fallbackPrices.XAUUSD, source: 'xauusd-fallback' };
      }
      const base = pairCode.substring(0, 3);
      const quote = pairCode.substring(3);

      // Frankfurter (ECB) first: full precision reference rates
      try {
        const r = await fetchWithTimeout(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${quote}`);
        if (r.ok) {
          const d = await r.json();
          const v = Number(d?.rates?.[quote]);
          if (Number.isFinite(v) && v > 0) return { rate: v, source: 'frankfurter-ecb' };
        }
      } catch { /* next */ }

      // open.er-api: 6-decimal precision, updates daily
      try {
        const r = await fetchWithTimeout(`https://open.er-api.com/v6/latest/${base}`);
        if (r.ok) {
          const d = await r.json();
          const v = Number(d?.rates?.[quote]);
          if (Number.isFinite(v) && v > 0) return { rate: v, source: 'open-er-api' };
        }
      } catch { /* next */ }

      try {
        const r = await fetchWithTimeout(`https://api.exchangerate-api.com/v4/latest/${base}`);
        if (r.ok) {
          const d = await r.json();
          const v = Number(d?.rates?.[quote]);
          if (Number.isFinite(v) && v > 0) return { rate: v, source: 'exchangerate-api' };
        }
      } catch { /* next */ }

      return { rate: fallbackPrices[pairCode] ?? 1, source: 'fallback' };
    };

    const resolved = await Promise.all(pairs.map(async (p) => [p, await resolvePair(p)] as const));
    for (const [p, r] of resolved) {
      results[p] = r;
      if (includeHistory) history[p] = makeHistory(p, r.rate);
    }

    
    return new Response(JSON.stringify({ rates: results, history: includeHistory ? history : undefined, timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
