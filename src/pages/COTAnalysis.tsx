import COTDetailModal from "@/components/COTDetailModal";
import COTPairAnalyzer from "@/components/COTPairAnalyzer";
import COTPairScorecard from "@/components/COTPairScorecard";
import COTTradeThisNotThat from "@/components/COTTradeThisNotThat";
import SyntheticCurrencyIndex from "@/components/SyntheticCurrencyIndex";
import { COTDataProvider, useCOTData } from "@/components/COTDataContext";
import { COTDataProvider, useCOTData } from "@/components/COTDataContext";
import { TrendingUp, Users, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from "recharts";

// Week-over-week COT changes from CFTC report May 5, 2026 (as of April 28)
const WOW_CHANGES = [
  { currency: 'CAD', flag: '🇨🇦', change: 10387, netPosition: -53828, note: 'Shorts covering' },
  { currency: 'MXN', flag: '🇲🇽', change: 3969, netPosition: 49189, note: 'Adding longs' },
  { currency: 'NZD', flag: '🇳🇿', change: 1229, netPosition: -16833, note: 'Shorts reducing' },
  { currency: 'GBP', flag: '🇬🇧', change: -255, netPosition: 28882, note: 'Stable longs' },
  { currency: 'AUD', flag: '🇦🇺', change: -470, netPosition: 47855, note: 'Steady longs' },
  { currency: 'CHF', flag: '🇨🇭', change: -1408, netPosition: -5174, note: 'Flipped short' },
  { currency: 'JPY', flag: '🇯🇵', change: -7305, netPosition: -75802, note: 'Deep bearish' },
  { currency: 'EUR', flag: '🇪🇺', change: -8723, netPosition: 11594, note: 'Longs reducing' },
].sort((a, b) => b.change - a.change);

// Historical data for bar chart (net position over 4 weeks)
const HISTORICAL_BAR_DATA = [
  { currency: 'EUR', mar24: -13538, mar31: 3947, apr28: 11594, flag: '🇪🇺' },
  { currency: 'GBP', mar24: 15716, mar31: 29932, apr28: 28882, flag: '🇬🇧' },
  { currency: 'AUD', mar24: 49145, mar31: 52569, apr28: 47855, flag: '🇦🇺' },
  { currency: 'MXN', mar24: 54787, mar31: 52803, apr28: 49189, flag: '🇲🇽' },
  { currency: 'CHF', mar24: 235, mar31: 1490, apr28: -5174, flag: '🇨🇭' },
  { currency: 'NZD', mar24: -16730, mar31: -17798, apr28: -16833, flag: '🇳🇿' },
  { currency: 'CAD', mar24: -31700, mar31: -42910, apr28: -53828, flag: '🇨🇦' },
  { currency: 'JPY', mar24: -54852, mar31: -46182, apr28: -75802, flag: '🇯🇵' },
];

const COTAnalysisContent = () => {
  const { selectedCurrency, isDetailModalOpen, setIsDetailModalOpen } = useCOTData();

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
          <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display-hero text-lg font-bold text-foreground flex items-center gap-2">
                  📊 Week-over-Week COT Changes
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">CFTC report May 5, 2026 • Biggest movers in leveraged fund positioning</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {WOW_CHANGES.map((item) => {
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
                    <div className="text-lg mb-0.5">{item.flag}</div>
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

          {/* Positioning Over Time Bar Chart */}
          <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
            <h2 className="font-display-hero text-lg font-bold text-foreground flex items-center gap-2 mb-1">
              📈 Positioning Changes Over Time
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Leveraged fund net positions — March 24 vs April 28, 2026</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={HISTORICAL_BAR_DATA} barGap={2} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="currency" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name === 'mar24' ? 'Mar 24' : name === 'mar31' ? 'Mar 31' : 'Apr 28']}
                />
                <Bar dataKey="mar24" name="Mar 24" fill="hsl(var(--muted-foreground))" radius={[2,2,0,0]} opacity={0.4} />
                <Bar dataKey="mar31" name="Mar 31" fill="hsl(var(--chart-4))" radius={[2,2,0,0]} opacity={0.6} />
                <Bar dataKey="apr28" name="Apr 28" radius={[3,3,0,0]}>
                  {HISTORICAL_BAR_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.apr28 >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Source: CFTC Disaggregated Report — Leveraged Funds</p>
          </div>

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
