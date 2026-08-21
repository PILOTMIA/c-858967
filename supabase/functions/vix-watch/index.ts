const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYMBOLS: { symbol: string; name: string; region: string }[] = [
  { symbol: '^VIX', name: 'CBOE VIX', region: 'Volatility' },
  { symbol: '^GSPC', name: 'S&P 500', region: 'United States' },
  { symbol: '^IXIC', name: 'Nasdaq Composite', region: 'United States' },
  { symbol: '^DJI', name: 'Dow Jones', region: 'United States' },
  { symbol: '^N225', name: 'Nikkei 225', region: 'Japan' },
  { symbol: '^GDAXI', name: 'DAX 40', region: 'Germany' },
  { symbol: '^FTSE', name: 'FTSE 100', region: 'United Kingdom' },
  { symbol: '^HSI', name: 'Hang Seng', region: 'Hong Kong' },
  { symbol: '^STOXX50E', name: 'Euro Stoxx 50', region: 'Europe' },
];

async function fetchSeries(symbol: string, range: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error('no data');
  const ts: number[] = r.timestamp || [];
  const closes: (number | null)[] = r.indicators?.quote?.[0]?.close || [];
  const history = ts
    .map((t, i) => ({ date: new Date(t * 1000).toISOString().slice(0, 10), close: closes[i] }))
    .filter((p) => typeof p.close === 'number' && Number.isFinite(p.close)) as { date: string; close: number }[];
  const m = r.meta || {};
  const price = Number(m.regularMarketPrice ?? history.at(-1)?.close);
  const lastBar = history.at(-1);
  const sameBar = lastBar && Math.abs(lastBar.close - price) / price < 0.0001;
  const prev = Number(
    (sameBar ? history.at(-2)?.close : lastBar?.close) ?? m.chartPreviousClose ?? price
  );
  return {
    price,
    previousClose: prev,
    change: price - prev,
    changePercent: prev ? ((price - prev) / prev) * 100 : 0,
    marketTime: (m.regularMarketTime || 0) * 1000,
    exchange: m.fullExchangeName || m.exchangeName || 'Yahoo Finance',
    history,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = new URL(req.url);
  const range = url.searchParams.get('range') || '6mo';

  const entries = await Promise.all(
    SYMBOLS.map(async (s) => {
      try {
        const data = await fetchSeries(s.symbol, range);
        return [s.symbol, { ...s, ...data, source: 'Yahoo Finance' }];
      } catch (e) {
        console.error(`vix-watch ${s.symbol}:`, e);
        return [s.symbol, { ...s, error: String(e), history: [] }];
      }
    })
  );

  return new Response(
    JSON.stringify({ markets: Object.fromEntries(entries), fetchedAt: Date.now(), range }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
});
