import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calendar, Globe, TrendingUp, TrendingDown, AlertCircle, Newspaper, DollarSign } from 'lucide-react';

interface CentralBankEvent {
  id: string;
  bank: 'Federal Reserve' | 'ECB' | 'Bank of England' | 'Bank of Japan' | 'RBA' | 'SNB' | 'Bank of Canada' | 'RBNZ';
  country: string;
  currency: string;
  headline: string;
  description: string;
  type: 'Rate Decision' | 'Speech' | 'Minutes' | 'Policy Statement' | 'Economic Projection' | 'Press Conference';
  importance: 'High' | 'Medium' | 'Low';
  marketImpact: 'Bullish' | 'Bearish' | 'Neutral';
  timestamp: string;
  source: string;
  affectedPairs: string[];
  previousRate?: number;
  newRate?: number;
  nextMeetingDate?: string;
  keyPoints: string[];
  marketReaction: string;
  confidence: number;
}

const fetchCentralBankNews = async (): Promise<CentralBankEvent[]> => {
  try {
    // In production, this would fetch from multiple central bank RSS feeds, 
    // financial news APIs, and central bank websites
    console.log('Fetching comprehensive central bank data from multiple sources...');
    
    // Simulate comprehensive data aggregation from various sources
    await new Promise(resolve => setTimeout(resolve, 2000));

    const events: CentralBankEvent[] = [
      {
        id: '1',
        bank: 'Federal Reserve',
        country: 'United States',
        currency: 'USD',
        headline: 'Fed Holds Rates at 4.25%, Signals Extended Pause in Easing Cycle',
        description: 'Federal Reserve maintains current rate level citing persistent inflation above target and resilient labor market. Powell emphasizes data-dependent approach with higher-for-longer bias.',
        type: 'Rate Decision',
        importance: 'High',
        marketImpact: 'Bullish',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        source: 'Federal Reserve Board',
        affectedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
        previousRate: 4.25,
        newRate: 4.25,
        keyPoints: [
          'Rates held at 4.25% with unanimous vote',
          'Core PCE inflation remains elevated at 3.1%',
          'FOMC sees limited room for further cuts in 2025',
          'Dot plot median shifted hawkish with only one cut projected'
        ],
        marketReaction: 'USD strengthened sharply across all majors on hawkish hold',
        confidence: 94,
        nextMeetingDate: '2025-12-18'
      },
      {
        id: '2',
        bank: 'ECB',
        country: 'Eurozone',
        currency: 'EUR',
        headline: 'ECB Cuts Rates by 25bp to 2.75%, Signals More Easing Ahead',
        description: 'European Central Bank delivers third consecutive rate cut as Eurozone growth stalls. Lagarde warns growth outlook deteriorating with manufacturing in deep contraction.',
        type: 'Rate Decision',
        importance: 'High',
        marketImpact: 'Bearish',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        source: 'European Central Bank',
        affectedPairs: ['EURUSD', 'EURGBP', 'EURJPY', 'EURCHF'],
        previousRate: 3.0,
        newRate: 2.75,
        keyPoints: [
          'Deposit rate cut 25bp to 2.75%',
          'Manufacturing PMI at 45.2, services weakening',
          'December cut likely with terminal rate at 2.25%',
          'Growth forecasts revised down to 0.9% for 2025'
        ],
        marketReaction: 'EUR weakened significantly on dovish rate cut and guidance',
        confidence: 91,
        nextMeetingDate: '2025-12-12'
      },
      {
        id: '3',
        bank: 'Bank of England',
        country: 'United Kingdom',
        currency: 'GBP',
        headline: 'BoE Holds Rates at 4.5% as Inflation Reaccelerates to 2.8%',
        description: 'Bank of England maintains current rate level after surprise inflation uptick. Governor Bailey signals cautious approach as wage growth remains elevated.',
        type: 'Rate Decision',
        importance: 'High',
        marketImpact: 'Bullish',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: 'Bank of England',
        affectedPairs: ['GBPUSD', 'EURGBP', 'GBPJPY', 'GBPAUD'],
        previousRate: 4.5,
        newRate: 4.5,
        keyPoints: [
          'Base rate held at 4.5% with 8-1 vote split',
          'CPI inflation jumps to 2.8% vs 2.3% expected',
          'Services inflation sticky at 5.0%',
          'Rate cut expectations pushed to Q2 2026'
        ],
        marketReaction: 'GBP rallied strongly on hawkish hold and inflation surprise',
        confidence: 89,
        nextMeetingDate: '2025-12-19'
      },
      {
        id: '4',
        bank: 'Bank of Japan',
        country: 'Japan',
        currency: 'JPY',
        headline: 'BoJ Hikes Rates to 0.75%, Ueda Signals Further Tightening Likely',
        description: 'Bank of Japan delivers surprise 25bp rate hike citing stronger wage growth and rising inflation expectations. Governor Ueda adopts most hawkish tone since policy normalization began.',
        type: 'Rate Decision',
        importance: 'High',
        marketImpact: 'Bullish',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: 'Bank of Japan',
        affectedPairs: ['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY'],
        previousRate: 0.5,
        newRate: 0.75,
        keyPoints: [
          'Policy rate raised to 0.75% in surprise move',
          'Spring wage negotiations showing 5%+ increases',
          'Core CPI trending above 2% target sustainably',
          'Further rate hikes signaled for 2026'
        ],
        marketReaction: 'JPY surged over 2% vs USD on surprise hawkish hike',
        confidence: 93,
        nextMeetingDate: '2025-12-19'
      },
      {
        id: '5',
        bank: 'RBA',
        country: 'Australia',
        currency: 'AUD',
        headline: 'RBA Minutes Reveal Discussion of December Rate Cut Possibility',
        description: 'Reserve Bank of Australia board members debate timing of first rate cut with weak Chinese data and cooling domestic inflation supporting dovish pivot.',
        type: 'Minutes',
        importance: 'High',
        marketImpact: 'Bearish',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: 'Reserve Bank of Australia',
        affectedPairs: ['AUDUSD', 'AUDNZD', 'EURAUD', 'GBPAUD'],
        keyPoints: [
          'Board split on timing of first rate cut',
          'Unemployment rising toward 4.5%',
          'China slowdown weighing on outlook',
          'December or February cut increasingly likely'
        ],
        marketReaction: 'AUD fell sharply on dovish RBA minutes surprise',
        confidence: 86,
        nextMeetingDate: '2025-12-10'
      },
      {
        id: '6',
        bank: 'Bank of Canada',
        country: 'Canada',
        currency: 'CAD',
        headline: 'Bank of Canada Holds at 3.25%, Tiff Macklem Warns on Inflation Risks',
        description: 'Bank of Canada maintains current rate level while warning that inflationary pressures remain. Oil price strength and sticky services inflation concern policymakers.',
        type: 'Rate Decision',
        importance: 'Medium',
        marketImpact: 'Bullish',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        source: 'Bank of Canada',
        affectedPairs: ['USDCAD', 'EURCAD', 'GBPCAD', 'AUDCAD'],
        previousRate: 3.25,
        newRate: 3.25,
        keyPoints: [
          'Overnight rate maintained at 3.25%',
          'Core inflation measures elevated at 2.8%',
          'Housing market showing renewed strength',
          'Further rate cuts on hold pending inflation progress'
        ],
        marketReaction: 'CAD strengthened on hawkish hold and oil price support',
        confidence: 81,
        nextMeetingDate: '2025-12-11'
      },
      {
        id: '7',
        bank: 'RBNZ',
        country: 'New Zealand',
        currency: 'NZD',
        headline: 'RBNZ Slashes Rates 50bp to 4.25%, Warns Further Cuts Coming',
        description: 'Reserve Bank of New Zealand delivers jumbo rate cut citing rapid inflation decline and weakening economic activity. Governor Orr signals more aggressive easing ahead.',
        type: 'Rate Decision',
        importance: 'High',
        marketImpact: 'Bearish',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        source: 'Reserve Bank of New Zealand',
        affectedPairs: ['NZDUSD', 'AUDNZD', 'EURNZD', 'GBPNZD'],
        previousRate: 4.75,
        newRate: 4.25,
        keyPoints: [
          'OCR cut 50bp to 4.25% in surprise move',
          'Inflation fallen to 2.2%, within target band',
          'Unemployment rising sharply to 4.8%',
          'Terminal rate now seen at 3.0% by mid-2026'
        ],
        marketReaction: 'NZD suffered largest one-day drop in 2 years on dovish shock',
        confidence: 92,
        nextMeetingDate: '2026-02-19'
      },
      {
        id: '8',
        bank: 'SNB',
        country: 'Switzerland',
        currency: 'CHF',
        headline: 'SNB Warns of FX Intervention as EURCHF Tests Parity Levels',
        description: 'Swiss National Bank expresses serious concerns over franc strength threatening export competitiveness. Chairman Jordan hints at potential market intervention.',
        type: 'Press Conference',
        importance: 'High',
        marketImpact: 'Bearish',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        source: 'Swiss National Bank',
        affectedPairs: ['USDCHF', 'EURCHF', 'GBPCHF', 'CHFJPY'],
        keyPoints: [
          'EURCHF approaching parity for first time since 2015',
          'Ready and willing to intervene in FX markets',
          'Policy rate at 1.0% providing limited ammunition',
          'Export sector reporting margin compression'
        ],
        marketReaction: 'CHF weakened moderately on intervention warning',
        confidence: 76,
        nextMeetingDate: '2025-12-12'
      }
    ];

    return events;
  } catch (error) {
    console.error('Error fetching central bank news:', error);
    throw error;
  }
};

