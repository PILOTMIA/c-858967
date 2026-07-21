import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  LabelList,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Compass, Radar as RadarIcon, PieChart as PieIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const CATEGORY_COLORS: Record<PairDef["category"], string> = {
  Forex: "hsl(210 90% 55%)",
  Commodities: "hsl(38 92% 55%)",
  Crypto: "hsl(280 80% 60%)",
};

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

// Turn a single currency's COT net position + weekly change into a -6..+6 conviction score.
function currencyScore(net: number, weekly: number): number {
  const sign = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const netPart = sign(net) * Math.min(Math.abs(net) / 50000, 1) * 3;
  const momentumPart = sign(weekly) * Math.min(Math.abs(weekly) / 20000, 1) * 3;
  return Math.max(-6, Math.min(6, netPart + momentumPart));
}

function sentimentLabel(score: number): { label: string; color: string } {
  if (score >= 4)   return { label: "Strong Bullish", color: "hsl(142 76% 36%)" };
  if (score >= 2)   return { label: "Bullish",        color: "hsl(142 65% 45%)" };
  if (score >= 0.5) return { label: "Weak Bullish",   color: "hsl(142 55% 60%)" };
  if (score > -0.5) return { label: "Neutral",        color: "hsl(220 10% 55%)" };
  if (score > -2)   return { label: "Weak Bearish",   color: "hsl(0 55% 65%)" };
  if (score > -4)   return { label: "Bearish",        color: "hsl(0 70% 50%)" };
  return              { label: "Strong Bearish",      color: "hsl(0 78% 40%)" };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Row = {
  pair: string;
  category: PairDef["category"];
  conviction: number;
  dailyPct: number;
  price: number | null;
  sentiment: string;
  color: string;
  quadrant: string;
};

const filters = ["All", "Forex", "Commodities", "Crypto"] as const;
type Filter = typeof filters[number];

const SentimentMatrix = () => {
  const [cot, setCot] = useState<Record<string, { netPosition: number; weeklyChange: number }>>({});
  const [prices, setPrices] = useState<Record<string, { rate: number; prev: number }>>({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("All");

  const load = async () => {
    setLoading(true);
    try {
      // 1. COT positioning
      const cotUrl = `https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/cftc-cot?currencies=${CFTC_CCYS.join(",")}`;
      const cotRes = await fetch(cotUrl).then(r => r.json()).catch(() => ({ data: {} }));
      const cotMap: Record<string, { netPosition: number; weeklyChange: number }> = {};
      Object.entries(cotRes?.data || {}).forEach(([k, v]: any) => {
        cotMap[k] = { netPosition: Number(v.netPosition) || 0, weeklyChange: Number(v.weeklyChange) || 0 };
      });
      setCot(cotMap);

      // 2. Live prices with history (so we can compute daily %)
      const fxPairs = PAIRS.filter(p => p.category === "Forex" || p.pair === "XAUUSD").map(p => p.pair).join(",");
      const { data: fxData } = await supabase.functions.invoke("forex-prices", {
        method: "GET" as any,
      }).catch(() => ({ data: null } as any));

      // supabase.functions.invoke doesn't attach query params easily; use direct fetch.
      const fxRes = await fetch(
        `https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/forex-prices?pairs=${fxPairs}&history=true`
      ).then(r => r.json()).catch(() => ({ rates: {}, history: {} }));

      const priceMap: Record<string, { rate: number; prev: number }> = {};
      Object.entries(fxRes?.rates || {}).forEach(([k, v]: any) => {
        const hist = fxRes?.history?.[k] || [];
        const rate = Number(v?.rate) || 0;
        const prev = hist.length >= 2 ? Number(hist[hist.length - 2].close) : rate;
        priceMap[k] = { rate, prev };
      });

      // BTC via CoinGecko
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
      // conviction on the PAIR = base strength minus quote strength, clamped
      const conviction = Math.max(-6, Math.min(6, baseS - quoteS));

      const px = prices[p.pair];
      const dailyPct = px && px.prev ? ((px.rate - px.prev) / px.prev) * 100 : 0;
      const s = sentimentLabel(conviction);

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
        sentiment: s.label,
        color: s.color,
        quadrant,
      };
    });
  }, [cot, prices]);

  const filtered = rows.filter(r => filter === "All" || r.category === filter);

  const contextScore = rows.length
    ? rows.reduce((a, r) => a + r.conviction, 0) / rows.length
    : 0;
  const contextLabel = sentimentLabel(contextScore);

  // Sunburst-style data (nested pies)
  const innerRing = ["Forex", "Commodities", "Crypto"].map(cat => ({
    name: cat,
    value: rows.filter(r => r.category === (cat as PairDef["category"])).length,
    color: CATEGORY_COLORS[cat as PairDef["category"]],
  })).filter(x => x.value > 0);

  const outerRing = rows.map(r => ({
    name: r.pair,
    value: 1 + Math.abs(r.conviction),
    color: r.color,
    category: r.category,
  }));

  const radialData = [...rows]
    .sort((a, b) => b.conviction - a.conviction)
    .map(r => ({
      name: r.pair,
      value: Number((r.conviction + 6).toFixed(2)), // shift into 0..12 for radial length
      raw: r.conviction,
      fill: r.color,
    }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Compass className="w-3.5 h-3.5" /> Sentiment Matrix
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold mt-1">
              Contrarian Radar &amp; Asset Matrix
            </h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-2xl">
              COT institutional conviction cross-referenced with live daily price action across {rows.length} instruments.
              Identify reversals where price diverges from positioning.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: contextLabel.color }} />
              Market context: {contextLabel.label} ({contextScore.toFixed(2)})
            </Badge>
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground self-center">
            {updated ? `Updated ${updated.toLocaleTimeString()}` : "Loading…"}
          </span>
        </div>

        {/* Contrarian Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RadarIcon className="w-4 h-4 text-primary" /> Contrarian Radar
            </CardTitle>
            <CardDescription>
              High-probability reversal setups where price action diverges from institutional conviction.
              X axis: COT conviction score (-6 bearish → +6 bullish). Y axis: daily price change %.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[440px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    dataKey="conviction"
                    name="Conviction"
                    domain={[-6, 6]}
                    ticks={[-6, -3, 0, 3, 6]}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Conviction Score", position: "insideBottom", offset: -15, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="dailyPct"
                    name="Daily %"
                    domain={[-2, 2]}
                    tickFormatter={(v) => `${v}%`}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: "Daily Price Change (%)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }}
                  />
                  <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: any, n: string) => {
                      if (n === "Daily %") return [`${v}%`, "Daily change"];
                      if (n === "Conviction") return [v, "Conviction"];
                      return [v, n];
                    }}
                    labelFormatter={() => ""}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const r: Row = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-lg">
                          <div className="font-semibold">{r.pair}</div>
                          <div className="text-muted-foreground">{r.quadrant}</div>
                          <div>Conviction: <span className="font-mono">{r.conviction}</span></div>
                          <div>Daily: <span className="font-mono">{r.dailyPct}%</span></div>
                          <div>Sentiment: <span style={{ color: r.color }}>{r.sentiment}</span></div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={filtered}>
                    {filtered.map((r, i) => (
                      <Cell key={i} fill={r.dailyPct >= 0 ? "hsl(142 65% 45%)" : "hsl(0 70% 55%)"} />
                    ))}
                    <LabelList dataKey="pair" position="top" style={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
                  </Scatter>

                  {/* Quadrant labels */}
                  <text x="8%"  y="8%"  fill="hsl(var(--muted-foreground))" fontSize={11}>Bullish, Unexpected</text>
                  <text x="72%" y="8%"  fill="hsl(var(--muted-foreground))" fontSize={11}>Bullish, As Expected</text>
                  <text x="8%"  y="94%" fill="hsl(var(--muted-foreground))" fontSize={11}>Bearish, As Expected</text>
                  <text x="72%" y="94%" fill="hsl(var(--muted-foreground))" fontSize={11}>Bearish, Unexpected</text>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Matrix: Consensus + Sunburst */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RadarIcon className="w-4 h-4 text-primary" /> Consensus (COT Conviction)
              </CardTitle>
              <CardDescription>Every instrument ranked by institutional conviction, colored by sentiment.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="18%" outerRadius="95%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={4} />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload?.length) return null;
                        const p: any = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-lg">
                            <div className="font-semibold">{p.name}</div>
                            <div>Conviction: <span className="font-mono">{p.raw}</span></div>
                          </div>
                        );
                      }}
                    />
                    <LabelList dataKey="name" position="insideStart" style={{ fontSize: 9, fill: "hsl(var(--foreground))" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
                {["Strong Bearish","Bearish","Weak Bearish","Neutral","Weak Bullish","Bullish","Strong Bullish"].map(l => {
                  const c = sentimentLabel(
                    l === "Strong Bullish" ? 5 : l === "Bullish" ? 3 : l === "Weak Bullish" ? 1 :
                    l === "Neutral" ? 0 : l === "Weak Bearish" ? -1 : l === "Bearish" ? -3 : -5
                  ).color;
                  return (
                    <span key={l} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                      {l}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-primary" /> Asset Universe Sunburst
              </CardTitle>
              <CardDescription>Instruments grouped by asset class, sized by conviction magnitude.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={innerRing}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="0%"
                      outerRadius="42%"
                      paddingAngle={1}
                    >
                      {innerRing.map((e, i) => <Cell key={i} fill={e.color} />)}
                      <LabelList dataKey="name" position="inside" style={{ fontSize: 11, fill: "white", fontWeight: 600 }} />
                    </Pie>
                    <Pie
                      data={outerRing}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="46%"
                      outerRadius="92%"
                      paddingAngle={1}
                    >
                      {outerRing.map((e, i) => <Cell key={i} fill={e.color} />)}
                      <LabelList dataKey="name" position="outside" style={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      formatter={() => null as any}
                      payload={innerRing.map(r => ({ value: `${r.name} (${r.value})`, type: "square", color: r.color, id: r.name }))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data table */}
        <Card>
          <CardHeader>
            <CardTitle>All instruments</CardTitle>
            <CardDescription>Sortable snapshot of every pair in the matrix.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="py-2 pr-4">Pair</th>
                    <th className="py-2 pr-4">Class</th>
                    <th className="py-2 pr-4">Conviction</th>
                    <th className="py-2 pr-4">Daily %</th>
                    <th className="py-2 pr-4">Sentiment</th>
                    <th className="py-2 pr-4">Quadrant</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.sort((a, b) => b.conviction - a.conviction).map(r => (
                    <tr key={r.pair} className="border-t border-border/50">
                      <td className="py-2 pr-4 font-mono font-semibold">{r.pair}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{r.category}</td>
                      <td className="py-2 pr-4 font-mono">{r.conviction}</td>
                      <td className={`py-2 pr-4 font-mono ${r.dailyPct >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {r.dailyPct >= 0 ? "+" : ""}{r.dailyPct}%
                      </td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                          {r.sentiment}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{r.quadrant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-[11px] text-muted-foreground text-center">
          Sources: CFTC Commitments of Traders (weekly), Frankfurter/ExchangeRate/FreeForex live rates, CoinGecko (BTC), gold-api.com (XAU).
        </p>
      </div>
    </div>
  );
};

export default SentimentMatrix;
