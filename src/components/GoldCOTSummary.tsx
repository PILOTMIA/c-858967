import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, ArrowRight, Shield, Zap, Sparkles, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface XauRow {
  report_date: string;
  long_positions: number;
  short_positions: number;
  net_position: number;
  change_long: number | null;
  change_short: number | null;
}

const USD_PAIRS_IMPACT = [
  { pair: "EURUSD", goldImpact: "EUR strength → USD weakness → tailwind for gold" },
  { pair: "USDJPY", goldImpact: "JPY shorts deepen → risk-on → mixed for gold" },
  { pair: "USDCAD", goldImpact: "CAD covers → energy rebound → inflation read for gold" },
  { pair: "AUDUSD", goldImpact: "AUD longs steady → commodity demand intact → supportive gold" },
];

const fmt = (v: number) => {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toFixed(0);
};

const GoldCOTSummary = () => {
  const { data: history, dataUpdatedAt } = useQuery({
    queryKey: ["xau-cot-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cot_history")
        .select("report_date, long_positions, short_positions, net_position, change_long, change_short")
        .eq("currency", "XAU")
        .order("report_date", { ascending: true })
        .limit(52);
      if (error) throw error;
      return (data ?? []) as XauRow[];
    },
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 60 * 6,
  });

  const latest = history?.[history.length - 1];
  const prior = history?.[history.length - 2];
  const trend = (history ?? []).slice(-12).map((r) => ({
    label: new Date(r.report_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    net: r.net_position,
    long: r.long_positions,
    short: r.short_positions,
  }));

  const specsNet = latest?.net_position ?? 0;
  const specsBullish = specsNet > 0;
  const weeklyChange = latest && prior ? specsNet - prior.net_position : (latest?.change_long ?? 0) - (latest?.change_short ?? 0);
  const longChange = latest?.change_long ?? 0;
  const shortChange = latest?.change_short ?? 0;
  const totalContracts = (latest?.long_positions ?? 0) + (latest?.short_positions ?? 0);
  const longPct = totalContracts > 0 ? ((latest!.long_positions / totalContracts) * 100) : 0;
  const shortPct = 100 - longPct;

  return (
    <Card className="relative rounded-2xl border border-warning/25 bg-gradient-to-br from-warning/[0.05] via-card/30 to-card/40 backdrop-blur-md shadow-sm overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle at 80% 0%, hsl(45 93% 47% / 0.18), transparent 55%)" }}
      />
      <CardHeader className="relative">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning" />
              Gold (XAU) — Institutional Positioning
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              CFTC speculator positioning in COMEX gold futures, weekly trend, and how USD pair flows shape XAUUSD direction.
            </p>
          </div>
          {dataUpdatedAt > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {new Date(dataUpdatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5 pt-0">
        {/* Hero stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`rounded-xl border p-4 ${specsBullish ? "border-success/30 bg-success/[0.06]" : "border-destructive/30 bg-destructive/[0.06]"}`}>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-foreground/70" />
              <p className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold">Specs Net</p>
            </div>
            <p className={`text-2xl font-bold font-mono mt-1 ${specsBullish ? "text-success" : "text-destructive"}`}>
              {specsNet >= 0 ? "+" : ""}{fmt(specsNet)}
            </p>
            <p className="text-[10px] text-foreground/60 mt-1">{specsBullish ? "Net Long" : "Net Short"} positioning</p>
          </div>

          <div className="rounded-xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-foreground/70" />
              <p className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold">Weekly Δ</p>
            </div>
            <p className={`text-2xl font-bold font-mono mt-1 ${weeklyChange >= 0 ? "text-success" : "text-destructive"}`}>
              {weeklyChange >= 0 ? "+" : ""}{fmt(weeklyChange)}
            </p>
            <p className="text-[10px] text-foreground/60 mt-1">vs. prior report</p>
          </div>

          <div className="rounded-xl border border-success/25 bg-success/[0.04] p-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <p className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold">Longs</p>
            </div>
            <p className="text-2xl font-bold font-mono mt-1 text-success">{fmt(latest?.long_positions ?? 0)}</p>
            <p className={`text-[10px] mt-1 font-mono ${longChange >= 0 ? "text-success" : "text-destructive"}`}>
              {longChange >= 0 ? "▲ +" : "▼ "}{fmt(longChange)} contracts
            </p>
          </div>

          <div className="rounded-xl border border-destructive/25 bg-destructive/[0.04] p-4">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              <p className="text-[10px] uppercase tracking-wider text-foreground/70 font-semibold">Shorts</p>
            </div>
            <p className="text-2xl font-bold font-mono mt-1 text-destructive">{fmt(latest?.short_positions ?? 0)}</p>
            <p className={`text-[10px] mt-1 font-mono ${shortChange <= 0 ? "text-success" : "text-destructive"}`}>
              {shortChange >= 0 ? "▲ +" : "▼ "}{fmt(shortChange)} contracts
            </p>
          </div>
        </div>

        {/* Long/Short share bar */}
        {totalContracts > 0 && (
          <div className="rounded-xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">Long vs Short Share</span>
              <span className="text-[10px] text-muted-foreground">{fmt(totalContracts)} total contracts</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex">
              <div className="bg-gradient-to-r from-success to-success/80 flex items-center justify-end pr-2 text-[10px] font-bold text-success-foreground" style={{ width: `${longPct}%` }}>
                {longPct >= 12 && `${longPct.toFixed(0)}%`}
              </div>
              <div className="bg-gradient-to-r from-destructive/80 to-destructive flex items-center justify-start pl-2 text-[10px] font-bold text-destructive-foreground" style={{ width: `${shortPct}%` }}>
                {shortPct >= 12 && `${shortPct.toFixed(0)}%`}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-success font-semibold">{longPct.toFixed(1)}% Long</span>
              <span className="text-[10px] text-destructive font-semibold">{shortPct.toFixed(1)}% Short</span>
            </div>
          </div>
        )}

        {/* 12-week net position trend */}
        {trend.length > 1 && (
          <div className="rounded-xl border border-border/40 bg-background/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-warning" />
                Net Position Trend — Last {trend.length} Reports
              </h3>
              <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">CFTC Weekly</Badge>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldNetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(45 93% 47%)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(45 93% 47%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} tickFormatter={fmt} />
                  <ReferenceLine y={0} stroke="hsl(var(--foreground))" strokeOpacity={0.3} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      color: "hsl(var(--foreground))",
                      fontSize: 11,
                    }}
                    formatter={(value: number, name: string) => [fmt(value), name === "net" ? "Net Position" : name]}
                  />
                  <Area type="monotone" dataKey="net" stroke="hsl(45 93% 47%)" strokeWidth={2.5} fill="url(#goldNetGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Signal */}
        <div className={`rounded-xl p-4 border ${specsBullish ? "border-success/25 bg-success/[0.05]" : "border-destructive/25 bg-destructive/[0.05]"}`}>
          <div className="flex items-center gap-2 mb-2">
            {specsBullish ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            <span className={`text-base font-bold ${specsBullish ? "text-success" : "text-destructive"}`}>
              {specsBullish ? "Speculators are NET LONG gold" : "Speculators are NET SHORT gold"}
            </span>
            <Badge className={specsBullish ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}>
              {weeklyChange >= 0 ? "Conviction Building" : "Position Trimming"}
            </Badge>
          </div>
          <p className="text-sm text-foreground/80">
            {specsBullish
              ? "Large speculators continue to favor gold as a hedge against rate cuts and USD weakness. Watch for extreme readings as a contrarian reversal signal."
              : "Speculators have flipped bearish on gold — typically aligned with rising real yields or USD strength. Monitor for capitulation lows."}
          </p>
        </div>

        {/* USD Pair impact table */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            How USD Pair Flows Affect Gold
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {USD_PAIRS_IMPACT.map((item) => (
              <div key={item.pair} className="rounded-lg border border-border/40 bg-background/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground text-sm">{item.pair}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.goldImpact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/30">
          Source: CFTC Disaggregated & Legacy Reports • Gold futures (COMEX) • Auto-refreshes daily • Educational only — not financial advice
        </div>
      </CardContent>
    </Card>
  );
};

export default GoldCOTSummary;