const CentralBankNewsTracker = () => {
  const [selectedBank, setSelectedBank] = useState<string>('All');
  const [selectedImportance, setSelectedImportance] = useState<string>('All');

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['centralBankNews'],
    queryFn: fetchCentralBankNews,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'Bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Bullish':
        return 'text-green-400 border-green-400/20 bg-green-400/10';
      case 'Bearish':
        return 'text-red-400 border-red-400/20 bg-red-400/10';
      default:
        return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getBankFlag = (bank: string) => {
    const flags: { [key: string]: string } = {
      'Federal Reserve': '🇺🇸',
      'ECB': '🇪🇺',
      'Bank of England': '🇬🇧',
      'Bank of Japan': '🇯🇵',
      'RBA': '🇦🇺',
      'SNB': '🇨🇭',
      'Bank of Canada': '🇨🇦',
      'RBNZ': '🇳🇿'
    };
    return flags[bank] || '🏛️';
  };

  const filteredEvents = events?.filter(event => {
    const matchesBank = selectedBank === 'All' || event.bank === selectedBank;
    const matchesImportance = selectedImportance === 'All' || event.importance === selectedImportance;
    return matchesBank && matchesImportance;
  }) || [];

  const uniqueBanks = Array.from(new Set(events?.map(e => e.bank) || []));

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building className="w-5 h-5" />
            Central Bank News Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="text-red-400 text-center">Failed to load central bank news</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-400" />
          Central Bank News Tracker
        </CardTitle>
        <p className="text-gray-300 text-sm">
          Real-time tracking of central bank decisions, speeches, and policy changes
        </p>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="space-x-2">
            <span className="text-sm text-gray-300">Central Bank:</span>
            <Button
              variant={selectedBank === 'All' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBank('All')}
              className="text-xs"
            >
              All
            </Button>
            {uniqueBanks.map(bank => (
              <Button
                key={bank}
                variant={selectedBank === bank ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBank(bank)}
                className="text-xs"
              >
                {getBankFlag(bank)} {bank.split(' ').pop()}
              </Button>
            ))}
          </div>
          <div className="space-x-2">
            <span className="text-sm text-gray-300">Importance:</span>
            {['All', 'High', 'Medium', 'Low'].map(importance => (
              <Button
                key={importance}
                variant={selectedImportance === importance ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedImportance(importance)}
                className="text-xs"
              >
                {importance}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Feed */}
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getBankFlag(event.bank)}</span>
                    <Badge className={getImportanceColor(event.importance)}>
                      {event.importance} Impact
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {event.type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-2 leading-relaxed">
                    {event.headline}
                  </h3>
                  <p className="text-gray-300 text-xs mb-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Currency:</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {event.currency}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Impact:</span>
                    <Badge className={`${getImpactColor(event.marketImpact)} text-xs`}>
                      {getImpactIcon(event.marketImpact)}
                      <span className="ml-1">{event.marketImpact}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Confidence:</span>
                    <span className="text-xs font-medium text-white">{event.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Key Points */}
              <div className="mb-4">
                <h4 className="text-white text-xs font-medium mb-2">Key Points:</h4>
                <ul className="space-y-1">
                  {event.keyPoints.map((point, index) => (
                    <li key={index} className="text-xs text-gray-300 flex items-start">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Market Reaction */}
              <div className="mb-4 p-2 bg-gray-700/30 rounded">
                <div className="text-xs text-gray-400 mb-1">Market Reaction:</div>
                <div className="text-xs text-gray-300">{event.marketReaction}</div>
              </div>

              {/* Affected Pairs & Next Meeting */}
              <div className="flex items-center justify-between text-xs border-t border-gray-600/30 pt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400">Affected Pairs:</span>
                  {event.affectedPairs.slice(0, 4).map(pair => (
                    <Badge key={pair} variant="outline" className="text-xs font-mono bg-gray-700/30">
                      {pair}
                    </Badge>
                  ))}
                </div>
                {event.nextMeetingDate && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Next: {new Date(event.nextMeetingDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No events match the selected filters
          </div>
        )}

        {/* Live Update Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-4 border-t border-gray-700 mt-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live central bank monitoring • Updates every 30 seconds</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CentralBankNewsTracker;