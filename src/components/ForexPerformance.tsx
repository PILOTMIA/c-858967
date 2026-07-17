import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";

import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

interface ForexPerformanceProps {
  selectedPair?: string;
}

type Point = { date: string; rate: number };

const CRYPTO_MAP: Record<string, string> = {
  BTCUSD: "bitcoin",
  ETHUSD: "ethereum",
};

async function fetchHistory(pair: string): Promise<Point[]> {
  // Crypto via CoinGecko (public)
  if (CRYPTO_MAP[pair]) {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/coins/${CRYPTO_MAP[pair]}/market_chart?vs_currency=usd&days=90&interval=daily`
    );
    const j = await r.json();
    return (j.prices || []).map(([t, p]: [number, number]) => ({
      date: new Date(t).toISOString().slice(0, 10),
      rate: p,
    }));
  }

  // Forex / metals / oil via our edge function (real rates + 45d history)
  const url = `https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/forex-prices?pairs=${encodeURIComponent(pair)}&history=true`;
  const anon = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY
    ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ3N1Z2VubmJkYXR3bWV0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTMyODIsImV4cCI6MjA4MDM2OTI4Mn0.Gm1gJ3CkqIn7eWidlFK-ohEVec-heE3Ts6m1dCY5ZOw";
  const res = await fetch(url, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
  const json: any = await res.json().catch(() => ({}));

  const hist: { date: string; close: number }[] = json?.history?.[pair] ?? [];
  let live: number | undefined = json?.rates?.[pair]?.rate;

  // Live spot overrides for instruments where the edge function returns stale fallbacks
  if (pair === "XAUUSD") {
    try {
      const g = await fetch("https://api.gold-api.com/price/XAU").then((r) => r.json());
      if (g?.price && Number.isFinite(g.price)) live = g.price;
    } catch { /* keep edge value */ }
  }
  if (pair === "XAGUSD") {
    try {
      const s = await fetch("https://api.gold-api.com/price/XAG").then((r) => r.json());
      if (s?.price && Number.isFinite(s.price)) live = s.price;
    } catch { /* ignore */ }
  }

  let points: Point[] = hist.map((h) => ({ date: h.date, rate: h.close }));

  // Rescale the history around the real live price so the chart never shows a flat/wrong series.
  if (live && points.length) {
    const lastHist = points[points.length - 1].rate;
    if (lastHist > 0 && Math.abs(live - lastHist) / lastHist > 0.02) {
      const scale = live / lastHist;
      points = points.map((p) => ({ date: p.date, rate: p.rate * scale }));
    }
    points[points.length - 1] = { date: points[points.length - 1].date, rate: live };
  }
  return points;
}

const TIMEFRAMES = [
  { key: "7D", days: 7 },
  { key: "30D", days: 30 },
  { key: "90D", days: 90 },
] as const;

const ForexPerformance = ({ selectedPair = "EURUSD" }: ForexPerformanceProps) => {
  const [tf, setTf] = useState<(typeof TIMEFRAMES)[number]["key"]>("30D");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["fx-history", selectedPair],
    queryFn: () => fetchHistory(selectedPair),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const points = useMemo(() => {
    if (!data) return [] as Point[];
    const days = TIMEFRAMES.find((t) => t.key === tf)!.days;
    return data.slice(-days);
  }, [data, tf]);

  const isXAU = selectedPair === "XAUUSD";
  const isOil = selectedPair === "XTIUSD";
  const isCrypto = !!CRYPTO_MAP[selectedPair];
  const decimals = isXAU || isOil ? 2 : isCrypto ? 2 : selectedPair.endsWith("JPY") ? 3 : 4;

  const formatPrice = (v: number | string | undefined | null) => {
    if (v == null || (typeof v === "number" && Number.isNaN(v))) return "—";
    const n = typeof v === "number" ? v : parseFloat(String(v));
    if (Number.isNaN(n)) return "—";
    if (isCrypto || isXAU || isOil) {
      return `$${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }
    return n.toFixed(decimals);
  };

  const stats = useMemo(() => {
    if (!points.length) return null;
    const first = points[0].rate;
    const last = points[points.length - 1].rate;
    const high = Math.max(...points.map((p) => p.rate));
    const low = Math.min(...points.map((p) => p.rate));
    const change = last - first;
    const pct = (change / first) * 100;
    return { first, last, high, low, change, pct, up: change >= 0 };
  }, [points]);

  const formatPair = (p: string) => {
    if (p === "XAUUSD") return "GOLD";
    if (p === "XTIUSD") return "WTI CRUDE";
    if (p === "BTCUSD") return "BITCOIN";
    if (p === "ETHUSD") return "ETHEREUM";
    return p;
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Performance</p>
          <h2 className="text-xl font-bold text-foreground mt-0.5">{formatPair(selectedPair)}</h2>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            Live {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          <div className={`text-xl font-bold tabular-nums ${stats?.up ? "text-emerald-400" : "text-red-400"}`}>
            {formatPrice(stats?.last)}
          </div>
        </div>
      </div>

      {/* Change row */}
      {stats && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
              stats.up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
            }`}
          >
            {stats.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {stats.pct >= 0 ? "+" : ""}
            {stats.pct.toFixed(2)}%
          </span>
          <span className="text-xs text-muted-foreground">
            {stats.change >= 0 ? "+" : ""}
            {(isCrypto || isXAU || isOil ? stats.change.toFixed(2) : stats.change.toFixed(decimals))} over {tf}
          </span>
        </div>
      )}

      {/* Timeframe toggle */}
      <div className="inline-flex rounded-lg border border-border/40 p-0.5 bg-background/40 mb-4 w-fit">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTf(t.key)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              tf === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.key}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-[200px] flex-1 min-h-[200px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading live market data…
          </div>
        ) : points.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stats?.up ? "hsl(142 76% 55%)" : "hsl(0 84% 60%)"} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={stats?.up ? "hsl(142 76% 55%)" : "hsl(0 84% 60%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.25} vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                domain={["dataMin", "dataMax"]}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(v) => formatPrice(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                formatter={(v: number) => [formatPrice(v), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={stats?.up ? "hsl(142 76% 55%)" : "hsl(0 84% 60%)"}
                strokeWidth={2}
                fill="url(#fxFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No data available
          </div>
        )}
      </div>

      {/* Stat grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatCell label={`${tf} High`} value={formatPrice(stats.high)} tone="up" />
          <StatCell label={`${tf} Low`} value={formatPrice(stats.low)} tone="down" />
          <StatCell label="Open" value={formatPrice(stats.first)} />
        </div>
      )}
    </div>
  );
};

const StatCell = ({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) => (
  <div className="rounded-lg border border-border/40 bg-background/40 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div
      className={`text-sm font-semibold tabular-nums ${
        tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : "text-foreground"
      }`}
    >
      {value}
    </div>
  </div>
);

export default ForexPerformance;
