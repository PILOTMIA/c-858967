import COTDetailModal from "@/components/COTDetailModal";
import COTPairAnalyzer from "@/components/COTPairAnalyzer";
import COTPairScorecard from "@/components/COTPairScorecard";
import COTTradeThisNotThat from "@/components/COTTradeThisNotThat";
import COTHistoryTrends from "@/components/COTHistoryTrends";
import SyntheticCurrencyIndex from "@/components/SyntheticCurrencyIndex";
import { COTDataProvider, useCOTData } from "@/components/COTDataContext";
import { TrendingUp, Users, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const getNote = (net: number, change: number) => {
  if (change > 5000) return net > 0 ? 'Adding longs' : 'Shorts covering';
  if (change > 0) return net > 0 ? 'Steady longs' : 'Shorts reducing';
  if (change < -5000) return net > 0 ? 'Longs reducing' : 'Deep bearish';
  return net > 0 ? 'Stable longs' : 'Flipped short';
};

const COTAnalysisContent = () => {
  const { selectedCurrency, isDetailModalOpen, setIsDetailModalOpen } = useCOTData();

  // Fetch latest two weeks from DB for WOW changes
  const { data: latestRows } = useQuery({
    queryKey: ["cot-wow"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cot_history")
        .select("currency, report_date, net_position, change_long, change_short")
        .order("report_date", { ascending: false })
        .limit(100);
      return data ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });

  // Build WOW changes from latest report date
  const dates = [...new Set(latestRows?.map((r) => r.report_date) ?? [])].sort().reverse();
  const latestDate = dates[0];
  const prevDate = dates[1];

  const wowChanges = latestRows
    ?.filter((r) => r.report_date === latestDate && !["MXN"].includes(r.currency))
    .map((r) => {
      const prev = latestRows?.find((p) => p.currency === r.currency && p.report_date === prevDate);
      const change = prev ? r.net_position - prev.net_position : (r.change_long ?? 0) - (r.change_short ?? 0);
      return {
        currency: r.currency,
        change,
        netPosition: r.net_position,
        note: getNote(r.net_position, change),
      };
    })
    .sort((a, b) => b.change - a.change) ?? [];

  const infoCards = [
    { icon: Building2, title: 'Commercial Traders', label: 'Institutions', desc: 'Banks, hedge funds, and large financial institutions', accent: 'text-primary' },
    { icon: TrendingUp, title: 'Non-Commercial', label: 'Speculators', desc: 'Large speculators and investment funds', accent: 'text-success' },
    { icon: Users, title: 'Retail Traders', label: 'Small Specs', desc: 'Individual and small institutional traders', accent: 'text-warning' },
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

        <div className="cot-readable max-w-7xl mx-auto px-4 pb-16 space-y-10">

          {/* Week-over-Week Changes Card */}
          {wowChanges.length > 0 && (
            <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display-hero text-lg font-bold text-foreground flex items-center gap-2">
                    Week-over-Week COT Changes
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    CFTC report {latestDate ? new Date(latestDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""} — Biggest movers in speculator positioning
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2">
                {wowChanges.map((item) => {
                  const isPositive = item.change > 0;
                  return (
                    <div
                      key={item.currency}
                      className={`rounded-xl p-3 border text-center transition-all hover:scale-[1.02] ${
                        isPositive
                          ? 'bg-success/5 border-success/20'
                          : 'bg-destructive/5 border-destructive/20'
                      }`}
                    >
                      <div className="font-bold text-foreground text-sm">{item.currency}</div>
                      <div className={`flex items-center justify-center gap-0.5 font-mono font-bold text-sm mt-1 ${
                        isPositive ? 'text-success' : 'text-destructive'
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{(item.change / 1000).toFixed(1)}K
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{item.note}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COT History Trend Charts */}
          <COTHistoryTrends />

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

          <COTPairScorecard />
          <COTTradeThisNotThat />
          <SyntheticCurrencyIndex />
          <COTPairAnalyzer />

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
