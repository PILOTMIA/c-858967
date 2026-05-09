import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  BarChart, Bar, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

const CURRENCY_GROUPS = {
  "Majors": ["EUR", "GBP", "JPY", "CHF"],
  "Commodity": ["AUD", "CAD", "NZD"],
  "Metals & Crypto": ["XAU", "BTC"],
  "Index": ["USD"],
};

const COLOR_MAP: Record<string, string> = {
  EUR: "hsl(var(--chart-1))",
  GBP: "hsl(var(--chart-2))",
  JPY: "hsl(var(--chart-3))",
  CHF: "hsl(var(--chart-4))",
  AUD: "hsl(var(--chart-5))",
  CAD: "hsl(142 71% 45%)",
  NZD: "hsl(262 83% 58%)",
  USD: "hsl(38 92% 50%)",
  XAU: "hsl(45 93% 47%)",
  BTC: "hsl(25 95% 53%)",
};

const TIMEFRAMES = [
  { label: "4W", weeks: 4 },
  { label: "12W", weeks: 12 },
  { label: "24W", weeks: 24 },
  { label: "All", weeks: 0 },
];

interface HistoryRow {
  currency: string;
  report_date: string;
  long_positions: number;
  short_positions: number;
  net_position: number;
  change_long: number;
  change_short: number;
}

