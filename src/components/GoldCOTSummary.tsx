import { TrendingUp, TrendingDown, ArrowRight, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GOLD_COT = {
  commercialNet: -245000,
  commercialWeekly: 12500,
  nonCommercialNet: 198000,
  nonCommercialWeekly: -8200,
  openInterest: 512000,
  openInterestChange: -14500,
};

const USD_PAIRS_IMPACT = [
  { pair: "EURUSD", net: 11594, weekly: -8723, goldImpact: "EUR longs trimmed → mild USD support → headwind for gold" },
  { pair: "USDJPY", net: -75802, weekly: -7305, goldImpact: "JPY shorts deepened → risk-on → mixed for gold" },
  { pair: "USDCAD", net: -53828, weekly: 10387, goldImpact: "CAD shorts covered → energy rebound → inflation read for gold" },
  { pair: "AUDUSD", net: 47855, weekly: -470, goldImpact: "AUD longs steady → commodity demand intact → supportive gold" },
];

const GoldCOTSummary = () => {
  const specsBullish = GOLD_COT.nonCommercialNet > 0;
  const commercialHedging = GOLD_COT.commercialNet < -200000;

  return (
    <Card className="rounded-2xl border border-warning/20 bg-card shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-warning/[0.06] to-transparent">
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <span className="text-2xl">🥇</span>
          Gold COT Positioning & USD Pair Impact
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How institutional gold positioning and USD-pair flows affect XAUUSD direction
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Gold COT metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Shield className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Specs Net</p>
            <p className={`text-xl font-bold mt-1 ${specsBullish ? "text-success" : "text-destructive"}`}>
              {(GOLD_COT.nonCommercialNet / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Zap className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Specs Weekly</p>
            <p className={`text-xl font-bold mt-1 ${GOLD_COT.nonCommercialWeekly >= 0 ? "text-success" : "text-destructive"}`}>
              {GOLD_COT.nonCommercialWeekly > 0 ? "+" : ""}{(GOLD_COT.nonCommercialWeekly / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <Shield className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comm. Net</p>
            <p className="text-xl font-bold mt-1 text-destructive">{(GOLD_COT.commercialNet / 1000).toFixed(0)}K</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 text-center">
            <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Open Interest</p>
            <p className="text-xl font-bold mt-1 text-foreground">{(GOLD_COT.openInterest / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Signal */}
        <div className={`rounded-xl p-4 border ${specsBullish ? "border-success/20 bg-success/[0.04]" : "border-destructive/20 bg-destructive/[0.04]"}`}>
          <div className="flex items-center gap-2 mb-2">
            {specsBullish ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            <span className={`text-lg font-bold ${specsBullish ? "text-success" : "text-destructive"}`}>
              {specsBullish ? "Speculators remain BULLISH gold" : "Speculators turning BEARISH gold"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {commercialHedging
              ? "Commercials are heavily short (hedging producers). This is typical in bull markets — not a reversal signal on its own."
              : "Commercial hedging is moderate. Watch for spikes in commercial shorts as a contrarian signal."}
          </p>
        </div>

        {/* USD Pair impact table */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            How USD Pair Flows Affect Gold
          </h3>
          <div className="space-y-2">
            {USD_PAIRS_IMPACT.map((item) => (
              <div key={item.pair} className="rounded-lg border border-border bg-background p-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <span className="font-bold text-foreground text-sm">{item.pair}</span>
                  <Badge variant="outline" className={`text-[10px] ${item.weekly >= 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"}`}>
                    {item.weekly > 0 ? "+" : ""}{(item.weekly / 1000).toFixed(1)}K
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.goldImpact}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
          Source: CFTC Disaggregated & Legacy Reports • Gold futures (COMEX) • Not financial advice
        </div>
      </CardContent>
    </Card>
  );
};

export default GoldCOTSummary;
