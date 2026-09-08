import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp, ExternalLink } from "lucide-react";

export type WatchCurrency = "JPY" | "CHF" | "USD";

interface Point {
  date: string;
  value: number;
}

interface WatchConfig {
  title: string;
  eyebrow: string;
  blurb: string;
  seriesLabel: string;
  /** true when a FALLING series value means the watched currency is getting stronger */
  invert: boolean;
  decimals: number;
  sourceName: string;
  sourceUrl: string;
  footnote: string;
}

const CONFIG: Record<WatchCurrency, WatchConfig> = {
  JPY: {
    title: "Yen Strength Watch",
    eyebrow: "Currency spotlight",
    blurb:
      "Markets are pricing a Bank of Japan rate rise this month after hawkish comments from Governor Ueda, which pulled the dollar back sharply against the yen and unwound part of the carry trade.",
    seriesLabel: "USDJPY",
    invert: true,
    decimals: 2,
    sourceName: "Bank of Japan",
    sourceUrl: "https://www.boj.or.jp/en/",
    footnote: "A falling line means a stronger yen.",
  },
  CHF: {
    title: "Franc Strength Watch",
    eyebrow: "Currency spotlight",
    blurb:
      "The Swiss franc trades as the classic safe haven: it firms when risk appetite drops, and the Swiss National Bank's very low policy rate keeps it sensitive to global rate spreads.",
    seriesLabel: "USDCHF",
    invert: true,
    decimals: 5,
    sourceName: "Swiss National Bank",
    sourceUrl: "https://www.snb.ch/en/",
    footnote: "A falling line means a stronger franc.",
  },
  USD: {
    title: "Dollar Strength Watch",
    eyebrow: "Currency spotlight",
    blurb:
      "A trade-weighted read on the dollar against the euro, yen, pound, Canadian dollar, Swedish krona and franc — the same basket and weights used by the classic dollar index.",
    seriesLabel: "USD index",
    invert: false,
    decimals: 2,
    sourceName: "ECB reference rates",
    sourceUrl: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
    footnote: "A rising line means a stronger dollar.",
  },
};

const SYMBOLS = "EUR,JPY,GBP,CAD,SEK,CHF";

/** Classic dollar-index formula against the six-currency basket. */
function dollarIndex(r: Record<string, number>): number | null {
  const eurusd = r.EUR ? 1 / r.EUR : null;
  const gbpusd = r.GBP ? 1 / r.GBP : null;
  if (!eurusd || !gbpusd || !r.JPY || !r.CAD || !r.SEK || !r.CHF) return null;
  return (
    50.14348112 *
    Math.pow(eurusd, -0.576) *
    Math.pow(r.JPY, 0.136) *
    Math.pow(gbpusd, -0.119) *
    Math.pow(r.CAD, 0.091) *
    Math.pow(r.SEK, 0.042) *
    Math.pow(r.CHF, 0.036)
  );
}

async function fetchWatchSeries(currency: WatchCurrency): Promise<Point[]> {
  const end = new Date();
  const start = new Date(Date.now() - 90 * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const res = await fetch(
    `https://api.frankfurter.dev/v1/${iso(start)}..${iso(end)}?base=USD&symbols=${SYMBOLS}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("History unavailable");
  const json = await res.json();
  return Object.entries(json?.rates ?? {})
    .map(([date, raw]) => {
      const r = raw as Record<string, number>;
      const value = currency === "USD" ? dollarIndex(r) : r[currency];
      return { date, value: Number(value) };
    })
    .filter((p) => Number.isFinite(p.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const CurrencyStrengthWatch = ({ currency }: { currency: WatchCurrency }) => {
  const cfg = CONFIG[currency];
  const { data, isLoading, error } = useQuery({
    queryKey: ["currencyStrengthWatch", currency],
    queryFn: () => fetchWatchSeries(currency),
    refetchInterval: 30 * 60_000,
    staleTime: 15 * 60_000,
  });

  const series = data ?? [];
  const latest = series[series.length - 1];
  const monthAgo = series[Math.max(0, series.length - 22)];

  // Extreme that represents the watched currency at its weakest over the window.
  const extreme = series.reduce(
    (m, p) => (cfg.invert ? (p.value > m.value ? p : m) : p.value < m.value ? p : m),
    series[0] ?? { date: "", value: 0 }
  );

  const fromExtremePct =
    latest && extreme?.value ? ((latest.value - extreme.value) / extreme.value) * 100 : 0;
  const monthPct = latest && monthAgo?.value ? ((latest.value - monthAgo.value) / monthAgo.value) * 100 : 0;

  // Positive = watched currency strengthening
  const strengthMove = cfg.invert ? -monthPct : monthPct;
  const firming = strengthMove > 0;

  const fmt = (n: number) => n.toFixed(cfg.decimals);
  const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

  return (
    <section className="ma-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="ma-accent-bar h-10 mt-1" />
          <div>
            <p className="ma-eyebrow">{cfg.eyebrow}</p>
            <h2 className="ma-serif text-xl sm:text-2xl font-bold text-foreground">{cfg.title}</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{cfg.blurb}</p>
          </div>
        </div>
        {latest && (
          <span
            className={`ma-chip ma-mono !text-[10px] ${
              firming
                ? "!text-emerald-300 !border-emerald-500/40"
                : "!text-rose-300 !border-rose-500/40"
            }`}
          >
            {firming ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {currency} {firming ? "firming" : "softening"}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">
          History unavailable right now — no estimated numbers shown.
        </p>
      )}

      {isLoading ? (
        <div className="h-56 rounded-xl bg-muted/20 animate-pulse" />
      ) : latest ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: `${cfg.seriesLabel} now`, value: fmt(latest.value), sub: latest.date },
              {
                label: cfg.invert ? "90-day high" : "90-day low",
                value: fmt(extreme.value),
                sub: extreme.date,
              },
              {
                label: cfg.invert ? "Off the high" : "Off the low",
                value: signed(fromExtremePct),
                sub: `${currency} ${cfg.invert ? "stronger" : "stronger"}`,
              },
              {
                label: "Past month",
                value: signed(monthPct),
                sub: `${cfg.seriesLabel} change`,
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-[hsl(var(--ma-elev)/0.6)] bg-[hsl(var(--ma-bg)/0.55)] p-4"
              >
                <p className="ma-eyebrow !text-[10px]">{c.label}</p>
                <p className="ma-mono text-lg font-semibold text-foreground mt-1 tabular-nums">{c.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`watchFill-${currency}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(d: string) => d.slice(5)}
                  minTickGap={28}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v: number) => fmt(v)}
                  width={58}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(v: number) => [fmt(v), cfg.seriesLabel]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill={`url(#watchFill-${currency})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3">
            {cfg.footnote} Source: ECB reference rates via Frankfurter.{" "}
            <a
              href={cfg.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              {cfg.sourceName} <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </>
      ) : null}
    </section>
  );
};

export default CurrencyStrengthWatch;
