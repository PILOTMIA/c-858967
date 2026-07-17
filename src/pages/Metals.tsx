import COTGoldUsdComparison from "@/components/COTGoldUsdComparison";
import COTTradeMap from "@/components/COTTradeMap";
import GoldRateCorrelation from "@/components/GoldRateCorrelation";
import GoldLivePrice from "@/components/GoldLivePrice";
import GoldCOTSummary from "@/components/GoldCOTSummary";
import InterestRatesModule from "@/components/InterestRatesModule";
import AgricultureCOT from "@/components/AgricultureCOT";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const Metals = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">
          Metals & Commodities
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-2xl mx-auto">
          Gold pricing, rate correlation, institutional positioning — plus a brand-new Agriculture COT feed for the inflation story most traders miss.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <Badge className="bg-primary/15 text-primary border border-primary/30 gap-1">
            <Sparkles className="w-3 h-3" /> New: Agriculture COT (Jul 07, 2026)
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-10">
        <GoldLivePrice />
        <InterestRatesModule />
        <GoldRateCorrelation />
        <GoldCOTSummary />
        <AgricultureCOT />
        <COTGoldUsdComparison />
        <COTTradeMap />

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">How Gold Reacts to Rates</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Higher energy prices → inflation fears → interest rates rise → gold becomes less attractive (pays no interest) → gold price falls.
            Conversely, rate cuts or falling yields tend to support gold. Monitor US 10Y yields and Fed decisions for directional clues.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-1">FRED API (US10Y, FEDFUNDS)</span>
            <span className="rounded-md bg-muted px-2 py-1">Frankfurter (FX rates)</span>
            <span className="rounded-md bg-muted px-2 py-1">GDELT (News sentiment)</span>
            <span className="rounded-md bg-muted px-2 py-1">CFTC Ag Disaggregated</span>
            <span className="rounded-md bg-muted px-2 py-1">Refreshes daily 2 PM & 3 PM MST</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metals;
