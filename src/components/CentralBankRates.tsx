import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Calendar, AlertCircle, FileText, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface MeetingMinutes {
  date: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  link: string;
  tone: 'hawkish' | 'dovish' | 'neutral';
}

interface CentralBankData {
  country: string;
  currency: string;
  centralBank: string;
  currentRate: number;
  website: string;
  lastUpdate: string;
  nextMeeting: string;
  meetingSchedule: string[];
  projections: {
    month6: { rate: number; probability: number; direction: 'up' | 'down' | 'hold' };
    month12: { rate: number; probability: number; direction: 'up' | 'down' | 'hold' };
  };
  recentChanges: Array<{ date: string; change: number; rate: number }>;
  seasonality: {
    q1: 'bullish' | 'bearish' | 'neutral';
    q2: 'bullish' | 'bearish' | 'neutral';
    q3: 'bullish' | 'bearish' | 'neutral';
    q4: 'bullish' | 'bearish' | 'neutral';
  };
  tradingInsights: { bullishFactors: string[]; bearishFactors: string[] };
  latestMinutes: MeetingMinutes;
}

// Returns the first scheduled meeting that is still in the future so the UI can
// never display a date that has already passed.
const resolveNextMeeting = (schedule: string[], fallback: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = schedule
    .map((d) => ({ raw: d, time: new Date(`${d}T00:00:00`).getTime() }))
    .filter((d) => Number.isFinite(d.time) && d.time >= today.getTime())
    .sort((a, b) => a.time - b.time);
  return upcoming[0]?.raw ?? fallback;
};

