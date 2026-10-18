import { useMemo } from "react";
import { CheckCircle2, XCircle, ArrowRight, Zap, Shield, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSpotMomentum } from "@/hooks/useSpotMomentum";
import { useLatestCOT, latestReportDate, type CotPosition } from "@/hooks/useLatestCOT";

import { computePairCall } from "@/lib/pairBias";
import { pairSpotBias } from "@/lib/tradeTiming";
import TradeTimingGuide from "@/components/TradeTimingGuide";

interface TradeIdea {
  pair: string;
  direction: "BUY" | "SELL" | "WAIT";
  reason: string;
  conviction: "High" | "Medium" | "Low";
  netDiff: number;
  flowAlign: boolean;
  /** price is moving against the crowded COT position */
  squeeze: boolean;
  /** price is moving against COT, but positioning is not extreme */
  conflict: boolean;
  priceBias: number;
}

const PAIR_MAP: [string, string, string][] = [
  ["EURUSD", "EUR", "USD"],
  ["GBPUSD", "GBP", "USD"],
  ["USDJPY", "USD", "JPY"],
  ["USDCAD", "USD", "CAD"],
  ["USDMXN", "USD", "MXN"],
  ["AUDUSD", "AUD", "USD"],
  ["NZDUSD", "NZD", "USD"],
  ["USDCHF", "USD", "CHF"],
  ["EURJPY", "EUR", "JPY"],
  ["GBPJPY", "GBP", "JPY"],
  ["AUDJPY", "AUD", "JPY"],
  ["EURGBP", "EUR", "GBP"],
  ["AUDNZD", "AUD", "NZD"],
  ["GBPCHF", "GBP", "CHF"],
  ["CADJPY", "CAD", "JPY"],
];

function buildIdeas(
  momentum: Record<string, number>,
  positions: Record<string, { net: number; weekly: number; reportDate: string }>,
): TradeIdea[] {
  return PAIR_MAP.map(([pair, base, quote]) => {
    const b = positions[base];
    const q = positions[quote];
    const call = computePairCall(base, quote, b ?? {}, q ?? {}, b && q && b.reportDate === q.reportDate ? pairSpotBias(base, quote, momentum) : undefined);
    const conviction: TradeIdea["conviction"] = call.direction === "WAIT" ? "Low" : call.displayConviction >= 60 ? "High" : "Medium";
    return { pair, direction: call.direction === "LONG" ? "BUY" : call.direction === "SHORT" ? "SELL" : "WAIT", reason: call.reason, conviction,
      netDiff: call.netSpread, flowAlign: call.aligned, squeeze: call.squeeze, conflict: call.conflict, priceBias: call.priceBias };
  });
}

const COTTradeThisNotThat = () => {
  const { data: spot } = useSpotMomentum();
  const { data: cot } = useLatestCOT();
  const momentum = spot?.momentum ?? {};
  const reportDate = latestReportDate(cot);

  const positions = useMemo(() => {
    const merged: Record<string, { net: number; weekly: number; reportDate: string }> = {};
    for (const [code, p] of Object.entries((cot ?? {}) as Record<string, CotPosition>)) {
      merged[code] = { net: p.net, weekly: p.weekly, reportDate: p.reportDate };
    }
    return merged;
  }, [cot]);

  const { tradeThis, notThat } = useMemo(() => {
    const ideas = buildIdeas(momentum, positions);
    const sorted = [...ideas].sort((a, b) => {
      const convScore = { High: 3, Medium: 2, Low: 1 };
      return (
        Number(b.squeeze) - Number(a.squeeze) ||
        convScore[b.conviction] - convScore[a.conviction] ||
        Math.abs(b.netDiff) - Math.abs(a.netDiff)
      );
    });

    const tradeThis = sorted.filter((i) => i.direction !== "WAIT").slice(0, 4);
    const notThat = sorted
      .filter((i) => i.direction === "WAIT")
      .slice(0, 4);

    return { tradeThis, notThat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot, positions]);

  const convictionColor = (c: string) =>
    c === "High" ? "bg-success/15 text-success border-success/30" :
    c === "Medium" ? "bg-warning/15 text-warning border-warning/30" :
    "bg-muted text-muted-foreground border-border";

  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Consider or Stand Aside</h2>
            <p className="text-sm text-muted-foreground">
              Weekly directional context, not a live entry signal; price confirmation and wait conditions come first
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Trade This */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-bold text-success text-base">Directional watchlist</span>
            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Favored</Badge>
          </div>
          <div className="space-y-3">
            {tradeThis.map((idea) => (
              <div
                key={idea.pair}
                className="group rounded-xl border border-success/15 bg-success/[0.03] p-4 transition-all hover:border-success/30 hover:bg-success/[0.06]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground text-lg">{idea.pair}</span>
                    <Badge className={`text-[10px] font-bold ${idea.direction === "BUY" ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}`}>
                      {idea.direction}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${convictionColor(idea.conviction)}`}>
                    {idea.conviction}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{idea.reason}</p>
                <TradeTimingGuide base={idea.pair.slice(0, 3)} quote={idea.pair.slice(3)} direction={idea.direction === "BUY" ? "LONG" : idea.direction === "SELL" ? "SHORT" : "WAIT"} />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {idea.squeeze ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-warning font-medium">
                      <Flame className="h-3 w-3" /> Possible squeeze — daily evidence
                    </span>
                  ) : (
                    idea.flowAlign && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                        <ArrowRight className="h-3 w-3" /> Flow aligned
                      </span>
                    )
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    1W price: {idea.priceBias > 0 ? "+" : ""}{idea.priceBias.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Net diff: {idea.netDiff > 0 ? "+" : ""}{(idea.netDiff / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Not That */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="font-bold text-destructive text-base">Stand aside</span>
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Avoid</Badge>
          </div>
          <div className="space-y-3">
            {notThat.map((idea) => (
              <div
                key={idea.pair}
                className="group rounded-xl border border-destructive/10 bg-destructive/[0.02] p-4 transition-all hover:border-destructive/20 hover:bg-destructive/[0.04]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground/70 text-lg line-through decoration-destructive/40">{idea.pair}</span>
                    <Badge className="bg-muted text-muted-foreground border-border text-[10px]">
                      {idea.direction}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${convictionColor(idea.conviction)}`}>
                    {idea.conviction}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{idea.reason}</p>
                <TradeTimingGuide base={idea.pair.slice(0, 3)} quote={idea.pair.slice(3)} direction={idea.direction === "BUY" ? "LONG" : idea.direction === "SELL" ? "SHORT" : "WAIT"} />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {idea.conflict ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-destructive/80 font-medium">
                      <Shield className="h-3 w-3" /> Price against positioning
                    </span>
                  ) : (
                    !idea.flowAlign && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-destructive/80 font-medium">
                        <Shield className="h-3 w-3" /> Flow diverging
                      </span>
                    )
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    1W price: {idea.priceBias > 0 ? "+" : ""}{idea.priceBias.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Net diff: {idea.netDiff > 0 ? "+" : ""}{(idea.netDiff / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center">
          CFTC Traders in Financial Futures{reportDate ? `, report of ${reportDate}` : ""} • Leveraged fund net positioning and weekly flow, cross-checked against ECB daily reference-rate moves • Not financial advice
        </p>
      </div>
    </div>
  );
};

export default COTTradeThisNotThat;
