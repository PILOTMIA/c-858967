import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from "recharts";
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, ShieldCheck, RefreshCw } from "lucide-react";
import { useState } from "react";

const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ3N1Z2VubmJkYXR3bWV0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTMyODIsImV4cCI6MjA4MDM2OTI4Mn0.Gm1gJ3CkqIn7eWidlFK-ohEVec-heE3Ts6m1dCY5ZOw";

const TEN_MIN = 1000 * 60 * 10;

interface Market {
  symbol: string;
  name: string;
  region: string;
  price?: number;
  change?: number;
  changePercent?: number;
  marketTime?: number;
  exchange?: string;
  source?: string;
  error?: string;
  history: { date: string; close: number }[];
}

interface Payload {
  markets: Record<string, Market>;
  fetchedAt: number;
  range: string;
}

async function fetchVix(range: string): Promise<Payload> {
  const res = await fetch(
    `https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/vix-watch?range=${range}`,
    { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Feed error ${res.status}`);
  return res.json();
}

/** Pearson correlation of daily % returns between two aligned close series */
function correlation(a: { date: string; close: number }[], b: { date: string; close: number }[]) {
  const mapB = new Map(b.map((p) => [p.date, p.close]));
  const pairs: [number, number][] = [];
  for (let i = 1; i < a.length; i++) {
    const prevB = mapB.get(a[i - 1].date);
    const curB = mapB.get(a[i].date);
    if (prevB === undefined || curB === undefined) continue;
    pairs.push([(a[i].close - a[i - 1].close) / a[i - 1].close, (curB - prevB) / prevB]);
  }
  if (pairs.length < 5) return null;
  const n = pairs.length;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my);
    dx += (x - mx) ** 2;
    dy += (y - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

const vixRegime = (v: number) => {
  if (v < 14) return { label: "Complacent", tone: "text-success", desc: "Low fear — equity trends usually grind higher." };
  if (v < 20) return { label: "Normal", tone: "text-foreground", desc: "Balanced volatility — trend-following conditions." };
  if (v < 28) return { label: "Elevated", tone: "text-warning", desc: "Risk-off pressure building across global equities." };
  return { label: "Stress", tone: "text-destructive", desc: "Panic regime — equities typically sell off hard worldwide." };
};

const RANGES = [
  { key: "1mo", label: "1M" },
  { key: "3mo", label: "3M" },
  { key: "6mo", label: "6M" },
  { key: "1y", label: "1Y" },
];

const VixWatch = () => {
  const [range, setRange] = useState("6mo");
  const { data, isLoading, isFetching, dataUpdatedAt, refetch, error } = useQuery({
    queryKey: ["vix-watch", range],
    queryFn: () => fetchVix(range),
    refetchInterval: TEN_MIN,
    staleTime: TEN_MIN / 2,
  });

  const vix = data?.markets["^VIX"];
  const equities = Object.values(data?.markets ?? {}).filter((m) => m.symbol !== "^VIX");

  // Normalised overlay series: VIX raw vs rebased equity indices
  const chartData = (() => {
    if (!vix?.history?.length) return [];
    const base = new Map<string, number>();
    for (const m of equities) if (m.history?.length) base.set(m.symbol, m.history[0].close);
    return vix.history.map((p) => {
      const row: Record<string, number | string> = { date: p.date, VIX: p.close };
      for (const m of equities) {
        const hit = m.history.find((h) => h.date === p.date);
        const b = base.get(m.symbol);
        if (hit && b) row[m.symbol] = (hit.close / b) * 100;
      }
      return row;
    });
  })();

  const regime = vix?.price ? vixRegime(vix.price) : null;
  const ageMin = Math.max(0, Math.round((Date.now() - dataUpdatedAt) / 60000));

  const seriesColors: Record<string, string> = {
    "^GSPC": "hsl(var(--primary))",
    "^IXIC": "hsl(200 90% 55%)",
    "^DJI": "hsl(45 90% 55%)",
    "^N225": "hsl(340 80% 60%)",
    "^GDAXI": "hsl(150 65% 45%)",
    "^FTSE": "hsl(265 70% 65%)",
    "^HSI": "hsl(20 85% 58%)",
    "^STOXX50E": "hsl(180 60% 50%)",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Global Risk Monitor</p>
            <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground">VIX &amp; Global Equity Tracker</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              The fear gauge leads global equities. When the VIX spikes, US, Japanese and European
              stock markets typically fall together. Live quotes refresh every 10 minutes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border/40 overflow-hidden">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${
                    range === r.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Syncing" : `Updated ${ageMin}m ago`}
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Live feed unavailable right now. Retrying automatically.
          </div>
        )}

        {/* VIX hero */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CBOE Volatility Index</span>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <p className="text-5xl font-bold tabular-nums mt-3 text-foreground">
              {vix?.price ? vix.price.toFixed(2) : isLoading ? "—" : "n/a"}
            </p>
            {vix?.changePercent !== undefined && (
              <p className={`mt-1 flex items-center gap-1 text-sm ${vix.changePercent >= 0 ? "text-destructive" : "text-success"}`}>
                {vix.changePercent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {vix.change?.toFixed(2)} ({vix.changePercent.toFixed(2)}%)
              </p>
            )}
            {regime && (
              <div className="mt-4 rounded-xl border border-border/40 bg-background/40 p-4">
                <div className="flex items-center gap-2">
                  {vix && vix.price! >= 20 ? (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-success" />
                  )}
                  <span className={`text-sm font-semibold ${regime.tone}`}>{regime.label} regime</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{regime.desc}</p>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-3">Source: {vix?.exchange || "Cboe via Yahoo Finance"}</p>
          </div>

          {/* Overlay chart */}
          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 sm:p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground mb-1">VIX vs global equity indices</h2>
            <p className="text-xs text-muted-foreground mb-4">Indices rebased to 100 (right axis) · VIX level (left axis)</p>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vixFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }} minTickGap={40} />
                  <YAxis yAxisId="vix" tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }} width={40} />
                  <YAxis yAxisId="idx" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={44} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                    formatter={(v: number, n: string) => [v.toFixed(2), n === "VIX" ? "VIX" : data?.markets[n]?.name ?? n]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                    formatter={(v: string) => (v === "VIX" ? "VIX" : data?.markets[v]?.name ?? v)}
                  />
                  <Area
                    yAxisId="vix"
                    dataKey="VIX"
                    stroke="hsl(var(--destructive))"
                    fill="url(#vixFill)"
                    strokeWidth={2}
                    dot={false}
                  />
                  {equities.map((m) => (
                    <Line
                      key={m.symbol}
                      yAxisId="idx"
                      type="monotone"
                      dataKey={m.symbol}
                      stroke={seriesColors[m.symbol] || "hsl(var(--muted-foreground))"}
                      strokeWidth={1.6}
                      dot={false}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Market cards with correlation */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Inverse correlation to the VIX</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {equities.map((m) => {
              const corr = vix?.history ? correlation(vix.history, m.history || []) : null;
              const up = (m.changePercent ?? 0) >= 0;
              return (
                <div key={m.symbol} className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.region}</p>
                    </div>
                    <span className={`text-xs font-medium ${up ? "text-success" : "text-destructive"}`}>
                      {up ? "+" : ""}{(m.changePercent ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums mt-3 text-foreground">
                    {m.price ? m.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>VIX correlation</span>
                      <span className={`font-semibold ${corr !== null && corr < 0 ? "text-success" : "text-warning"}`}>
                        {corr !== null ? corr.toFixed(2) : "n/a"}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted/40 overflow-hidden relative">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                      {corr !== null && (
                        <div
                          className={`absolute inset-y-0 ${corr < 0 ? "bg-success" : "bg-warning"}`}
                          style={{
                            width: `${Math.min(Math.abs(corr), 1) * 50}%`,
                            left: corr < 0 ? `${50 - Math.min(Math.abs(corr), 1) * 50}%` : "50%",
                          }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {corr !== null && corr < -0.4
                        ? "Strong inverse link — VIX spikes hit this market hard."
                        : corr !== null && corr < 0
                        ? "Mild inverse link to volatility."
                        : "Currently decoupled from the fear gauge."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground text-center">
          Data: Cboe &amp; global exchanges via Yahoo Finance · auto-refresh every 10 minutes · correlations use daily
          returns over the selected window. Educational use only, not investment advice.
        </p>
      </div>
    </div>
  );
};

export default VixWatch;
