import { useMemo } from "react";
import { CheckCircle2, XCircle, ArrowRight, Zap, Shield, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSpotMomentum, squeezeCheck } from "@/hooks/useSpotMomentum";
import { useLatestCOT, latestReportDate, type CotPosition } from "@/hooks/useLatestCOT";

/** Used only until the stored CFTC report loads. */
const FALLBACK_POSITIONS: Record<string, { net: number; weekly: number }> = {
  EUR: { net: -38173, weekly: 186 },
  GBP: { net: 43167, weekly: -4742 },
  JPY: { net: -102188, weekly: -25146 },
  CAD: { net: -68750, weekly: 3342 },
  AUD: { net: 49662, weekly: -4399 },
  NZD: { net: -22338, weekly: 9656 },
  CHF: { net: -10298, weekly: -1473 },
  USD: { net: 7133, weekly: -2056 },
};

interface TradeIdea {
  pair: string;
  direction: "BUY" | "SELL";
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
  positions: Record<string, { net: number; weekly: number }>,
): TradeIdea[] {
  return PAIR_MAP.map(([pair, base, quote]) => {
    const b = positions[base] ?? { net: 0, weekly: 0 };
    const q = positions[quote] ?? { net: 0, weekly: 0 };
    const netDiff = b.net - q.net;
    const flowDiff = b.weekly - q.weekly;
    const absNet = Math.abs(netDiff);

    // Live price bias for the pair: base strength minus quote strength (last ~5 sessions)
    const priceBias = (momentum[base] ?? 0) - (momentum[quote] ?? 0);
    const { conflict, squeeze } = squeezeCheck(netDiff, priceBias);

    // When crowded positioning is being run over by price, follow price, not the crowd.
    const bullish = squeeze ? priceBias > 0 : netDiff > 0;
    const flowAlign = squeeze ? true : netDiff > 0 ? flowDiff > 0 : flowDiff < 0;

    const conviction: "High" | "Medium" | "Low" = squeeze
      ? "High"
      : conflict
      ? "Low"
      : absNet > 60000 && flowAlign
      ? "High"
      : absNet > 20000
      ? "Medium"
      : "Low";

    const direction: "BUY" | "SELL" = bullish ? "BUY" : "SELL";
    const crowdSide = netDiff > 0 ? base : quote;
    const squeezedSide = netDiff > 0 ? quote : base;

    const reason = squeeze
      ? `Crowded ${crowdSide} longs are being squeezed — ${squeezedSide} has gained ${Math.abs(priceBias).toFixed(2)}% in the last week while positioning still sits ${(absNet / 1000).toFixed(0)}K the other way`
      : conflict
      ? `Positioning favours ${netDiff > 0 ? base : quote}, but price is moving ${Math.abs(priceBias).toFixed(2)}% the other way — no clean edge`
      : netDiff > 0
      ? `${base} net longs dominate over ${quote} by ${(absNet / 1000).toFixed(0)}K contracts`
      : `${quote} net longs dominate over ${base} by ${(absNet / 1000).toFixed(0)}K contracts`;

    return { pair, direction, reason, conviction, netDiff, flowAlign, squeeze, conflict, priceBias };
  });
}

const COTTradeThisNotThat = () => {
  const { data: spot } = useSpotMomentum();
  const { data: cot } = useLatestCOT();
  const momentum = spot?.momentum ?? {};
  const reportDate = latestReportDate(cot);

  const positions = useMemo(() => {
    const merged: Record<string, { net: number; weekly: number }> = { ...FALLBACK_POSITIONS };
    for (const [code, p] of Object.entries((cot ?? {}) as Record<string, CotPosition>)) {
      merged[code] = { net: p.net, weekly: p.weekly };
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

    const tradeThis = sorted.filter((i) => i.conviction !== "Low").slice(0, 4);
    const notThat = sorted
      .filter((i) => !i.squeeze && (i.conviction === "Low" || i.conflict || !i.flowAlign))
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
            <h2 className="text-xl font-bold text-foreground">Trade This, Not That</h2>
            <p className="text-sm text-muted-foreground">
              COT positioning checked against live price — when a crowded position is moving the wrong way, we follow price
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Trade This */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="font-bold text-success text-base">Trade This</span>
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
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {idea.squeeze ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-warning font-medium">
                      <Flame className="h-3 w-3" /> Short squeeze — price leads
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
            <span className="font-bold text-destructive text-base">Not That</span>
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
          CFTC Traders in Financial Futures{reportDate ? `, report of ${reportDate}` : ""} • Leveraged fund net positioning and weekly flow, cross-checked against live ECB spot moves • Not financial advice
        </p>
      </div>
    </div>
  );
};

export default COTTradeThisNotThat;
