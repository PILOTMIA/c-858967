import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Compass, Radar as RadarIcon, LayoutGrid, TrendingUp, TrendingDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const CFTC_CCYS = ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "MXN", "USD", "XAU", "BTC"];

type PairDef = { pair: string; base: string; quote: string; category: "Forex" | "Commodities" | "Crypto" };

const PAIRS: PairDef[] = [
  { pair: "EURUSD", base: "EUR", quote: "USD", category: "Forex" },
  { pair: "GBPUSD", base: "GBP", quote: "USD", category: "Forex" },
  { pair: "AUDUSD", base: "AUD", quote: "USD", category: "Forex" },
  { pair: "NZDUSD", base: "NZD", quote: "USD", category: "Forex" },
  { pair: "USDJPY", base: "USD", quote: "JPY", category: "Forex" },
  { pair: "USDCHF", base: "USD", quote: "CHF", category: "Forex" },
  { pair: "USDCAD", base: "USD", quote: "CAD", category: "Forex" },
  { pair: "USDMXN", base: "USD", quote: "MXN", category: "Forex" },
  { pair: "EURJPY", base: "EUR", quote: "JPY", category: "Forex" },
  { pair: "EURGBP", base: "EUR", quote: "GBP", category: "Forex" },
  { pair: "GBPJPY", base: "GBP", quote: "JPY", category: "Forex" },
  { pair: "AUDJPY", base: "AUD", quote: "JPY", category: "Forex" },
  { pair: "EURAUD", base: "EUR", quote: "AUD", category: "Forex" },
  { pair: "GBPAUD", base: "GBP", quote: "AUD", category: "Forex" },
  { pair: "EURCAD", base: "EUR", quote: "CAD", category: "Forex" },
  { pair: "GBPCAD", base: "GBP", quote: "CAD", category: "Forex" },
  { pair: "CADJPY", base: "CAD", quote: "JPY", category: "Forex" },
  { pair: "NZDJPY", base: "NZD", quote: "JPY", category: "Forex" },
  { pair: "XAUUSD", base: "XAU", quote: "USD", category: "Commodities" },
  { pair: "BTCUSD", base: "BTC", quote: "USD", category: "Crypto" },
];

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

function currencyScore(net: number, weekly: number): number {
  const sign = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const netPart = sign(net) * Math.min(Math.abs(net) / 50000, 1) * 3;
  const momentumPart = sign(weekly) * Math.min(Math.abs(weekly) / 20000, 1) * 3;
  return Math.max(-6, Math.min(6, netPart + momentumPart));
}

function sentimentTone(score: number): "strongBull" | "bull" | "weakBull" | "neutral" | "weakBear" | "bear" | "strongBear" {
  if (score >= 4)   return "strongBull";
  if (score >= 2)   return "bull";
  if (score >= 0.5) return "weakBull";
  if (score > -0.5) return "neutral";
  if (score > -2)   return "weakBear";
  if (score > -4)   return "bear";
  return              "strongBear";
}

