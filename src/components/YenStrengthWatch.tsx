import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, ExternalLink } from "lucide-react";

interface Point {
  date: string;
  usdjpy: number;
}

async function fetchYenHistory(): Promise<Point[]> {
  const end = new Date();
  const start = new Date(Date.now() - 90 * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const res = await fetch(
    `https://api.frankfurter.dev/v1/${iso(start)}..${iso(end)}?base=USD&symbols=JPY`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Yen history unavailable");
  const json = await res.json();
  return Object.entries(json?.rates ?? {})
    .map(([date, r]) => ({ date, usdjpy: Number((r as Record<string, number>).JPY) }))
    .filter((p) => Number.isFinite(p.usdjpy))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const YenStrengthWatch = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["yenStrength"],
    queryFn: fetchYenHistory,
    refetchInterval: 30 * 60_000,
    staleTime: 15 * 60_000,
  });

  const series = data ?? [];
  const latest = series[series.length - 1];
  const peak = series.reduce((m, p) => (p.usdjpy > m.usdjpy ? p : m), series[0] ?? { date: "", usdjpy: 0 });
  const monthAgo = series[Math.max(0, series.length - 22)];

  const fromPeakPct = latest && peak?.usdjpy ? ((peak.usdjpy - latest.usdjpy) / peak.usdjpy) * 100 : 0;
  const monthPct = latest && monthAgo?.usdjpy ? ((monthAgo.usdjpy - latest.usdjpy) / monthAgo.usdjpy) * 100 : 0;

  return (
    <section className="ma-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="ma-accent-bar h-10 mt-1" />
          <div>
            <p className="ma-eyebrow">Currency spotlight</p>
            <h2 className="ma-serif text-xl sm:text-2xl font-bold text-foreground">Yen Strength Watch</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              The yen is the strongest major right now. Markets are pricing a Bank of Japan rate rise this
              month after hawkish comments from Governor Ueda, which pulled the dollar back sharply against
              the yen and unwound part of the carry trade.
            </p>
          </div>
        </div>
        <span className="ma-chip ma-mono !text-[10px] !text-emerald-300 !border-emerald-500/40">
          <TrendingDown className="h-3 w-3" /> Yen firming
        </span>
      </div>

      {error && (
        <p className="text-xs text-destructive">Yen history unavailable right now — no estimated numbers shown.</p>
      )}

      {isLoading ? (
        <div className="h-56 rounded-xl bg-muted/20 animate-pulse" />
      ) : latest ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "USDJPY now", value: latest.usdjpy.toFixed(2), sub: latest.date },
              { label: "90-day high", value: peak.usdjpy.toFixed(2), sub: peak.date },
              { label: "Off the high", value: `-${fromPeakPct.toFixed(2)}%`, sub: "yen stronger" },
              { label: "Past month", value: `${monthPct >= 0 ? "-" : "+"}${Math.abs(monthPct).toFixed(2)}%`, sub: "USDJPY change" },
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
                  <linearGradient id="yenFill" x1="0" y1="0" x2="0" y2="1">
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
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={48}
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
                  formatter={(v: number) => [v.toFixed(2), "USDJPY"]}
                />
                <Area
                  type="monotone"
                  dataKey="usdjpy"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#yenFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3">
            A falling line means a stronger yen. Source: ECB reference rates via Frankfurter.{" "}
            <a
              href="https://www.boj.or.jp/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Bank of Japan <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </>
      ) : null}
    </section>
  );
};

export default YenStrengthWatch;
