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
    
    type Quote = { rate: number; source: string; asOf?: string; kind: "market" | "daily-reference"; previousClose?: number };
    const results: Record<string, Quote> = {};
    const history: Record<string, { date: string; close: number }[]> = {};
    const unavailable: string[] = [];

    const fetchWithTimeout = async (url: string, ms = 3500) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      try {
        return await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' } });
      } finally {
        clearTimeout(t);
      }
    };

    const resolvePair = async (pairCode: string): Promise<Quote | null> => {
      // Provider timestamps and observed closes only; no invented history or prices.
      const symbol = pairCode === 'XAUUSD' ? null : pairCode === 'BTCUSD' ? 'BTC-USD' : `${pairCode}=X`;
      if (symbol) {
        try {
          const r = await fetchWithTimeout(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${includeHistory ? '3mo' : '5d'}&interval=1d`, 6000);
          const d = r.ok ? await r.json() : null;
          const series = d?.chart?.result?.[0];
          const meta = series?.meta;
          const rate = Number(meta?.regularMarketPrice);
          const time = Number(meta?.regularMarketTime);
          if (Number.isFinite(rate) && rate > 0 && Number.isFinite(time) && time > 0) {
            const observed = (series.timestamp ?? []).map((t: number, i: number) => ({ date: new Date(t * 1000).toISOString().slice(0, 10), close: series.indicators?.quote?.[0]?.close?.[i] }))
              .filter((p: {close: number}) => typeof p.close === 'number' && Number.isFinite(p.close) && p.close > 0);
            if (includeHistory) history[pairCode] = observed;
            const prior = observed.filter((p: {date: string}) => p.date < new Date(time * 1000).toISOString().slice(0, 10)).at(-1)?.close;
            return { rate, source: 'Yahoo Finance', asOf: new Date(time * 1000).toISOString(), kind: 'market', previousClose: prior };
          }
        } catch { /* try a dated reference */ }
      }
      if (pairCode === 'XAUUSD') {
        try {
          const r = await fetchWithTimeout('https://api.gold-api.com/price/XAU');
          const d = r.ok ? await r.json() : null;
          if (typeof d?.price === 'number' && d.price > 0) return { rate: d.price, source: 'gold-api', asOf: d.updatedAt, kind: 'market' };
        } catch { /* unavailable rather than a token-price proxy */ }
        return null;
      }
      const base = pairCode.slice(0, 3), quote = pairCode.slice(3);
      try {
        const r = await fetchWithTimeout(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${quote}`);
        const d = r.ok ? await r.json() : null;
        const rate = Number(d?.rates?.[quote]);
        if (Number.isFinite(rate) && rate > 0 && d?.date) return { rate, source: 'frankfurter-ecb', asOf: d.date, kind: 'daily-reference' };
      } catch { /* next */ }
      try {
        const r = await fetchWithTimeout(`https://open.er-api.com/v6/latest/${base}`);
        const d = r.ok ? await r.json() : null;
        const rate = Number(d?.rates?.[quote]);
        if (Number.isFinite(rate) && rate > 0 && d?.time_last_update_unix) return { rate, source: 'open-er-api', asOf: new Date(d.time_last_update_unix * 1000).toISOString(), kind: 'daily-reference' };
      } catch { /* unavailable */ }
      return null;
    };

    const resolved = await Promise.all(pairs.map(async (p) => [p, await resolvePair(p)] as const));
    for (const [p, r] of resolved) {
      if (r) results[p] = r;
      else unavailable.push(p);
    }

    
    return new Response(JSON.stringify({ rates: results, unavailable, history: includeHistory ? history : undefined, historyNote: includeHistory ? "Observed provider closes only; unavailable series are omitted. Gold spot history is unavailable." : undefined, timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
