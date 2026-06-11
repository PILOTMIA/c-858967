import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Flame, Target, Sparkles } from "lucide-react";

// Tradeable pairs we recommend (majors + key crosses)
const PAIR_UNIVERSE: { base: string; quote: string }[] = [
  { base: "EUR", quote: "USD" },
  { base: "GBP", quote: "USD" },
  { base: "AUD", quote: "USD" },
  { base: "NZD", quote: "USD" },
  { base: "USD", quote: "JPY" },
  { base: "USD", quote: "CHF" },
  { base: "USD", quote: "CAD" },
  { base: "EUR", quote: "JPY" },
  { base: "GBP", quote: "JPY" },
  { base: "AUD", quote: "JPY" },
  { base: "EUR", quote: "GBP" },
  { base: "AUD", quote: "NZD" },
  { base: "EUR", quote: "AUD" },
  { base: "GBP", quote: "AUD" },
];

interface HistoryRow {
  currency: string;
  report_date: string;
  net_position: number;
  long_positions: number;
  short_positions: number;
}

const fmt = (v: number) => {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toFixed(0);
};

const COTTradeRecommendations = () => {
  const { data: history } = useQuery({
    queryKey: ["cot-history-recos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cot_history")
        .select("currency, report_date, net_position, long_positions, short_positions")
        .order("report_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as HistoryRow[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const recommendations = useMemo(() => {
    if (!history?.length) return [];

    const dates = [...new Set(history.map((r) => r.report_date))].sort().reverse();
    const latest = dates[0];
    const prior = dates[1];
    if (!latest) return [];

    const byCurrencyLatest = new Map(history.filter((r) => r.report_date === latest).map((r) => [r.currency, r]));
    const byCurrencyPrior = new Map(history.filter((r) => r.report_date === prior).map((r) => [r.currency, r]));

    const usd = { net_position: 0 } as any;

    return PAIR_UNIVERSE.map(({ base, quote }) => {
      const b = base === "USD" ? usd : byCurrencyLatest.get(base);
      const q = quote === "USD" ? usd : byCurrencyLatest.get(quote);
      if (!b || !q) return null;

      const bPrior = base === "USD" ? usd : byCurrencyPrior.get(base);
      const qPrior = quote === "USD" ? usd : byCurrencyPrior.get(quote);

      const netSpread = (b.net_position ?? 0) - (q.net_position ?? 0);
      const baseFlow = bPrior ? (b.net_position ?? 0) - (bPrior.net_position ?? 0) : 0;
      const quoteFlow = qPrior ? (q.net_position ?? 0) - (qPrior.net_position ?? 0) : 0;
      const flowSpread = baseFlow - quoteFlow;

      // Conviction: pure positioning (60%) + recent flow alignment (40%), normalized
      const positionScore = Math.max(-100, Math.min(100, (netSpread / 150000) * 100));
      const flowScore = Math.max(-100, Math.min(100, (flowSpread / 30000) * 100));
      const conviction = positionScore * 0.6 + flowScore * 0.4;

      // Aligned = position and flow agree → highest conviction
      const aligned = Math.sign(positionScore) === Math.sign(flowScore) && Math.abs(positionScore) > 5;

      const direction: "LONG" | "SHORT" | "WAIT" =
        Math.abs(conviction) < 8 ? "WAIT" : conviction > 0 ? "LONG" : "SHORT";

      return {
        pair: `${base}${quote}`,
        base,
        quote,
        direction,
        conviction: Math.abs(conviction),
        signedConviction: conviction,
        netSpread,
        flowSpread,
        aligned,
      };
    })
      .filter((x): x is NonNullable<typeof x> => !!x)
      .sort((a, b) => b.conviction - a.conviction);
  }, [history]);

  const top = recommendations.filter((r) => r.direction !== "WAIT").slice(0, 6);
  const wait = recommendations.filter((r) => r.direction === "WAIT").slice(0, 4);

  return (
    <Card className="border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/[0.06] via-transparent to-success/[0.06]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            What to Trade — Smart Money Edge
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-border/50 text-foreground/80">
            <Sparkles className="w-3 h-3 mr-1" />
            Ranked by COT positioning + flow
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Pairs ranked by net institutional position spread and week-over-week flow alignment. Higher conviction = stronger institutional consensus.
        </p>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading COT history…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {top.map((r, i) => {
              const isLong = r.direction === "LONG";
              return (
                <div
                  key={r.pair}
                  className={`relative rounded-xl border p-4 transition-all hover:scale-[1.01] ${
                    isLong
                      ? "border-success/30 bg-gradient-to-br from-success/[0.08] to-success/[0.02]"
                      : "border-destructive/30 bg-gradient-to-br from-destructive/[0.08] to-destructive/[0.02]"
                  }`}
                >
                  {/* Rank badge */}
                  <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shadow-md">
                    #{i + 1}
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-display-hero text-foreground tracking-tight">{r.pair}</span>
                        {r.aligned && (
                          <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px] gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            Aligned
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {r.base} <ArrowRight className="inline w-2.5 h-2.5" /> {r.quote}
                      </div>
                    </div>
                    <Badge
                      className={`gap-1 font-bold ${
                        isLong
                          ? "bg-success/20 text-success border-success/40"
                          : "bg-destructive/20 text-destructive border-destructive/40"
                      }`}
                    >
                      {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {r.direction}
                    </Badge>
                  </div>

                  {/* Conviction bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-foreground/70 font-medium uppercase tracking-wider">Conviction</span>
                      <span className={`font-mono font-bold ${isLong ? "text-success" : "text-destructive"}`}>
                        {r.conviction.toFixed(0)}/100
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isLong ? "bg-success" : "bg-destructive"}`}
                        style={{ width: `${Math.min(100, r.conviction)}%` }}
                      />
                    </div>
                  </div>

                  {/* Detail row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/30">
                    <div>
                      <div className="text-[9px] text-foreground/60 uppercase tracking-wider">Net Spread</div>
                      <div className={`text-sm font-mono font-bold ${r.netSpread >= 0 ? "text-success" : "text-destructive"}`}>
                        {r.netSpread >= 0 ? "+" : ""}{fmt(r.netSpread)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-foreground/60 uppercase tracking-wider">Weekly Flow</div>
                      <div className={`text-sm font-mono font-bold ${r.flowSpread >= 0 ? "text-success" : "text-destructive"}`}>
                        {r.flowSpread >= 0 ? "+" : ""}{fmt(r.flowSpread)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {wait.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Avoid / No Edge — institutional positioning is mixed
            </div>
            <div className="flex flex-wrap gap-2">
              {wait.map((r) => (
                <Badge key={r.pair} variant="outline" className="border-border/50 text-foreground/70 text-xs">
                  {r.pair} • neutral
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/30">
          Source: CFTC Non-Commercial Positions • Updated weekly • Conviction = position spread (60%) + weekly flow alignment (40%) • Educational only
        </p>
      </CardContent>
    </Card>
  );
};

export default COTTradeRecommendations;