const fmt = (v: number) => {
  if (v == null || isNaN(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toString();
};

// Detailed tooltip with long / short / net breakdown
const DetailedTooltip = ({ active, payload, label, history, focusCurrency }: any) => {
  if (!active || !payload?.length) return null;

  const date = payload[0]?.payload?.date;
  const currencies = focusCurrency ? [focusCurrency] : payload.map((p: any) => p.dataKey).filter((k: string) => k && !k.endsWith("_band"));

  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md p-3 shadow-xl text-xs min-w-[200px]">
      <div className="font-semibold text-foreground mb-2 pb-2 border-b border-border/50">
        {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
      </div>
      <div className="space-y-2">
        {currencies.map((c: string) => {
          const row = history?.find((r: HistoryRow) => r.currency === c && r.report_date === date);
          if (!row) return null;
          return (
            <div key={c} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold" style={{ color: COLOR_MAP[c] }}>{c}</span>
                <span className={`font-mono font-bold ${row.net_position >= 0 ? "text-success" : "text-destructive"}`}>
                  Net {row.net_position >= 0 ? "+" : ""}{fmt(row.net_position)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pl-1">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Long: <span className="text-foreground font-mono">{fmt(row.long_positions)}</span>
                  </div>
                  {row.change_long != null && (
                    <div className={`flex items-center gap-0.5 pl-2.5 ${row.change_long >= 0 ? "text-success" : "text-destructive"}`}>
                      {row.change_long >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                      {row.change_long >= 0 ? "+" : ""}{fmt(row.change_long)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                    Short: <span className="text-foreground font-mono">{fmt(row.short_positions)}</span>
                  </div>
                  {row.change_short != null && (
                    <div className={`flex items-center gap-0.5 pl-2.5 ${row.change_short >= 0 ? "text-destructive" : "text-success"}`}>
                      {row.change_short >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                      {row.change_short >= 0 ? "+" : ""}{fmt(row.change_short)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const COTHistoryTrends = () => {
  const [selected, setSelected] = useState<string[]>(["EUR", "JPY", "AUD", "XAU"]);
  const [timeframe, setTimeframe] = useState<number>(12);
  const [focusCurrency, setFocusCurrency] = useState<string>("EUR");

  const { data: history, dataUpdatedAt } = useQuery({
    queryKey: ["cot-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cot_history")
        .select("currency, report_date, long_positions, short_positions, net_position, change_long, change_short")
        .order("report_date", { ascending: true });
      if (error) throw error;
      return data as HistoryRow[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const toggle = (c: string) => {
    setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  // Build unified timeline + apply timeframe window
  const allDates = useMemo(
    () => [...new Set(history?.map((r) => r.report_date) ?? [])].sort(),
    [history]
  );
  const windowDates = timeframe > 0 ? allDates.slice(-timeframe) : allDates;

  const lineData = useMemo(() => {
    return windowDates.map((d) => {
      const row: Record<string, any> = {
        date: d,
        label: new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      selected.forEach((c) => {
        const match = history?.find((r) => r.currency === c && r.report_date === d);
        row[c] = match?.net_position ?? null;
      });
      return row;
    });
  }, [windowDates, selected, history]);

  // Focus chart: long vs short stacked area + net line, for one currency over the window
  const focusData = useMemo(() => {
    return windowDates.map((d) => {
      const r = history?.find((row) => row.currency === focusCurrency && row.report_date === d);
      return {
        date: d,
        label: new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        long: r?.long_positions ?? null,
        short: r ? -r.short_positions : null,
        net: r?.net_position ?? null,
      };
    });
  }, [windowDates, focusCurrency, history]);

  // Latest snapshot for bar comparison
  const latestDate = allDates[allDates.length - 1];
  const barData = useMemo(
    () =>
      history
        ?.filter((r) => r.report_date === latestDate)
        .map((r) => ({
          currency: r.currency,
          net: r.net_position,
          long: r.long_positions,
          short: r.short_positions,
        }))
        .sort((a, b) => b.net - a.net) ?? [],
    [history, latestDate]
  );

  return (
    <div className="space-y-6">
      {/* Multi-currency Net Trend */}
      <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg font-bold text-foreground">COT Net Position Trends</CardTitle>
            <div className="flex items-center gap-3">
              {/* Timeframe selector */}
              <div className="flex items-center gap-1 rounded-lg bg-muted/30 p-1 border border-border/40">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.label}
                    onClick={() => setTimeframe(tf.weeks)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      timeframe === tf.weeks
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
              {dataUpdatedAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(dataUpdatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4 mb-4">
            {Object.entries(CURRENCY_GROUPS).map(([group, currencies]) => (
              <div key={group} className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{group}</span>
                <div className="flex gap-1">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggle(c)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        selected.includes(c)
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={fmt}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} />
                <Tooltip content={<DetailedTooltip history={history} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                {selected.map((c) => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={c}
                    stroke={COLOR_MAP[c] ?? "hsl(var(--primary))"}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            Source: CFTC Non-Commercial Positions — verified weekly reports. Hover for long/short breakdown.
          </p>
        </CardContent>
      </Card>

      {/* Single-currency Long vs Short Focus Chart — premium visual */}
      <Card className="relative border-border/30 bg-gradient-to-br from-card/40 via-card/20 to-card/40 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          background: `radial-gradient(circle at 20% 0%, ${COLOR_MAP[focusCurrency]}22, transparent 50%)`,
        }} />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLOR_MAP[focusCurrency] }} />
                Long vs Short — <span style={{ color: COLOR_MAP[focusCurrency] }} className="font-display-hero tracking-tight">{focusCurrency}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Institutional positioning split with net overlay</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.values(CURRENCY_GROUPS).flat().map((c) => (
                <button
                  key={c}
                  onClick={() => setFocusCurrency(c)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    focusCurrency === c
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {(() => {
            const latest = focusData[focusData.length - 1];
            const first = focusData[0];
            if (!latest) return null;
            const longChange = latest.long != null && first?.long != null ? latest.long - first.long : 0;
            const shortChange = latest.short != null && first?.short != null ? Math.abs(latest.short) - Math.abs(first.short) : 0;
            const netNow = latest.net ?? 0;
            return (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl border border-success/25 bg-success/[0.06] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold">Longs</div>
                  <div className="text-xl font-bold font-mono text-success">{fmt(latest.long ?? 0)}</div>
                  <div className={`text-[10px] font-mono ${longChange >= 0 ? "text-success" : "text-destructive"}`}>
                    {longChange >= 0 ? "▲" : "▼"} {fmt(Math.abs(longChange))} period
                  </div>
                </div>
                <div className="rounded-xl border border-destructive/25 bg-destructive/[0.06] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold">Shorts</div>
                  <div className="text-xl font-bold font-mono text-destructive">{fmt(Math.abs(latest.short ?? 0))}</div>
                  <div className={`text-[10px] font-mono ${shortChange <= 0 ? "text-success" : "text-destructive"}`}>
                    {shortChange >= 0 ? "▲" : "▼"} {fmt(Math.abs(shortChange))} period
                  </div>
                </div>
                <div className={`rounded-xl border p-3 ${netNow >= 0 ? "border-success/30 bg-success/[0.08]" : "border-destructive/30 bg-destructive/[0.08]"}`}>
                  <div className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold">Net Position</div>
                  <div className={`text-xl font-bold font-mono ${netNow >= 0 ? "text-success" : "text-destructive"}`}>
                    {netNow >= 0 ? "+" : ""}{fmt(netNow)}
                  </div>
                  <div className="text-[10px] text-foreground/60 font-mono">{netNow >= 0 ? "Net Long bias" : "Net Short bias"}</div>
                </div>
              </div>
            );
          })()}

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={focusData} stackOffset="sign" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="longGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.55} />
                  </linearGradient>
                  <linearGradient id="shortGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => fmt(Math.abs(v))} />
                <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeOpacity={0.4} />
                <Tooltip content={<DetailedTooltip history={history} focusCurrency={focusCurrency} />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                <Bar dataKey="long" stackId="pos" fill="url(#longGrad)" name="Long" radius={[4, 4, 0, 0]} />
                <Bar dataKey="short" stackId="pos" fill="url(#shortGrad)" name="Short" radius={[0, 0, 4, 4]} />
                <Line type="monotone" dataKey="net" stroke={COLOR_MAP[focusCurrency]} strokeWidth={3} dot={{ r: 3.5, strokeWidth: 0, fill: COLOR_MAP[focusCurrency] }} activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }} name="Net" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Green = long contracts, red = short contracts (negative axis), colored line = net position.
          </p>
        </CardContent>
      </Card>

      {/* Current Snapshot Bar Chart */}
      <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-foreground">
            Current Net Positioning — {latestDate ? new Date(latestDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} />
                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={fmt} />
                <YAxis
                  type="category"
                  dataKey="currency"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 700 }}
                  width={40}
                />
                <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                  formatter={(value: number, _name: string, item: any) => {
                    const d = item?.payload;
                    return [
                      `Net ${fmt(value)}  •  Long ${fmt(d?.long ?? 0)}  •  Short ${fmt(d?.short ?? 0)}`,
                      d?.currency ?? "",
                    ];
                  }}
                />
                <Bar dataKey="net" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.net >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {barData.slice(0, 3).map((item) => (
              <Badge key={item.currency} className="bg-success/15 text-success border-success/30 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {item.currency} +{fmt(item.net)}
              </Badge>
            ))}
            {barData.slice(-3).map((item) => (
              <Badge key={item.currency} className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
                <TrendingDown className="w-3 h-3 mr-1" />
                {item.currency} {fmt(item.net)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default COTHistoryTrends;
