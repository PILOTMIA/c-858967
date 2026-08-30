import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Instrument universe — Yahoo Finance daily candles (free, no key)
const UNIVERSE: { pair: string; symbol: string; base: string; quote: string; klass: string }[] = [
  { pair: "EURUSD", symbol: "EURUSD=X", base: "EUR", quote: "USD", klass: "major" },
  { pair: "GBPUSD", symbol: "GBPUSD=X", base: "GBP", quote: "USD", klass: "major" },
  { pair: "USDJPY", symbol: "USDJPY=X", base: "USD", quote: "JPY", klass: "major" },
  { pair: "USDCHF", symbol: "USDCHF=X", base: "USD", quote: "CHF", klass: "major" },
  { pair: "AUDUSD", symbol: "AUDUSD=X", base: "AUD", quote: "USD", klass: "major" },
  { pair: "USDCAD", symbol: "USDCAD=X", base: "USD", quote: "CAD", klass: "major" },
  { pair: "NZDUSD", symbol: "NZDUSD=X", base: "NZD", quote: "USD", klass: "major" },
  { pair: "USDMXN", symbol: "USDMXN=X", base: "USD", quote: "MXN", klass: "major" },
  { pair: "EURJPY", symbol: "EURJPY=X", base: "EUR", quote: "JPY", klass: "cross" },
  { pair: "GBPJPY", symbol: "GBPJPY=X", base: "GBP", quote: "JPY", klass: "cross" },
  { pair: "EURGBP", symbol: "EURGBP=X", base: "EUR", quote: "GBP", klass: "cross" },
  { pair: "AUDJPY", symbol: "AUDJPY=X", base: "AUD", quote: "JPY", klass: "cross" },
  { pair: "XAUUSD", symbol: "GC=F", base: "XAU", quote: "USD", klass: "metal" },
  { pair: "BTCUSD", symbol: "BTC-USD", base: "BTC", quote: "USD", klass: "crypto" },
  { pair: "DXY", symbol: "DX-Y.NYB", base: "USD", quote: "USD", klass: "index" },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Candle { t: number; o: number; h: number; l: number; c: number }

async function fetchCandles(symbol: string): Promise<Candle[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=10y&interval=1d`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status} for ${symbol}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result?.timestamp) throw new Error(`No candles for ${symbol}`);
  const q = result.indicators.quote[0];
  const out: Candle[] = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
    if ([o, h, l, c].some((v) => v == null || !isFinite(v) || v <= 0)) continue;
    out.push({ t: result.timestamp[i] * 1000, o, h, l, c });
  }
  return out;
}

function round(n: number, d = 3) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function analyse(candles: Candle[]) {
  // ── 20-month day-of-week rhythm ──────────────────────────────────────────
  const cutoff = Date.now() - 20 * 30.44 * 24 * 3600 * 1000;
  const recent = candles.filter((c) => c.t >= cutoff);

  const buckets: Record<number, { pct: number[]; range: number[] }> = {};
  for (const c of recent) {
    const dow = new Date(c.t).getUTCDay();
    if (dow === 0 || dow === 6) continue; // skip weekend candles (crypto)
    const pct = ((c.c - c.o) / c.o) * 100;
    const range = ((c.h - c.l) / c.o) * 100;
    if (!isFinite(pct) || !isFinite(range)) continue;
    buckets[dow] ??= { pct: [], range: [] };
    buckets[dow].pct.push(pct);
    buckets[dow].range.push(range);
  }

  const dow = [1, 2, 3, 4, 5].map((d) => {
    const b = buckets[d] ?? { pct: [], range: [] };
    const n = b.pct.length || 1;
    const avgPct = b.pct.reduce((a, v) => a + v, 0) / n;
    const avgRangePct = b.range.reduce((a, v) => a + v, 0) / (b.range.length || 1);
    const ups = b.pct.filter((v) => v > 0).length;
    return {
      day: DAY_NAMES[d],
      short: DAY_NAMES[d].slice(0, 3),
      avgPct: round(avgPct),
      avgRangePct: round(avgRangePct),
      upRate: round((ups / n) * 100, 1),
      samples: b.pct.length,
    };
  });

  const biggestMover = [...dow].sort((a, b) => b.avgRangePct - a.avgRangePct)[0];
  const strongestDirectional = [...dow].sort(
    (a, b) => Math.abs(b.avgPct) - Math.abs(a.avgPct),
  )[0];

  // ── Seasonality for the current calendar month (all history) ─────────────
  const month = new Date().getUTCMonth();
  const byYear: Record<number, { first: Candle; last: Candle }> = {};
  for (const c of candles) {
    const d = new Date(c.t);
    if (d.getUTCMonth() !== month) continue;
    const y = d.getUTCFullYear();
    if (!byYear[y]) byYear[y] = { first: c, last: c };
    else byYear[y].last = c;
  }
  const monthReturns = Object.entries(byYear)
    .map(([y, v]) => ({ year: Number(y), pct: round(((v.last.c - v.first.o) / v.first.o) * 100, 2) }))
    .sort((a, b) => a.year - b.year);
  const closed = monthReturns.filter((m) => m.year !== new Date().getUTCFullYear());
  const seasonalAvg = closed.length
    ? closed.reduce((a, v) => a + v.pct, 0) / closed.length
    : 0;
  const seasonalUpRate = closed.length
    ? (closed.filter((m) => m.pct > 0).length / closed.length) * 100
    : 0;

  // ── Recent momentum & volatility ─────────────────────────────────────────
  const last = candles[candles.length - 1];
  const back20 = candles[Math.max(0, candles.length - 21)];
  const back60 = candles[Math.max(0, candles.length - 61)];
  const vol20 = candles.slice(-20).reduce((a, c) => a + ((c.h - c.l) / c.o) * 100, 0) / Math.min(20, candles.length);

  return {
    lastClose: round(last.c, 5),
    asOf: new Date(last.t).toISOString().slice(0, 10),
    momentum20: round(((last.c - back20.c) / back20.c) * 100, 2),
    momentum60: round(((last.c - back60.c) / back60.c) * 100, 2),
    vol20: round(vol20),
    sessions: recent.length,
    dayOfWeek: dow,
    biggestMoveDay: biggestMover.day,
    strongestDay: strongestDirectional.day,
    strongestDayDirection: strongestDirectional.avgPct >= 0 ? "up" : "down",
    strongestDayAvgPct: strongestDirectional.avgPct,
    seasonal: {
      month: MONTH_NAMES[month],
      avgPct: round(seasonalAvg, 2),
      upRate: round(seasonalUpRate, 1),
      years: closed.length,
      history: monthReturns.slice(-12),
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const results = await Promise.all(
      UNIVERSE.map(async (inst) => {
        try {
          const candles = await fetchCandles(inst.symbol);
          return { ...inst, ok: true, ...analyse(candles) };
        } catch (e) {
          console.error(`market-rhythm ${inst.pair}:`, (e as Error).message);
          return { ...inst, ok: false, error: (e as Error).message };
        }
      }),
    );

    return new Response(
      JSON.stringify({
        data: results,
        window: "20 months of daily candles",
        source: "Yahoo Finance daily OHLC",
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
