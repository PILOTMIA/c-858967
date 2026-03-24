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

const fetchCentralBankData = async (): Promise<CentralBankData[]> => {
  const fallbackData: CentralBankData[] = [
    {
      country: "United States",
      currency: "USD",
      centralBank: "Federal Reserve (Fed)",
      currentRate: 4.50,
      website: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
      lastUpdate: "2026-03-18",
      nextMeeting: "2026-05-07",
      projections: {
        month6: { rate: 4.25, probability: 58, direction: 'down' },
        month12: { rate: 3.75, probability: 68, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-03-18", change: 0, rate: 4.50 },
        { date: "2026-01-29", change: 0, rate: 4.50 },
        { date: "2025-12-18", change: -0.25, rate: 4.50 }
      ],
      seasonality: { q1: 'neutral', q2: 'neutral', q3: 'bearish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Tariff policy strengthens USD via safe-haven flows", "Fed holding rates higher for longer", "Strong labor market supports rates"],
        bearishFactors: ["Rate cuts expected later in 2026", "Trade war uncertainty weighs on growth", "Fiscal deficit concerns growing"]
      },
      latestMinutes: {
        date: "2026-03-18",
        title: "FOMC Statement — March 17-18, 2026",
        summary: "The Fed held rates steady at 4.25-4.50% for the third consecutive meeting. Powell noted uncertainty from tariffs is weighing on the outlook, but the economy remains resilient. The committee revised growth forecasts lower and inflation forecasts higher due to tariff effects. Two rate cuts still projected for 2026 but timing pushed back.",
        keyTakeaways: [
          "Rates held at 4.25-4.50% unanimously",
          "GDP growth forecast revised down to 1.7% from 2.1%",
          "Core PCE inflation raised to 2.8% for 2026",
          "Tariff uncertainty is the primary risk factor",
          "Two 25bp cuts still projected for later in 2026"
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
      lastUpdate: "2026-03-20",
      nextMeeting: "2026-04-30",
      projections: {
        month6: { rate: 3.50, probability: 70, direction: 'down' },
        month12: { rate: 3.00, probability: 75, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-03-20", change: 0, rate: 3.75 },
        { date: "2026-02-06", change: -0.25, rate: 3.75 },
        { date: "2025-11-07", change: -0.25, rate: 4.00 }
      ],
      seasonality: { q1: 'bearish', q2: 'bearish', q3: 'neutral', q4: 'bullish' },
      tradingInsights: {
        bullishFactors: ["Rate held steady — not cutting as fast as expected", "Strong services sector", "London financial center drives demand"],
        bearishFactors: ["Gradual BoE cuts expected through 2026", "Weak manufacturing sector", "CPI at 3.0% still above target"]
      },
      latestMinutes: {
        date: "2026-03-20",
        title: "MPC Summary & Minutes — March 2026",
        summary: "The MPC voted unanimously (9-0) to hold Bank Rate at 3.75%, the first unanimous vote since September 2021. Inflation rose to 3.0% in January, above the 2.8% forecast. The committee emphasized a gradual and careful approach to rate cuts, with external risks from global trade policy adding uncertainty.",
        keyTakeaways: [
          "Unanimous 9-0 vote to hold at 3.75%",
          "First unanimous hold since September 2021",
          "CPI rose to 3.0% vs 2.8% forecast",
          "Governor Bailey stressed 'gradual and careful' approach",
          "Global trade uncertainty cited as key downside risk"
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
      lastUpdate: "2026-03-06",
      nextMeeting: "2026-04-17",
      projections: {
        month6: { rate: 2.15, probability: 80, direction: 'down' },
        month12: { rate: 1.75, probability: 82, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-03-06", change: -0.25, rate: 2.65 },
        { date: "2026-01-30", change: -0.25, rate: 2.90 },
        { date: "2025-12-12", change: -0.25, rate: 3.15 }
      ],
      seasonality: { q1: 'bearish', q2: 'bearish', q3: 'neutral', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Rate cuts largely priced in", "German fiscal stimulus plans", "Defense spending boost across EU"],
        bearishFactors: ["Wide rate differential vs Fed (185bp)", "Trade war exposure on exports", "Weak growth across member states"]
      },
      latestMinutes: {
        date: "2026-03-06",
        title: "ECB Monetary Policy Decision — March 2026",
        summary: "The ECB cut rates by 25bp, its sixth consecutive cut, bringing the deposit facility rate to 2.65%. President Lagarde noted inflation is on track to reach the 2% target by year-end. Growth remains weak but defense spending plans across Europe provide upside risk. Trade uncertainty from US tariffs is a key concern.",
        keyTakeaways: [
          "Sixth consecutive 25bp rate cut to 2.65%",
          "Inflation on track for 2% target by late 2026",
          "Growth forecast cut to 0.9% for 2026",
          "Defense and infrastructure spending to boost growth",
          "US tariff risks dominate the outlook"
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
      lastUpdate: "2026-02-18",
      nextMeeting: "2026-04-01",
      projections: {
        month6: { rate: 3.85, probability: 65, direction: 'down' },
        month12: { rate: 3.60, probability: 70, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-02-18", change: -0.25, rate: 4.10 },
        { date: "2025-12-10", change: 0, rate: 4.35 },
        { date: "2025-11-05", change: 0, rate: 4.35 }
      ],
      seasonality: { q1: 'neutral', q2: 'neutral', q3: 'bearish', q4: 'bullish' },
      tradingInsights: {
        bullishFactors: ["RBA just began cutting — rate differential still high", "Iron ore demand from China infrastructure", "COT data shows institutions bullish on AUD"],
        bearishFactors: ["China trade war exposure risks", "Slower domestic growth outlook", "Property market cooling"]
      },
      latestMinutes: {
        date: "2026-02-18",
        title: "RBA Board Minutes — February 2026",
        summary: "The RBA delivered its first rate cut in 4 years, reducing the cash rate by 25bp to 4.10%. Governor Bullock emphasized this was not the start of an aggressive cutting cycle and that future moves depend on inflation progress. The board noted trimmed mean CPI had fallen sufficiently to justify easing.",
        keyTakeaways: [
          "First rate cut in 4 years — 25bp to 4.10%",
          "Governor Bullock: 'Not on a pre-set path'",
          "Trimmed mean CPI at 3.2%, trending lower",
          "Labor market remains tight",
          "Next cut not guaranteed — data dependent"
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
      lastUpdate: "2026-02-19",
      nextMeeting: "2026-04-09",
      projections: {
        month6: { rate: 3.25, probability: 72, direction: 'down' },
        month12: { rate: 3.00, probability: 78, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-02-19", change: -0.50, rate: 3.75 },
        { date: "2025-11-27", change: -0.50, rate: 4.25 },
        { date: "2025-10-09", change: -0.50, rate: 4.75 }
      ],
      seasonality: { q1: 'bullish', q2: 'neutral', q3: 'bearish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Aggressive rate cuts may be priced in", "Dairy prices stabilizing", "China stimulus boosting demand"],
        bearishFactors: ["RBNZ cutting 50bp per meeting — dovish cycle", "Weakest growth among peers", "Global trade uncertainty"]
      },
      latestMinutes: {
        date: "2026-02-19",
        title: "RBNZ Monetary Policy Statement — February 2026",
        summary: "The RBNZ cut the OCR by 50bp to 3.75%, its third consecutive 50bp cut. The committee sees the economy emerging from recession but inflation expectations remain well-anchored near 2%. Forward guidance suggests further cuts ahead but at a slower pace as rates approach neutral.",
        keyTakeaways: [
          "Third consecutive 50bp cut to 3.75%",
          "OCR has dropped 175bp since August 2025",
          "Economy exiting recession — GDP positive in Q4",
          "Future cuts likely at a slower pace",
          "Neutral rate estimated around 3.00%"
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
      lastUpdate: "2026-03-12",
      nextMeeting: "2026-04-16",
      projections: {
        month6: { rate: 2.50, probability: 65, direction: 'down' },
        month12: { rate: 2.25, probability: 70, direction: 'down' }
      },
      recentChanges: [
        { date: "2026-03-12", change: -0.25, rate: 2.75 },
        { date: "2026-01-29", change: -0.25, rate: 3.00 },
        { date: "2025-12-11", change: -0.50, rate: 3.25 }
      ],
      seasonality: { q1: 'neutral', q2: 'bearish', q3: 'bearish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["Oil prices may stabilize", "US-Canada trade integration", "Rate differential narrowing"],
        bearishFactors: ["BoC cutting faster than Fed widens spread", "US tariff threats on Canadian exports", "Weak housing market"]
      },
      latestMinutes: {
        date: "2026-03-12",
        title: "BoC Rate Decision & Deliberations — March 2026",
        summary: "The BoC cut rates by 25bp to 2.75%, citing trade war risks as the dominant concern. Governor Macklem warned that US tariffs could significantly reduce Canadian GDP growth. The committee debated a larger cut but opted for caution given uncertainty. Forward guidance suggests further easing if trade conditions worsen.",
        keyTakeaways: [
          "25bp cut to 2.75% — seventh consecutive cut",
          "US tariffs the 'most significant' risk to outlook",
          "GDP growth forecast cut to 1.0% for 2026",
          "Inflation expected to remain near 2% target",
          "Further cuts depend on trade war developments"
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
      lastUpdate: "2026-03-19",
      nextMeeting: "2026-06-19",
      projections: {
        month6: { rate: 0.00, probability: 75, direction: 'hold' },
        month12: { rate: 0.00, probability: 65, direction: 'hold' }
      },
      recentChanges: [
        { date: "2026-03-19", change: 0, rate: 0.00 },
        { date: "2025-12-12", change: -0.50, rate: 0.00 },
        { date: "2025-09-26", change: -0.25, rate: 0.50 }
      ],
      seasonality: { q1: 'neutral', q2: 'neutral', q3: 'bearish', q4: 'bullish' },
      tradingInsights: {
        bullishFactors: ["Safe-haven status amid global trade war uncertainty", "Rate at 0% — no room for further cuts", "Strong banking sector and current account surplus"],
        bearishFactors: ["SNB willing to intervene to weaken CHF", "Zero rates eliminate carry appeal", "Risk of negative rates if economy weakens"]
      },
      latestMinutes: {
        date: "2026-03-19",
        title: "SNB Monetary Policy Assessment — March 2026",
        summary: "The SNB held its policy rate at 0.00%, as expected. Chair Schlegel noted that global uncertainty — particularly from US tariffs — creates a challenging environment. The franc has appreciated as a safe haven, and the SNB remains willing to intervene in FX markets. Inflation is well below target at 0.3%.",
        keyTakeaways: [
          "Rate held at 0.00% — at the lower bound",
          "Inflation at just 0.3%, well below 2% target",
          "CHF appreciation pressuring exporters",
          "SNB 'willing to be active in FX market' if needed",
          "Trade war uncertainty is primary external risk"
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
      lastUpdate: "2026-03-19",
      nextMeeting: "2026-04-30",
      projections: {
        month6: { rate: 0.75, probability: 72, direction: 'up' },
        month12: { rate: 1.00, probability: 65, direction: 'up' }
      },
      recentChanges: [
        { date: "2026-03-19", change: 0, rate: 0.50 },
        { date: "2026-01-24", change: 0.25, rate: 0.50 },
        { date: "2025-07-31", change: 0.25, rate: 0.25 }
      ],
      seasonality: { q1: 'bullish', q2: 'neutral', q3: 'bullish', q4: 'neutral' },
      tradingInsights: {
        bullishFactors: ["BoJ is the only major central bank hiking rates", "Ueda keeping April hike on the table", "Wage growth supporting normalization"],
        bearishFactors: ["Global trade war risks could delay hikes", "Iran conflict adding uncertainty", "Massive government debt limits aggressive tightening"]
      },
      latestMinutes: {
        date: "2026-03-19",
        title: "BoJ Monetary Policy Decision — March 2026",
        summary: "The BoJ held rates steady at 0.50% in a hawkish hold. Governor Ueda signaled that an April rate hike remains on the table if the economic outlook holds. The board noted solid wage growth and rising services inflation. A new price indicator and updated neutral rate estimate will be introduced at the April meeting.",
        keyTakeaways: [
          "Rate held at 0.50% — but hawkish forward guidance",
          "April hike remains 'on the table' — Ueda",
          "Wage growth at 5.4% supports normalization",
          "Services inflation rising as expected",
          "New price indicator to debut at April meeting"
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
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Rate:</span>
                        <span className="text-foreground font-medium">{bank.currentRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next Meeting:</span>
                        <span className="text-foreground">{new Date(bank.nextMeeting).toLocaleDateString()}</span>
                      </div>
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
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Changes</h4>
                      <div className="space-y-1">
                        {bank.recentChanges.slice(0, 2).map((change, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{new Date(change.date).toLocaleDateString()}</span>
                            <span className={change.change > 0 ? 'text-green-400' : change.change < 0 ? 'text-red-400' : 'text-yellow-400'}>
                              {change.change > 0 ? '+' : ''}{change.change}% ({change.rate}%)
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
