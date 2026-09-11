import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLatestCOT, latestReportDate, type CotPosition } from "@/hooks/useLatestCOT";
import { useSpotMomentum, squeezeCheck } from "@/hooks/useSpotMomentum";
import { fetchMarketNews } from "@/services/MarketNewsService";
import { buildCalendar } from "@/lib/economicCalendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid,
} from "recharts";
import {
  TrendingUp, TrendingDown, CalendarClock, Target, Activity, ShieldCheck,
  ShieldAlert, ShieldX, Sparkles, ChevronDown, Zap, Newspaper, Clock3,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────
interface DowStat { day: string; short: string; avgPct: number; avgRangePct: number; upRate: number; samples: number }
interface RhythmRow {
  pair: string; base: string; quote: string; klass: string; ok: boolean;
  lastClose: number; asOf: string; momentum20: number; momentum60: number; vol20: number;
  sessions: number; dayOfWeek: DowStat[]; biggestMoveDay: string; strongestDay: string;
  strongestDayDirection: "up" | "down"; strongestDayAvgPct: number;
  seasonal: { month: string; avgPct: number; upRate: number; years: number; history: { year: number; pct: number }[] };
}
const PAIR_LABELS: Record<string, string> = {
  EURUSD: "EURUSD", GBPUSD: "GBPUSD", USDJPY: "USDJPY", USDCHF: "USDCHF",
  AUDUSD: "AUDUSD", USDCAD: "USDCAD", NZDUSD: "NZDUSD", USDMXN: "USDMXN",
  EURJPY: "EURJPY", GBPJPY: "GBPJPY", EURGBP: "EURGBP", AUDJPY: "AUDJPY",
  XAUUSD: "Gold (XAUUSD)", BTCUSD: "Bitcoin (BTCUSD)", DXY: "Dollar Index (DXY)",
};

// ── Data hooks ──────────────────────────────────────────────────────────────
const useRhythm = () =>
  useQuery({
    queryKey: ["market-rhythm"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("market-rhythm");
      if (error) throw error;
      return (data?.data ?? []) as RhythmRow[];
    },
    staleTime: 30 * 60 * 1000,
  });

// ── Scoring ─────────────────────────────────────────────────────────────────
function buildSignal(row: RhythmRow, cot: Record<string, CotPosition>, scale: number, flowScale: number) {
  const baseCot = cot[row.base];
  const quoteCot = cot[row.quote];
  const isSelfQuoted = row.base === row.quote; // DXY

  const netOf = (c?: CotPosition) => c?.net ?? 0;
  const flowOf = (c?: CotPosition) => c?.weekly ?? 0;

  const rawPos = isSelfQuoted ? netOf(baseCot) : netOf(baseCot) - netOf(quoteCot);
  const rawFlow = isSelfQuoted ? flowOf(baseCot) : flowOf(baseCot) - flowOf(quoteCot);

  const posScore = scale ? Math.max(-1, Math.min(1, rawPos / scale)) : 0;
  const flowScore = flowScale ? Math.max(-1, Math.min(1, rawFlow / flowScale)) : 0;

  const blended = posScore * 0.62 + flowScore * 0.38;
  const direction: "LONG" | "SHORT" = blended >= 0 ? "LONG" : "SHORT";
  const conviction = Math.round(Math.abs(blended) * 100);

  const momentumAgrees = Math.sign(row.momentum20 || 0) === Math.sign(blended || 0) && row.momentum20 !== 0;
  const seasonalAgrees =
    Math.sign(row.seasonal.avgPct || 0) === Math.sign(blended || 0) && row.seasonal.avgPct !== 0;

  let confirmations = 0;
  if (conviction >= 30) confirmations++;
  if (momentumAgrees) confirmations++;
  if (seasonalAgrees) confirmations++;

  const verdict =
    confirmations >= 3 ? "TRADE IT" : confirmations === 2 ? "TRADE SMALL" : "STAND ASIDE";

  // Expected weekly travel from realised daily range (5 sessions, damped)
  const expectedWeekPct = row.vol20 * 5 * 0.55;
  const move = (row.lastClose * expectedWeekPct) / 100;
  const target = direction === "LONG" ? row.lastClose + move : row.lastClose - move;
  const invalidation = direction === "LONG" ? row.lastClose - move * 0.5 : row.lastClose + move * 0.5;

  const bestDay = [...row.dayOfWeek].sort(
    (a, b) => Math.abs(b.avgPct) - Math.abs(a.avgPct),
  )[0];
  const bestAligned = [...row.dayOfWeek]
    .filter((d) => (direction === "LONG" ? d.avgPct > 0 : d.avgPct < 0))
    .sort((a, b) => Math.abs(b.avgPct) - Math.abs(a.avgPct))[0];

  return {
    ...row,
    rawPos, rawFlow, posScore, flowScore, blended, direction, conviction,
    momentumAgrees, seasonalAgrees, confirmations, verdict,
    expectedWeekPct, target, invalidation, bestDay, bestAligned,
    reportDate: baseCot?.reportDate ?? quoteCot?.reportDate ?? "",
  };
}
type Signal = ReturnType<typeof buildSignal>;

const decimals = (p: string) => (p.includes("JPY") ? 3 : p === "BTCUSD" ? 0 : p === "XAUUSD" || p === "DXY" || p === "USDMXN" ? 2 : 5);
const fmt = (v: number, pair: string) =>
  v.toLocaleString("en-US", { minimumFractionDigits: decimals(pair), maximumFractionDigits: decimals(pair) });

const verdictStyle = (v: string) =>
  v === "TRADE IT"
    ? { cls: "bg-success/15 text-success border-success/40", Icon: ShieldCheck }
    : v === "TRADE SMALL"
    ? { cls: "bg-warning/15 text-warning border-warning/40", Icon: ShieldAlert }
    : { cls: "bg-muted text-muted-foreground border-border", Icon: ShieldX };

// ── Component ───────────────────────────────────────────────────────────────
const WeeklyPlaybook = () => {
  const rhythm = useRhythm();
  const cot = useLatestCOT();
  const spot = useSpotMomentum();
  const news = useQuery({
    queryKey: ["weekly-playbook-news"],
    queryFn: fetchMarketNews,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
  const [filter, setFilter] = useState<"tradeable" | "all" | "major" | "cross" | "other">("tradeable");
  const [expanded, setExpanded] = useState<string | null>(null);

  const signals: Signal[] = useMemo(() => {
    const rows = (rhythm.data ?? []).filter((r) => r.ok);
    const c = cot.data ?? {};
    if (!rows.length || !Object.keys(c).length) return [];
    const scale = Math.max(...Object.values(c).map((v) => Math.abs(v.net)), 1) * 1.4;
    const flowScale = Math.max(...Object.values(c).map((v) => Math.abs(v.weekly)), 1) * 1.6;
    return rows
      .map((r) => buildSignal(r, c, scale, flowScale))
      .sort((a, b) => b.confirmations - a.confirmations || b.conviction - a.conviction);
  }, [rhythm.data, cot.data]);

  const squeezes = useMemo(() => {
    const momentum = spot.data?.momentum ?? {};
    return signals
      .map((signal) => {
        const priceBias = (momentum[signal.base] ?? 0) - (momentum[signal.quote] ?? 0);
        const check = squeezeCheck(signal.rawPos, priceBias);
        return { ...signal, priceBias, isSqueeze: check.squeeze };
      })
      .filter((signal) => signal.isSqueeze)
      .sort((a, b) => Math.abs(b.priceBias) - Math.abs(a.priceBias))
      .slice(0, 5);
  }, [signals, spot.data]);

  const sentimentRows = useMemo(() => {
    const pairScores = news.data?.majorPairs ?? {};
    return signals
      .map((signal) => ({ signal, sentiment: pairScores[signal.pair] }))
      .filter((row) => row.sentiment)
      .sort((a, b) => Math.abs(b.sentiment.score - 50) - Math.abs(a.sentiment.score - 50))
      .slice(0, 6);
  }, [news.data, signals]);

  const upcomingReports = useMemo(() => {
    const now = Date.now();
    return buildCalendar(0, 2)
      .filter((event) => event.when.getTime() >= now && event.impact !== "low")
      .slice(0, 6);
  }, []);

  const visible = signals.filter((s) =>
    filter === "all" ? true
      : filter === "tradeable" ? s.verdict !== "STAND ASIDE"
      : filter === "other" ? !["major", "cross"].includes(s.klass)
      : s.klass === filter,
  );

  const isLoading = rhythm.isLoading || cot.isLoading;
  const reportDate = latestReportDate(cot.data) ?? signals[0]?.reportDate;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!signals.length) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Playbook data is refreshing. Live COT positioning and 20-month price rhythm will appear here shortly.
      </Card>
    );
  }

  const filters: { id: typeof filter; label: string }[] = [
    { id: "tradeable", label: `Worth Trading (${signals.filter((s) => s.verdict !== "STAND ASIDE").length})` },
    { id: "all", label: `All (${signals.length})` },
    { id: "major", label: "Majors" },
    { id: "cross", label: "Crosses" },
    { id: "other", label: "Gold, BTC & DXY" },
  ];

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <Card className="relative overflow-hidden rounded-2xl border-border/60 bg-card/80 backdrop-blur-xl p-5 sm:p-6">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                This Week's Playbook
              </h2>
              <Badge className="gap-1 border border-primary/30 bg-primary/15 text-primary hover:bg-primary/20">
                <Sparkles className="h-3 w-3" /> New
              </Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Institutional COT positioning tells you <span className="text-foreground font-medium">where</span> a market
              is likely headed. Twenty months of daily candles tell you <span className="text-foreground font-medium">when</span> it
              usually moves. Both are combined below into one plain-English verdict per market.
            </p>
          </div>
          <div className="shrink-0 text-xs text-muted-foreground space-y-0.5">
            <div>COT report: <span className="font-medium text-foreground">{reportDate || "latest"}</span></div>
            <div>Rhythm window: <span className="font-medium text-foreground">20 months daily</span></div>
            <div>Sources: CFTC · Yahoo Finance</div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]" aria-label="Weekly market intelligence">
        <Card className="border-border/60 bg-card/80 p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Zap className="h-5 w-5 text-warning" /> Top COT squeezes
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Crowded positioning moving against the latest five-session price trend.</p>
            </div>
            <Badge variant="outline">{squeezes.length} active</Badge>
          </div>
          {squeezes.length ? (
            <div className="divide-y divide-border/60">
              {squeezes.map((item, index) => (
                <div key={item.pair} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  <div>
                    <div className="font-semibold text-foreground">{PAIR_LABELS[item.pair] ?? item.pair}</div>
                    <div className="text-xs text-muted-foreground">Crowd {item.rawPos >= 0 ? "long" : "short"} · price {item.priceBias >= 0 ? "rising" : "falling"}</div>
                  </div>
                  <Badge className={item.priceBias >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}>
                    {item.priceBias >= 0 ? "LONG" : "SHORT"} {Math.abs(item.priceBias).toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">No confirmed crowded-position squeeze is active. That is a valid stand-aside signal.</p>
          )}
        </Card>

        <Card className="border-border/60 bg-card/80 p-5">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Newspaper className="h-5 w-5 text-primary" /> Live sentiment scores
          </h3>
          <p className="mt-1 mb-4 text-xs text-muted-foreground">Current headline direction, refreshed every five minutes.</p>
          <div className="space-y-3">
            {sentimentRows.length ? sentimentRows.map(({ signal, sentiment }) => (
              <div key={signal.pair} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{signal.pair}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.max(4, Math.min(100, sentiment.score))}%` }} /></div>
                  <span className="w-8 text-right font-mono text-xs text-foreground">{Math.round(sentiment.score)}</span>
                  <Badge variant="outline" className="w-20 justify-center text-[10px]">{sentiment.sentiment}</Badge>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">Live sentiment is refreshing.</p>}
          </div>
        </Card>
      </section>

      <section aria-labelledby="week-ahead-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 id="week-ahead-title" className="flex items-center gap-2 text-lg font-semibold text-foreground"><CalendarClock className="h-5 w-5 text-primary" /> Reports ahead</h3>
            <p className="mt-1 text-xs text-muted-foreground">Scheduled releases most likely to interrupt this week’s COT setup.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {upcomingReports.map((event) => (
            <Card key={event.id} className="border-border/60 bg-card/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold text-foreground">{event.title}</div>
                <Badge variant="outline" className={event.impact === "high" ? "border-destructive/40 text-destructive" : "border-warning/40 text-warning"}>{event.impact}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {event.when.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
              <div className="mt-2 text-xs text-muted-foreground">Impacts {event.pairs.slice(0, 4).join(" · ")}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4 xl:grid-cols-2">
        {visible.map((s) => {
          const v = verdictStyle(s.verdict);
          const long = s.direction === "LONG";
          const open = expanded === s.pair;
          return (
            <Card
              key={s.pair}
              className={`relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl p-5 transition-shadow hover:shadow-[0_10px_40px_-16px_hsl(var(--primary)/0.35)] ${
                long ? "border-success/25" : "border-destructive/25"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-0.5 ${long ? "bg-success/70" : "bg-destructive/70"}`}
              />

              {/* Row 1 — pair + verdict */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold tracking-tight text-foreground">
                    {PAIR_LABELS[s.pair] ?? s.pair}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {fmt(s.lastClose, s.pair)} · as of {s.asOf}
                  </div>
                </div>
                <Badge variant="outline" className={`gap-1 border ${v.cls}`}>
                  <v.Icon className="h-3 w-3" /> {s.verdict}
                </Badge>
              </div>

              {/* Row 2 — direction & conviction */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Target className="h-3 w-3" /> COT points to
                  </div>
                  <div className={`flex items-center gap-1.5 text-base font-semibold ${long ? "text-success" : "text-destructive"}`}>
                    {long ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {long ? "Higher" : "Lower"}
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${long ? "bg-success" : "bg-destructive"}`}
                      style={{ width: `${Math.max(4, s.conviction)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {s.conviction}% conviction
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <CalendarClock className="h-3 w-3" /> Best day to act
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {(s.bestAligned ?? s.bestDay).day}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Avg {(s.bestAligned ?? s.bestDay).avgPct > 0 ? "+" : ""}
                    {(s.bestAligned ?? s.bestDay).avgPct}% · {(s.bestAligned ?? s.bestDay).upRate}% up-days
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Widest range: {s.biggestMoveDay}
                  </div>
                </div>
              </div>

              {/* Row 3 — plain english */}
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Speculators are net {s.rawPos >= 0 ? "long" : "short"}{" "}
                <span className="font-mono text-foreground">{Math.abs(Math.round(s.rawPos)).toLocaleString()}</span>{" "}
                contracts on this spread and {s.rawFlow >= 0 ? "added to" : "cut"} that bet by{" "}
                <span className="font-mono text-foreground">{Math.abs(Math.round(s.rawFlow)).toLocaleString()}</span>{" "}
                last week. Price momentum over 20 sessions is{" "}
                <span className={s.momentum20 >= 0 ? "text-success" : "text-destructive"}>
                  {s.momentum20 > 0 ? "+" : ""}{s.momentum20}%
                </span>{" "}
                ({s.momentumAgrees ? "agrees" : "disagrees"}), and {s.seasonal.month} has averaged{" "}
                <span className={s.seasonal.avgPct >= 0 ? "text-success" : "text-destructive"}>
                  {s.seasonal.avgPct > 0 ? "+" : ""}{s.seasonal.avgPct}%
                </span>{" "}
                over the last {s.seasonal.years} years ({s.seasonalAgrees ? "agrees" : "disagrees"}).
              </p>

              {/* Row 4 — levels */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-border/50 bg-background/40 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Projected</div>
                  <div className={`font-mono text-sm font-semibold ${long ? "text-success" : "text-destructive"}`}>
                    {fmt(s.target, s.pair)}
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/40 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Invalidation</div>
                  <div className="font-mono text-sm font-semibold text-foreground">{fmt(s.invalidation, s.pair)}</div>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/40 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Weekly range</div>
                  <div className="font-mono text-sm font-semibold text-foreground">±{s.expectedWeekPct.toFixed(2)}%</div>
                </div>
              </div>

              {/* Expand */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setExpanded(open ? null : s.pair)}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-border/50 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                {open ? "Hide" : "Show"} 20-month day-of-week rhythm
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
              </Button>

              {open && (
                <div className="mt-3 space-y-3">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={s.dayOfWeek} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="short" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 10,
                            fontSize: 12,
                            color: "hsl(var(--foreground))",
                          }}
                          formatter={(val: number, name) =>
                            name === "avgPct" ? [`${val}% avg move`, "Direction"] : [`${val}%`, name as string]
                          }
                        />
                        <Bar dataKey="avgPct" radius={[4, 4, 4, 4]}>
                          {s.dayOfWeek.map((d) => (
                            <Cell
                              key={d.day}
                              fill={d.avgPct >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {s.dayOfWeek.map((d) => (
                      <div key={d.day} className="rounded-lg border border-border/50 bg-background/40 p-1.5">
                        <div className="text-[10px] font-medium text-foreground">{d.short}</div>
                        <div className={`font-mono text-[11px] ${d.avgPct >= 0 ? "text-success" : "text-destructive"}`}>
                          {d.avgPct > 0 ? "+" : ""}{d.avgPct}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">{d.upRate}% up</div>
                        <div className="text-[10px] text-muted-foreground">±{d.avgRangePct}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/20 p-2.5">
                    <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Based on {s.sessions} trading days. {s.biggestMoveDay} carries the widest average range, so
                      it is the highest-volatility day to plan entries and stops around. Seasonal up-rate for{" "}
                      {s.seasonal.month}: {s.seasonal.upRate}% of the last {s.seasonal.years} years.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Projections are statistical expectations derived from CFTC positioning and historical price behaviour — not
        predictions or trade advice. Past performance never guarantees future results.
      </p>
    </div>
  );
};

export default WeeklyPlaybook;
