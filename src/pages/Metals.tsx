import COTGoldUsdComparison from "@/components/COTGoldUsdComparison";
import COTTradeMap from "@/components/COTTradeMap";
import GoldRateCorrelation from "@/components/GoldRateCorrelation";
import GoldLivePrice from "@/components/GoldLivePrice";
import GoldCOTSummary from "@/components/GoldCOTSummary";
import InterestRatesModule from "@/components/InterestRatesModule";
import AgricultureCOT from "@/components/AgricultureCOT";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import COTFreshnessBadge from "@/components/COTFreshnessBadge";

const Metals = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="hq-page space-y-8">
        <PageHeader eyebrow="Cross-asset desk" title="Metals & Commodities" subtitle="Gold pricing, rate correlation and verified institutional positioning across metals, energy and agriculture." actions={<div className="flex flex-wrap gap-2"><COTFreshnessBadge /><Badge className="gap-1 border border-primary/30 bg-primary/15 text-primary"><Sparkles className="h-3 w-3" /> Agriculture live</Badge></div>} />
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
