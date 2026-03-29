import COTData from "@/components/COTData";
import COTCommodityData from "@/components/COTCommodityData";
import COTDetailModal from "@/components/COTDetailModal";
import COTPairAnalyzer from "@/components/COTPairAnalyzer";
import { COTDataProvider, useCOTData } from "@/components/COTDataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Building2 } from "lucide-react";

const COTAnalysisContent = () => {
  const { selectedCurrency, isDetailModalOpen, setIsDetailModalOpen } = useCOTData();

  const infoCards = [
    { icon: Building2, title: 'Commercial Traders', label: 'Institutions', desc: 'Banks, hedge funds, and large financial institutions', accent: 'text-primary' },
    { icon: TrendingUp, title: 'Non-Commercial', label: 'Speculators', desc: 'Large speculators and investment funds', accent: 'text-emerald-400' },
    { icon: Users, title: 'Retail Traders', label: 'Small Specs', desc: 'Individual and small institutional traders', accent: 'text-amber-400' },
  ];

  const educationItems = [
    { title: 'Commercial Traders (Smart Money)', text: 'These are the institutions that actually need the currencies for business purposes. When they\'re heavily positioned one way, it often indicates the underlying fundamentals.' },
    { title: 'Non-Commercial (Large Specs)', text: 'Large speculative traders often drive short-term price movements. Extreme positioning can signal potential reversals.' },
    { title: 'Net Positioning', text: 'The difference between long and short positions shows overall market sentiment. Extreme readings often precede trend changes.' },
    { title: 'Weekly Changes', text: 'Look for significant changes in positioning week-over-week to identify shifts in market sentiment before they show up in price.' },
  ];

  return (
    <>
      <COTDetailModal open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} data={selectedCurrency} />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="px-4 pt-12 pb-8 text-center">
          <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">COT Analysis</h1>
          <p className="text-muted-foreground text-base sm:text-lg font-light max-w-2xl mx-auto">
            Commitment of Traders data — insights into institutional and retail positioning
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-16 space-y-10">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {infoCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className={`text-2xl font-bold ${card.accent} mb-1`}>{card.label}</div>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              );
            })}
          </div>

          <COTPairAnalyzer />
          <COTData />
          <COTCommodityData />

          {/* Educational Section */}
          <div className="rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm p-8 sm:p-10">
            <h2 className="font-display-hero text-2xl sm:text-3xl font-bold text-foreground mb-2">Understanding COT Data</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Learn how to interpret Commitment of Traders reports for better trading decisions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {educationItems.map((item) => (
                <div key={item.title}>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MidasFX Banner */}
          <div className="flex justify-center">
            <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity duration-500">
              <img src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" alt="MidasFX Trading" className="rounded-xl max-w-[468px]" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const COTAnalysis = () => (
  <COTDataProvider>
    <COTAnalysisContent />
  </COTDataProvider>
);

export default COTAnalysis;