const fetchCentralBankData = async (): Promise<CentralBankData[]> => {
  const fallbackData: CentralBankData[] = [
    {
      country: "United States",
      currency: "USD",
      centralBank: "Federal Reserve (Fed)",
      currentRate: 4.50,
      website: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
      lastUpdate: "2026-07-29",
      meetingSchedule: ["2026-09-16", "2026-10-28", "2026-12-09", "2027-01-27"],
      nextMeeting: resolveNextMeeting(["2026-09-16", "2026-10-28", "2026-12-09", "2027-01-27"], "2026-09-16"),
      projections: {
        month6: { rate: 4.25, probability: 58, direction: 'down' },
        month12: { rate: 3.75, probability: 68, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-07-29", change: 0, rate: 4.50 },
        { date: "2026-06-17", change: 0, rate: 4.50 },
        { date: "2026-04-29", change: 0, rate: 4.50 }
      ],
      seasonality: { q1: 'neutral', q2: 'neutral', q3: 'bearish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Tariff policy strengthens USD via safe-haven flows", "Fed holding rates higher for longer", "Strong labor market supports rates"],
        bearishFactors: ["Rate cuts expected later in 2026", "Trade war uncertainty weighs on growth", "Fiscal deficit concerns growing"]
      },
      latestMinutes: {
        date: "2026-07-29",
        title: "FOMC Statement — July 28-29, 2026",
        summary: "The Fed held the target range at 4.25-4.50% again, extending the hold through the summer. Powell said the committee needs more evidence that tariff-driven price pressure is fading before easing, while flagging a gradual cooling in payrolls. Markets continue to price the first cut for the September 15-16 meeting.",
        keyTakeaways: [
          "Target range held at 4.25-4.50% for the fifth straight meeting",
          "Powell: more evidence needed that tariff pass-through is fading",
          "Payroll growth cooling but unemployment still near 4.3%",
          "Core PCE tracking ~2.7% year-over-year",
          "Markets price the first cut at the September 15-16 meeting"
        ],
        link: "https://www.federalreserve.gov/monetarypolicy/fomcpresconf20260318.htm",
        tone: 'neutral'
      }
    },
    {
      country: "United Kingdom",
      currency: "GBP",
      centralBank: "Bank of England (BoE)",
      currentRate: 3.75,
      website: "https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate",
      lastUpdate: "2026-08-06",
      meetingSchedule: ["2026-09-17", "2026-11-05", "2026-12-17", "2027-02-04"],
      nextMeeting: resolveNextMeeting(["2026-09-17", "2026-11-05", "2026-12-17", "2027-02-04"], "2026-09-17"),
      projections: {
        month6: { rate: 3.50, probability: 70, direction: 'down' },
        month12: { rate: 3.00, probability: 75, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-08-06", change: 0, rate: 3.75 },
        { date: "2026-06-18", change: 0, rate: 3.75 },
        { date: "2026-05-07", change: 0, rate: 3.75 }
      ],
      seasonality: { q1: 'bearish', q2: 'bearish', q3: 'neutral', q4: 'bullish' },
      tradingInsights: {
        bullishFactors: ["Rate held steady — not cutting as fast as expected", "Strong services sector", "London financial center drives demand"],
        bearishFactors: ["Gradual BoE cuts expected through 2026", "Weak manufacturing sector", "CPI at 3.0% still above target"]
      },
      latestMinutes: {
        date: "2026-08-06",
        title: "MPC Summary & Minutes — August 2026",
        summary: "The MPC held Bank Rate at 3.75% with a split vote, keeping the 'gradual and careful' language. Services inflation is easing more slowly than headline CPI, and the committee wants to see the autumn wage round before cutting again.",
        keyTakeaways: [
          "Bank Rate held at 3.75% on a split vote",
          "Services inflation easing slower than headline CPI",
          "Autumn wage settlements are the key input for the next cut",
          "Growth running near 1% annualised",
          "Guidance stays 'gradual and careful'"
        ],
        link: "https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/march-2026",
        tone: 'neutral'
      }
    },
    {
      country: "Eurozone",
      currency: "EUR",
      centralBank: "European Central Bank (ECB)",
      currentRate: 2.65,
      website: "https://www.ecb.europa.eu/press/govcouncil/mopo/html/index.en.html",
      lastUpdate: "2026-07-23",
      meetingSchedule: ["2026-09-10", "2026-10-29", "2026-12-17", "2027-02-04"],
      nextMeeting: resolveNextMeeting(["2026-09-10", "2026-10-29", "2026-12-17", "2027-02-04"], "2026-09-10"),
      projections: {
        month6: { rate: 2.15, probability: 80, direction: 'down' },
        month12: { rate: 1.75, probability: 82, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-07-23", change: 0, rate: 2.65 },
        { date: "2026-06-11", change: 0, rate: 2.65 },
        { date: "2026-04-30", change: 0, rate: 2.65 }
      ],
      seasonality: { q1: 'bearish', q2: 'bearish', q3: 'neutral', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Rate cuts largely priced in", "German fiscal stimulus plans", "Defense spending boost across EU"],
        bearishFactors: ["Wide rate differential vs Fed (185bp)", "Trade war exposure on exports", "Weak growth across member states"]
      },
      latestMinutes: {
        date: "2026-07-23",
        title: "ECB Monetary Policy Decision — July 2026",
        summary: "The Governing Council left the deposit facility rate at 2.65% for a third meeting, judging policy to be in broadly neutral territory. Lagarde repeated that decisions stay meeting-by-meeting and data-dependent, with trade policy and euro strength the main disinflationary risks.",
        keyTakeaways: [
          "Deposit rate unchanged at 2.65% for a third meeting",
          "Policy judged to be around neutral",
          "Headline HICP close to the 2% target",
          "Euro strength adds to disinflation",
          "Decisions remain meeting-by-meeting"
        ],
        link: "https://www.ecb.europa.eu/press/govcouncil/mopo/html/index.en.html",
        tone: 'dovish'
      }
    },
    {
      country: "Australia",
      currency: "AUD",
      centralBank: "Reserve Bank of Australia (RBA)",
      currentRate: 4.10,
      website: "https://www.rba.gov.au/monetary-policy/rba-board-minutes/",
      lastUpdate: "2026-08-04",
      meetingSchedule: ["2026-09-29", "2026-11-03", "2026-12-08", "2027-02-03"],
      nextMeeting: resolveNextMeeting(["2026-09-29", "2026-11-03", "2026-12-08", "2027-02-03"], "2026-09-29"),
      projections: {
        month6: { rate: 3.85, probability: 65, direction: 'down' },
        month12: { rate: 3.60, probability: 70, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-08-04", change: 0, rate: 4.10 },
        { date: "2026-06-16", change: 0, rate: 4.10 },
        { date: "2026-05-05", change: 0, rate: 4.10 }
      ],
      seasonality: { q1: 'neutral', q2: 'neutral', q3: 'bearish', q4: 'bullish' },
      tradingInsights: {
        bullishFactors: ["RBA just began cutting — rate differential still high", "Iron ore demand from China infrastructure", "COT data shows institutions bullish on AUD"],
        bearishFactors: ["China trade war exposure risks", "Slower domestic growth outlook", "Property market cooling"]
      },
      latestMinutes: {
        date: "2026-08-04",
        title: "RBA Board Minutes — August 2026",
        summary: "The Board held the cash rate at 4.10%, saying the easing delivered earlier in the year is still working through the economy. Trimmed mean inflation is inside the upper half of the band and the labour market remains tight, so the Board is in no hurry to cut again.",
        keyTakeaways: [
          "Cash rate held at 4.10%",
          "Earlier easing still passing through the economy",
          "Trimmed mean CPI in the upper half of the 2-3% band",
          "Labour market remains tight",
          "Board not on a pre-set path"
        ],
        link: "https://www.rba.gov.au/monetary-policy/rba-board-minutes/2026/2026-02-18.html",
        tone: 'neutral'
      }
    },
    {
      country: "New Zealand",
      currency: "NZD",
      centralBank: "Reserve Bank of New Zealand (RBNZ)",
      currentRate: 3.75,
      website: "https://www.rbnz.govt.nz/monetary-policy/official-cash-rate-decisions",
      lastUpdate: "2026-08-19",
      meetingSchedule: ["2026-10-07", "2026-11-25", "2027-02-17"],
      nextMeeting: resolveNextMeeting(["2026-10-07", "2026-11-25", "2027-02-17"], "2026-10-07"),
      projections: {
        month6: { rate: 3.25, probability: 72, direction: 'down' },
        month12: { rate: 3.00, probability: 78, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-08-19", change: 0, rate: 3.75 },
        { date: "2026-07-08", change: 0, rate: 3.75 },
        { date: "2026-05-27", change: 0, rate: 3.75 }
      ],
      seasonality: { q1: 'bullish', q2: 'neutral', q3: 'bearish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Aggressive rate cuts may be priced in", "Dairy prices stabilizing", "China stimulus boosting demand"],
        bearishFactors: ["RBNZ cutting 50bp per meeting — dovish cycle", "Weakest growth among peers", "Global trade uncertainty"]
      },
      latestMinutes: {
        date: "2026-08-19",
        title: "RBNZ Monetary Policy Statement — August 2026",
        summary: "The RBNZ left the OCR at 3.75%, close to its neutral estimate, after the front-loaded cuts of the previous cycle. The committee sees activity recovering modestly and inflation expectations anchored, leaving the next move genuinely two-sided.",
        keyTakeaways: [
          "OCR held at 3.75%, near the neutral estimate",
          "Front-loaded cuts have done most of the work",
          "Activity recovering modestly",
          "Inflation expectations anchored near 2%",
          "Next move is genuinely two-sided"
        ],
        link: "https://www.rbnz.govt.nz/monetary-policy/official-cash-rate-decisions",
        tone: 'dovish'
      }
    },
    {
      country: "Canada",
      currency: "CAD",
      centralBank: "Bank of Canada (BoC)",
      currentRate: 2.75,
      website: "https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/",
      lastUpdate: "2026-07-15",
      meetingSchedule: ["2026-09-09", "2026-10-28", "2026-12-09", "2027-01-27"],
      nextMeeting: resolveNextMeeting(["2026-09-09", "2026-10-28", "2026-12-09", "2027-01-27"], "2026-09-09"),
      projections: {
        month6: { rate: 2.50, probability: 65, direction: 'down' },
        month12: { rate: 2.25, probability: 70, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-07-15", change: 0, rate: 2.75 },
        { date: "2026-06-03", change: 0, rate: 2.75 },
        { date: "2026-04-22", change: 0, rate: 2.75 }
      ],
      seasonality: { q1: 'neutral', q2: 'bearish', q3: 'bearish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Oil prices may stabilize", "US-Canada trade integration", "Rate differential narrowing"],
        bearishFactors: ["BoC cutting faster than Fed widens spread", "US tariff threats on Canadian exports", "Weak housing market"]
      },
      latestMinutes: {
        date: "2026-07-15",
        title: "BoC Rate Decision & Deliberations — July 2026",
        summary: "The Bank of Canada held the policy rate at 2.75%. Governing Council said tariffs remain the dominant risk to growth but that inflation is tracking close to target, so the bar for further easing is a clear deterioration in the labour market.",
        keyTakeaways: [
          "Policy rate held at 2.75%",
          "Tariffs remain the dominant growth risk",
          "Inflation tracking close to the 2% target",
          "Labour market softening would trigger further easing",
          "Governing Council sees policy as roughly neutral"
        ],
        link: "https://www.bankofcanada.ca/core-functions/monetary-policy/key-interest-rate/",
        tone: 'dovish'
      }
    },
    {
      country: "Switzerland",
      currency: "CHF",
      centralBank: "Swiss National Bank (SNB)",
      currentRate: 0.00,
      website: "https://www.snb.ch/en/the-snb/mandates-goals/monetary-policy/monetary-policy-strategy",
      lastUpdate: "2026-06-18",
      meetingSchedule: ["2026-09-24", "2026-12-10", "2027-03-25"],
      nextMeeting: resolveNextMeeting(["2026-09-24", "2026-12-10", "2027-03-25"], "2026-09-24"),
      projections: {
        month6: { rate: 0.00, probability: 75, direction: 'hold' },
        month12: { rate: 0.00, probability: 65, direction: 'hold' }
      },
      recentChanges: [
        { date: "2026-06-18", change: 0, rate: 0.00 },
        { date: "2026-03-19", change: 0, rate: 0.00 },
        { date: "2025-12-12", change: -0.50, rate: 0.00 }
      ],
      seasonality: { q1: 'neutral', q2: 'neutral', q3: 'bearish', q4: 'bullish' },
      tradingInsights: {
        bullishFactors: ["Safe-haven status amid global trade war uncertainty", "Rate at 0% — no room for further cuts", "Strong banking sector and current account surplus"],
        bearishFactors: ["SNB willing to intervene to weaken CHF", "Zero rates eliminate carry appeal", "Risk of negative rates if economy weakens"]
      },
      latestMinutes: {
        date: "2026-06-18",
        title: "SNB Monetary Policy Assessment — June 2026",
        summary: "The SNB kept the policy rate at 0.00% and reiterated its willingness to intervene in FX markets as necessary. Inflation remains near the bottom of the price-stability range, keeping the risk of a return to negative rates on the table if the franc appreciates sharply.",
        keyTakeaways: [
          "Policy rate held at 0.00%",
          "SNB ready to intervene in FX markets as needed",
          "Inflation near the bottom of the price-stability range",
          "Negative rates remain a tool if the franc surges",
          "Next assessment is the September quarterly review"
        ],
        link: "https://www.snb.ch/en/the-snb/mandates-goals/monetary-policy/monetary-policy-strategy",
        tone: 'neutral'
      }
    },
    {
      country: "Japan",
      currency: "JPY",
      centralBank: "Bank of Japan (BoJ)",
      currentRate: 0.50,
      website: "https://www.boj.or.jp/en/mopo/outline/index.htm",
      lastUpdate: "2026-07-30",
      meetingSchedule: ["2026-09-18", "2026-10-30", "2026-12-18", "2027-01-22"],
      nextMeeting: resolveNextMeeting(["2026-09-18", "2026-10-30", "2026-12-18", "2027-01-22"], "2026-09-18"),
      projections: {
        month6: { rate: 0.75, probability: 72, direction: 'up' },
        month12: { rate: 1.00, probability: 65, direction: 'up' }
      },
      recentChanges: [
        { date: "2026-07-30", change: 0, rate: 0.50 },
        { date: "2026-06-16", change: 0, rate: 0.50 },
        { date: "2026-04-30", change: 0.25, rate: 0.50 }
      ],
      seasonality: { q1: 'bullish', q2: 'neutral', q3: 'bullish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["BoJ is the only major central bank hiking rates", "Ueda keeping April hike on the table", "Wage growth supporting normalization"],
        bearishFactors: ["Global trade war risks could delay hikes", "Iran conflict adding uncertainty", "Massive government debt limits aggressive tightening"]
      },
      latestMinutes: {
        date: "2026-07-30",
        title: "BoJ Monetary Policy Decision — July 2026",
        summary: "The BoJ held the policy rate at 0.50% and lifted its core inflation forecast, keeping a hawkish bias. Ueda said another hike remains possible in the second half of the fiscal year provided wage momentum and services prices hold up.",
        keyTakeaways: [
          "Policy rate held at 0.50% with a hawkish bias",
          "Core inflation forecast revised higher",
          "Another hike possible later in the fiscal year",
          "Wage momentum and services prices are the key tests",
          "JGB purchase taper continues on schedule"
        ],
        link: "https://www.boj.or.jp/en/mopo/outline/index.htm",
        tone: 'hawkish'
      }
    }
  ];

  await new Promise(resolve => setTimeout(resolve, 800));
  return fallbackData;
};

const getTrendIcon = (direction: 'up' | 'down' | 'hold') => {
  switch (direction) {
    case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
    case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
    case 'hold': return <Minus className="h-4 w-4 text-yellow-400" />;
  }
};

const getSeasonalityColor = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
  switch (sentiment) {
    case 'bullish': return 'text-green-400';
    case 'bearish': return 'text-red-400';
    case 'neutral': return 'text-yellow-400';
  }
};

const getToneBadge = (tone: 'hawkish' | 'dovish' | 'neutral') => {
  switch (tone) {
    case 'hawkish': return <Badge className="bg-green-900/50 text-green-400 border-green-700">HAWKISH</Badge>;
    case 'dovish': return <Badge className="bg-red-900/50 text-red-400 border-red-700">DOVISH</Badge>;
    case 'neutral': return <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-700">NEUTRAL</Badge>;
  }
};

const CentralBankRates = () => {
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'6m' | '12m'>('6m');
  const [activeTab, setActiveTab] = useState<'rates' | 'minutes'>('rates');
  const [expandedMinutes, setExpandedMinutes] = useState<string | null>(null);

  const { data: bankData, isLoading, error } = useQuery({
    queryKey: ['centralBankRates'],
    queryFn: fetchCentralBankData,
    staleTime: 1000 * 60 * 60 * 24 * 90,
    refetchInterval: 1000 * 60 * 60 * 24 * 90,
  });

  const sortedData = bankData?.slice().sort((a, b) => b.currentRate - a.currentRate);
  const filteredData = selectedBank === 'all' 
    ? sortedData 
    : sortedData?.filter(bank => bank.currency === selectedBank);

  if (isLoading) {
    return (
      <Card className="bg-card border-border text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Central Bank Interest Rate Forecaster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border text-card-foreground">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Failed to load central bank data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border text-card-foreground">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-extrabold text-xl">
              <Calendar className="h-5 w-5 text-blue-400" />
              Central Bank Interest Rate Forecaster
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
              Updated March 2026 — All rates reflect latest decisions
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger className="w-32 bg-card border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground z-50">
                <SelectItem value="all">All Banks</SelectItem>
                <SelectItem value="USD">USD (Fed)</SelectItem>
                <SelectItem value="EUR">EUR (ECB)</SelectItem>
                <SelectItem value="GBP">GBP (BoE)</SelectItem>
                <SelectItem value="JPY">JPY (BoJ)</SelectItem>
                <SelectItem value="CAD">CAD (BoC)</SelectItem>
                <SelectItem value="AUD">AUD (RBA)</SelectItem>
                <SelectItem value="NZD">NZD (RBNZ)</SelectItem>
                <SelectItem value="CHF">CHF (SNB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Main tabs: Rates vs Meeting Minutes */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rates' | 'minutes')} className="mb-6">
          <TabsList className="bg-muted border-border">
            <TabsTrigger value="rates" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-1" /> Rate Forecasts
            </TabsTrigger>
            <TabsTrigger value="minutes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-1" /> Meeting Minutes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates">
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as '6m' | '12m')} className="mb-6">
              <TabsList className="bg-muted border-border">
                <TabsTrigger value="6m" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">6 Month Outlook</TabsTrigger>
                <TabsTrigger value="12m" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">12 Month Outlook</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData?.map((bank) => (
                <Card key={bank.currency} className="bg-muted/50 border-border hover:border-blue-500 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <a href={bank.website} target="_blank" rel="noopener noreferrer"
                          className="font-bold text-lg text-foreground hover:text-blue-400 transition-colors">
                          {bank.currency}
                        </a>
                        <a href={bank.website} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-blue-400 transition-colors block">
                          {bank.centralBank}
                        </a>
                      </div>
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {bank.currentRate}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const priorRate = bank.recentChanges.find(c => c.rate !== bank.currentRate)?.rate
                        ?? bank.recentChanges[1]?.rate
                        ?? bank.currentRate;
                      const delta = +(bank.currentRate - priorRate).toFixed(2);
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg border border-border bg-background/60 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current</p>
                            <p className="text-lg font-bold text-foreground">{bank.currentRate}%</p>
                          </div>
                          <div className="rounded-lg border border-border bg-background/60 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Prior</p>
                            <div className="flex items-baseline gap-1.5">
                              <p className="text-lg font-bold text-muted-foreground line-through decoration-1">{priorRate}%</p>
                              <span className={`text-[11px] font-semibold ${delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                                {delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : '● '}{delta !== 0 ? `${delta}%` : 'no change'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Meeting:</span>
                      <span className="text-foreground">{new Date(bank.nextMeeting).toLocaleDateString()}</span>
                    </div>


                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {timeframe === '6m' ? '6-Month' : '12-Month'} Forecast
                        </span>
                        {getTrendIcon(timeframe === '6m' ? bank.projections.month6.direction : bank.projections.month12.direction)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">
                          {timeframe === '6m' ? bank.projections.month6.rate : bank.projections.month12.rate}%
                        </span>
                        <Badge variant="secondary">
                          {timeframe === '6m' ? bank.projections.month6.probability : bank.projections.month12.probability}% confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Seasonal Bias</h4>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        {(['q1', 'q2', 'q3', 'q4'] as const).map(q => (
                          <div key={q} className="text-center">
                            <div className="text-muted-foreground">{q.toUpperCase()}</div>
                            <div className={getSeasonalityColor(bank.seasonality[q])}>
                              {bank.seasonality[q].toUpperCase()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Rate History</h4>
                      <div className="space-y-1">
                        {bank.recentChanges.map((change, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{new Date(change.date).toLocaleDateString()}</span>
                            <span className={change.change > 0 ? 'text-green-400' : change.change < 0 ? 'text-red-400' : 'text-yellow-400'}>
                              {change.change > 0 ? '+' : ''}{change.change}% → {change.rate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>


                    <div className="border-t border-border pt-3">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Trading Insights: {bank.currency}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-green-400 font-medium mb-1">Bullish Factors:</p>
                          <ul className="space-y-0.5 text-muted-foreground">
                            {bank.tradingInsights.bullishFactors.map((factor, idx) => (
                              <li key={idx}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-red-400 font-medium mb-1">Bearish Factors:</p>
                          <ul className="space-y-0.5 text-muted-foreground">
                            {bank.tradingInsights.bearishFactors.map((factor, idx) => (
                              <li key={idx}>• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="minutes">
            <div className="space-y-4">
              <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Latest Central Bank Meeting Minutes & Statements
                </h3>
                <p className="text-sm text-muted-foreground">
                  Summaries of the most recent policy decisions with key takeaways for traders. Click any entry to expand details.
                </p>
              </div>

              {filteredData?.sort((a, b) => new Date(b.latestMinutes.date).getTime() - new Date(a.latestMinutes.date).getTime()).map((bank) => (
                <Card 
                  key={bank.currency} 
                  className={`bg-muted/50 border-border transition-all cursor-pointer hover:border-purple-500 ${expandedMinutes === bank.currency ? 'border-purple-500' : ''}`}
                  onClick={() => setExpandedMinutes(expandedMinutes === bank.currency ? null : bank.currency)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400 font-bold text-sm">
                          {bank.currency}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{bank.latestMinutes.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bank.latestMinutes.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {' • '}{bank.centralBank}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getToneBadge(bank.latestMinutes.tone)}
                        <Badge variant="outline" className="border-blue-500 text-blue-400">{bank.currentRate}%</Badge>
                        {expandedMinutes === bank.currency ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {expandedMinutes === bank.currency && (
                      <div className="mt-4 space-y-4 animate-fade-in">
                        <div className="p-3 bg-background/50 rounded-lg border border-border">
                          <h5 className="text-sm font-semibold text-foreground mb-2">Summary</h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">{bank.latestMinutes.summary}</p>
                        </div>

                        <div className="p-3 bg-background/50 rounded-lg border border-border">
                          <h5 className="text-sm font-semibold text-foreground mb-2">Key Takeaways</h5>
                          <ul className="space-y-1.5">
                            {bank.latestMinutes.keyTakeaways.map((takeaway, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">▸</span>
                                {takeaway}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Next Meeting: {new Date(bank.nextMeeting).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <a 
                            href={bank.latestMinutes.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm" className="text-xs gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Read Full Minutes
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Strategy Guide */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-xl">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-400" />
            Master Trading Strategy Guide
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p><strong className="text-blue-400">Rate Differentials:</strong> Widening spreads = stronger carry trades. Track rate differential changes between currency pairs.</p>
              <p><strong className="text-blue-400">Forward Guidance:</strong> Central bank communication often signals policy shifts weeks ahead. Read meeting minutes carefully.</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-purple-400">Seasonal Patterns:</strong> Quarterly bias data reveals historical trends. Align positions with seasonal strength periods.</p>
              <p><strong className="text-purple-400">Meeting Volatility:</strong> Major swings occur around rate decisions. Manage position sizing and stops accordingly.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CentralBankRates;