const TONE_LABEL: Record<ReturnType<typeof sentimentTone>, string> = {
  strongBull: "Strong Bullish",
  bull:       "Bullish",
  weakBull:   "Weak Bullish",
  neutral:    "Neutral",
  weakBear:   "Weak Bearish",
  bear:       "Bearish",
  strongBear: "Strong Bearish",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Row = {
  pair: string;
  category: PairDef["category"];
  conviction: number;
  dailyPct: number;
  price: number | null;
  tone: ReturnType<typeof sentimentTone>;
  quadrant: string;
};

const filters = ["All", "Forex", "Commodities", "Crypto"] as const;
type Filter = typeof filters[number];

const SentimentMatrix = () => {
  const [cot, setCot] = useState<Record<string, { netPosition: number; weeklyChange: number }>>({});
  const [prices, setPrices] = useState<Record<string, { rate: number; prev: number; mom5d: number }>>({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("All");

  const load = async () => {
    setLoading(true);
    try {
      const cotUrl = `https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/cftc-cot?currencies=${CFTC_CCYS.join(",")}`;
      const cotRes = await fetch(cotUrl).then(r => r.json()).catch(() => ({ data: {} }));
      const cotMap: Record<string, { netPosition: number; weeklyChange: number }> = {};
      Object.entries(cotRes?.data || {}).forEach(([k, v]: any) => {
        cotMap[k] = { netPosition: Number(v.netPosition) || 0, weeklyChange: Number(v.weeklyChange) || 0 };
      });
      setCot(cotMap);

      const fxPairs = PAIRS.filter(p => p.category === "Forex" || p.pair === "XAUUSD").map(p => p.pair).join(",");
      const fxRes = await fetch(
        `https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/forex-prices?pairs=${fxPairs}&history=true`
      ).then(r => r.json()).catch(() => ({ rates: {}, history: {} }));

      const priceMap: Record<string, { rate: number; prev: number; mom5d: number }> = {};
      Object.entries(fxRes?.rates || {}).forEach(([k, v]: any) => {
        const hist = fxRes?.history?.[k] || [];
        const rate = Number(v?.rate) || 0;
        const prev = hist.length >= 2 ? Number(hist[hist.length - 2].close) : rate;
        // 5-day momentum — always has spread even when the daily tick is flat
        const back = hist.length >= 6 ? Number(hist[hist.length - 6].close) : prev;
        const mom5d = back ? ((rate - back) / back) * 100 : 0;
        priceMap[k] = { rate, prev, mom5d };
      });


      try {
        const btc = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
        ).then(r => r.json());
        const rate = Number(btc?.bitcoin?.usd) || 0;
        const chg  = Number(btc?.bitcoin?.usd_24h_change) || 0;
        if (rate) priceMap["BTCUSD"] = { rate, prev: rate / (1 + chg / 100) };
      } catch { /* ignore */ }

      setPrices(priceMap);
      setUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const rows: Row[] = useMemo(() => {
    const ccyScore: Record<string, number> = {};
    Object.entries(cot).forEach(([k, v]) => {
      ccyScore[k] = currencyScore(v.netPosition, v.weeklyChange);
    });

    return PAIRS.map(p => {
      const baseS  = ccyScore[p.base]  ?? 0;
      const quoteS = ccyScore[p.quote] ?? 0;
      const conviction = Math.max(-6, Math.min(6, baseS - quoteS));

      const px = prices[p.pair];
      const dailyPct = px && px.prev ? ((px.rate - px.prev) / px.prev) * 100 : 0;

      const bullishConviction = conviction > 0;
      const bullishPrice = dailyPct > 0;
      const quadrant =
        bullishConviction && bullishPrice   ? "Bullish, As Expected"
      : !bullishConviction && !bullishPrice ? "Bearish, As Expected"
      : bullishConviction && !bullishPrice  ? "Bullish, Unexpected"
                                            : "Bearish, Unexpected";

      return {
        pair: p.pair,
        category: p.category,
        conviction: Number(conviction.toFixed(2)),
        dailyPct: Number(dailyPct.toFixed(2)),
        price: px?.rate ?? null,
        tone: sentimentTone(conviction),
        quadrant,
      };
    });
  }, [cot, prices]);

  const filtered = rows.filter(r => filter === "All" || r.category === filter);

  const contextScore = rows.length ? rows.reduce((a, r) => a + r.conviction, 0) / rows.length : 0;
  const contextTone = sentimentTone(contextScore);

  // Stat rail
  const bullCount = rows.filter(r => r.conviction >= 0.5).length;
  const bearCount = rows.filter(r => r.conviction <= -0.5).length;
  const strongestDivergence = [...rows]
    .filter(r => r.price !== null)
    .map(r => ({ ...r, div: Math.abs(r.conviction) + Math.abs(r.dailyPct) * (Math.sign(r.conviction) !== Math.sign(r.dailyPct) ? 2 : 0) }))
    .sort((a, b) => b.div - a.div)[0];
  const strongestBull = [...rows].sort((a, b) => b.conviction - a.conviction)[0];
  const strongestBear = [...rows].sort((a, b) => a.conviction - b.conviction)[0];

  const ranked = [...filtered].sort((a, b) => b.conviction - a.conviction);
  const maxAbs = Math.max(6, ...ranked.map(r => Math.abs(r.conviction)));

  // Positions for the radar (in %) with a simple label-collision offset.
  const radarPoints = useMemo(() => {
    const items = filtered.map(r => {
      const x = ((r.conviction + 6) / 12) * 100;
      // clamp visible daily change to ±3% so labels stay in the plot
      const clamped = Math.max(-3, Math.min(3, r.dailyPct));
      const y = 50 - (clamped / 3) * 45; // 5..95%
      return { ...r, x, y };
    });
    // sort by x so we can offset overlapping labels vertically
    items.sort((a, b) => a.x - b.x);
    const bucket: Record<number, number> = {};
    return items.map(it => {
      const key = Math.round(it.x / 6); // ~6% wide buckets
      bucket[key] = (bucket[key] ?? 0) + 1;
      const stack = bucket[key] - 1;
      // alternate above/below when stacked
      const labelOffsetY = stack === 0 ? -14 : stack % 2 === 1 ? 14 + Math.floor(stack / 2) * 14 : -(14 + Math.floor(stack / 2) * 14);
      return { ...it, labelOffsetY };
    });
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
              <Compass className="w-3.5 h-3.5" /> Sentiment Matrix
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mt-2 text-foreground">
              Contrarian Radar &amp; Asset Matrix
            </h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
              COT institutional conviction cross-referenced with live daily price action across {rows.length} instruments.
              Identify reversals where price diverges from positioning.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stat rail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            label="Market Context"
            value={TONE_LABEL[contextTone]}
            sub={`avg ${contextScore.toFixed(2)}`}
            tone={contextTone}
          />
          <StatTile
            label="Bullish Instruments"
            value={String(bullCount)}
            sub={`${rows.length ? Math.round((bullCount / rows.length) * 100) : 0}% of book`}
            tone="bull"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
          />
          <StatTile
            label="Bearish Instruments"
            value={String(bearCount)}
            sub={`${rows.length ? Math.round((bearCount / rows.length) * 100) : 0}% of book`}
            tone="bear"
            icon={<TrendingDown className="w-3.5 h-3.5" />}
          />
          <StatTile
            label="Top Divergence"
            value={strongestDivergence?.pair ?? "—"}
            sub={strongestDivergence ? `${strongestDivergence.conviction} conv · ${strongestDivergence.dailyPct >= 0 ? "+" : ""}${strongestDivergence.dailyPct}%` : ""}
            tone={strongestDivergence && Math.sign(strongestDivergence.conviction) !== Math.sign(strongestDivergence.dailyPct) ? "strongBull" : "neutral"}
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 items-center">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors font-mono uppercase tracking-wider ${
                filter === f
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
            {updated ? `Refresh · ${updated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} UTC` : "Loading…"}
          </span>
        </div>

        {/* Contrarian Radar - custom SVG/HTML */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Contrarian Radar
              </h2>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-mono">
                Institutional Conviction vs. Price Action
              </p>
            </div>
            <div className="flex gap-4 text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Bullish Price</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-rose-500 rounded-full" /> Bearish Price</span>
            </div>
          </div>

          <div className="relative h-[480px] w-full border-l border-b border-border">
            {/* Quadrant labels */}
            <div className="absolute top-3 left-3 text-[10px] font-medium text-emerald-500/70 uppercase tracking-widest font-mono">Bullish, Unexpected</div>
            <div className="absolute top-3 right-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest font-mono">Bullish, As Expected</div>
            <div className="absolute bottom-3 left-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest font-mono">Bearish, As Expected</div>
            <div className="absolute bottom-3 right-3 text-[10px] font-medium text-rose-500/70 uppercase tracking-widest font-mono">Bearish, Unexpected</div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-border" />
            <div className="absolute left-1/2 top-0 h-full w-px border-l border-dashed border-border" />

            {/* Faint grid */}
            {[25, 75].map(p => (
              <div key={`h${p}`} className="absolute left-0 w-full h-px bg-border/40" style={{ top: `${p}%` }} />
            ))}
            {[25, 75].map(p => (
              <div key={`v${p}`} className="absolute top-0 h-full w-px bg-border/40" style={{ left: `${p}%` }} />
            ))}

            {/* Y axis ticks */}
            <div className="absolute -left-10 top-[5%] text-[10px] font-mono text-muted-foreground">+3%</div>
            <div className="absolute -left-10 top-[50%] -translate-y-1/2 text-[10px] font-mono text-muted-foreground">0%</div>
            <div className="absolute -left-10 bottom-[5%] text-[10px] font-mono text-muted-foreground">-3%</div>

            {/* Data points */}
            {radarPoints.map(pt => {
              const priceUp = pt.dailyPct >= 0;
              return (
                <div
                  key={pt.pair}
                  className="absolute group"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-transform group-hover:scale-150 ${
                      priceUp
                        ? "bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.55)]"
                        : "bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.55)]"
                    }`}
                  />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-foreground whitespace-nowrap pointer-events-none"
                    style={{ top: pt.labelOffsetY }}
                  >
                    {pt.pair}
                  </span>
                  {/* Tooltip on hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-4 hidden group-hover:block z-10 whitespace-nowrap bg-popover border border-border rounded-md px-3 py-2 text-xs shadow-lg">
                    <div className="font-semibold text-foreground">{pt.pair}</div>
                    <div className="text-muted-foreground">{pt.quadrant}</div>
                    <div className="font-mono">Conviction: {pt.conviction}</div>
                    <div className="font-mono">Daily: {pt.dailyPct >= 0 ? "+" : ""}{pt.dailyPct}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            <span>-6 Bearish Conviction</span>
            <span>0 Neutral</span>
            <span>+6 Bullish Conviction</span>
          </div>
        </section>

        {/* Consensus + Universe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consensus Ranking */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <RadarIcon className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Consensus Ranking</h2>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-auto">
                Institutional Bias
              </span>
            </div>

            <div className="space-y-3 font-mono">
              {ranked.map((r, i) => {
                const pct = Math.min(100, (Math.abs(r.conviction) / maxAbs) * 100);
                const bullish = r.conviction >= 0;
                return (
                  <div key={r.pair} className="flex items-center gap-3 group">
                    <span className="text-[10px] text-muted-foreground w-6 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-foreground w-16 font-semibold">{r.pair}</span>
                    <div className="flex-1 h-4 bg-muted/40 rounded-sm overflow-hidden flex relative">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                      {bullish ? (
                        <div className="ml-[50%] h-full flex">
                          <div
                            className="h-full bg-emerald-500 rounded-r-sm transition-all"
                            style={{ width: `${pct}%`, boxShadow: pct > 60 ? "0 0 8px rgba(16,185,129,0.4)" : undefined }}
                          />
                        </div>
                      ) : (
                        <div className="mr-[50%] h-full flex justify-end w-1/2">
                          <div
                            className="h-full bg-rose-500 rounded-l-sm transition-all"
                            style={{ width: `${pct}%`, boxShadow: pct > 60 ? "0 0 8px rgba(244,63,94,0.4)" : undefined }}
                          />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold w-14 text-right tabular-nums ${
                      bullish ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {bullish ? "+" : ""}{r.conviction}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> Bearish</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-muted rounded-sm" /> Neutral</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Bullish</span>
              <span className="ml-auto">Strongest: <span className="text-emerald-500">{strongestBull?.pair}</span> · <span className="text-rose-500">{strongestBear?.pair}</span></span>
            </div>
          </section>

          {/* Asset Universe Treemap */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Asset Universe</h2>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-auto">
                Magnitude Weighted
              </span>
            </div>

            <UniverseTreemap rows={filtered} />

            <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-mono uppercase tracking-wider">
              <CategoryLegend name="Forex" count={rows.filter(r => r.category === "Forex").length} />
              <CategoryLegend name="Commodities" count={rows.filter(r => r.category === "Commodities").length} />
              <CategoryLegend name="Crypto" count={rows.filter(r => r.category === "Crypto").length} />
            </div>
          </section>
        </div>

        {/* Data table */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">All Instruments</h2>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Sortable Snapshot · {filtered.length} rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground text-[10px] uppercase tracking-widest font-mono border-b border-border">
                  <th className="py-2 pr-4">Pair</th>
                  <th className="py-2 pr-4">Class</th>
                  <th className="py-2 pr-4">Conviction</th>
                  <th className="py-2 pr-4">Daily %</th>
                  <th className="py-2 pr-4">Sentiment</th>
                  <th className="py-2 pr-4">Quadrant</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map(r => (
                  <tr key={r.pair} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 pr-4 font-mono font-semibold text-foreground">{r.pair}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-xs">{r.category}</td>
                    <td className={`py-2.5 pr-4 font-mono tabular-nums ${r.conviction >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {r.conviction >= 0 ? "+" : ""}{r.conviction}
                    </td>
                    <td className={`py-2.5 pr-4 font-mono tabular-nums ${r.dailyPct >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {r.dailyPct >= 0 ? "+" : ""}{r.dailyPct}%
                    </td>
                    <td className="py-2.5 pr-4">
                      <ToneBadge tone={r.tone} />
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-xs">{r.quadrant}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground text-center font-mono uppercase tracking-wider">
          Sources: CFTC Commitments of Traders (weekly) · Frankfurter / ExchangeRate / FreeForex live rates · CoinGecko (BTC) · gold-api.com (XAU)
        </p>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const TONE_STYLE: Record<ReturnType<typeof sentimentTone>, { bg: string; border: string; text: string; dot: string }> = {
  strongBull: { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400", dot: "bg-emerald-500" },
  bull:       { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" },
  weakBull:   { bg: "bg-emerald-500/5",  border: "border-emerald-500/20", text: "text-emerald-500/80", dot: "bg-emerald-500/70" },
  neutral:    { bg: "bg-muted/40",       border: "border-border",         text: "text-muted-foreground", dot: "bg-muted-foreground" },
  weakBear:   { bg: "bg-rose-500/5",     border: "border-rose-500/20",    text: "text-rose-500/80", dot: "bg-rose-500/70" },
  bear:       { bg: "bg-rose-500/10",    border: "border-rose-500/30",    text: "text-rose-400", dot: "bg-rose-500" },
  strongBear: { bg: "bg-rose-500/15",    border: "border-rose-500/40",    text: "text-rose-400", dot: "bg-rose-500" },
};

const StatTile = ({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: ReturnType<typeof sentimentTone>;
  icon?: React.ReactNode;
}) => {
  const t = TONE_STYLE[tone];
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-4`}>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${t.text} font-mono tabular-nums`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1 font-mono">{sub}</div>}
    </div>
  );
};

const ToneBadge = ({ tone }: { tone: ReturnType<typeof sentimentTone> }) => {
  const t = TONE_STYLE[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${t.border} ${t.bg} ${t.text} text-[10px] font-mono uppercase tracking-wider`}>
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {TONE_LABEL[tone]}
    </span>
  );
};

const CategoryLegend = ({ name, count }: { name: string; count: number }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-muted/20">
    <span className="text-muted-foreground">{name}</span>
    <span className="text-foreground tabular-nums">{count}</span>
  </div>
);

/**
 * Category-grouped treemap. Rows are grouped by category, each group takes
 * horizontal width proportional to total magnitude, cells inside take height
 * proportional to their conviction magnitude. Uses only semantic + tailwind
 * palette classes — no pie/donut/sunburst.
 */
const UniverseTreemap = ({ rows }: { rows: Row[] }) => {
  const groups = (["Forex", "Commodities", "Crypto"] as const)
    .map(cat => ({
      category: cat,
      items: rows.filter(r => r.category === cat),
    }))
    .filter(g => g.items.length > 0);

  const totalMag = rows.reduce((a, r) => a + (Math.abs(r.conviction) + 1), 0) || 1;

  return (
    <div className="flex gap-2 h-[320px] w-full">
      {groups.map(g => {
        const groupMag = g.items.reduce((a, r) => a + (Math.abs(r.conviction) + 1), 0);
        const widthPct = (groupMag / totalMag) * 100;
        return (
          <div
            key={g.category}
            className="flex flex-col gap-1.5"
            style={{ width: `${widthPct}%` }}
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground pb-1 border-b border-border">
              {g.category} · {g.items.length}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              {g.items
                .sort((a, b) => Math.abs(b.conviction) - Math.abs(a.conviction))
                .map(r => {
                  const heightPct = ((Math.abs(r.conviction) + 1) / groupMag) * 100;
                  const t = TONE_STYLE[r.tone];
                  const big = heightPct > 15;
                  return (
                    <div
                      key={r.pair}
                      className={`rounded-md border ${t.border} ${t.bg} p-2 flex flex-col justify-between cursor-crosshair hover:brightness-125 transition-all overflow-hidden`}
                      style={{ flexBasis: `${heightPct}%` }}
                      title={`${r.pair} · ${TONE_LABEL[r.tone]} · ${r.conviction}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className={`font-mono font-semibold ${t.text} ${big ? "text-sm" : "text-[10px]"} leading-none`}>
                          {r.pair}
                        </span>
                        {big && (
                          <span className={`text-[10px] font-mono ${t.text} tabular-nums opacity-70`}>
                            {r.conviction >= 0 ? "+" : ""}{r.conviction}
                          </span>
                        )}
                      </div>
                      {big && (
                        <span className={`text-[9px] font-mono uppercase tracking-widest ${t.text} opacity-70`}>
                          {TONE_LABEL[r.tone]}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SentimentMatrix;
