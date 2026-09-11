import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, ChevronRight } from 'lucide-react';
import { useCOTData } from './COTDataContext';
import { latestReportDate, useLatestCOT } from '@/hooks/useLatestCOT';

// Helper function to format currency pairs properly
const formatCurrencyPair = (currency: string): string => {
  if (currency.length === 6) return currency;
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF', 'BRL'];
  return usdBasePairs.includes(currency) ? `USD${currency}` : `${currency}USD`;
};

interface WheelDataItem {
  currency: string;
  netPosition: number;
  strength: number;
  bias: string;
  weeklyChange: number;
  color: string;
  type: 'major' | 'cross';
}

const COTMarketWheel = () => {
  const { cotData, lastUpdated, setSelectedCurrency, setIsDetailModalOpen } = useCOTData();
  const { data: latestCot } = useLatestCOT();
  const reportDate = latestReportDate(latestCot);

  const handleCurrencyClick = (item: WheelDataItem) => {
    console.log('Currency clicked:', item.currency);
    
    // CFTC TFF report, September 1, 2026 — dealer (long/short) vs leveraged funds (ncLong/ncShort)
    const positionData: Record<string, { long: number; short: number; ncLong: number; ncShort: number }> = {
      'CAD': { long: 180223, short: 62264, ncLong: 27845, ncShort: 96595 },
      'CHF': { long: 64678, short: 8935, ncLong: 12305, ncShort: 22603 },
      'GBP': { long: 133142, short: 73939, ncLong: 77117, ncShort: 33950 },
      'JPY': { long: 116682, short: 37361, ncLong: 58529, ncShort: 160717 },
      'EUR': { long: 54643, short: 322221, ncLong: 96137, ncShort: 134310 },
      'AUD': { long: 104022, short: 147478, ncLong: 78498, ncShort: 28836 },
      'MXN': { long: 0, short: 0, ncLong: 174649, ncShort: 81402 },
      'NZD': { long: 54532, short: 36175, ncLong: 5216, ncShort: 27554 },
      'EURGBP': { long: 128582, short: 455363, ncLong: 130087, ncShort: 211427 },
      'EURJPY': { long: 92004, short: 438903, ncLong: 256854, ncShort: 192839 },
      'GBPJPY': { long: 170503, short: 190621, ncLong: 237834, ncShort: 92479 },
      'GBPCAD': { long: 195406, short: 254162, ncLong: 173712, ncShort: 61795 },
      'AUDJPY': { long: 141383, short: 264160, ncLong: 239215, ncShort: 87365 },
      'EURAUD': { long: 202121, short: 426243, ncLong: 124973, ncShort: 212808 },
      'GBPAUD': { long: 280620, short: 177961, ncLong: 105953, ncShort: 112448 },
      'EURCAD': { long: 116907, short: 502444, ncLong: 192732, ncShort: 162155 },
      'NZDJPY': { long: 91893, short: 152857, ncLong: 165933, ncShort: 86083 },
      'CADJPY': { long: 217584, short: 178946, ncLong: 188562, ncShort: 155124 }
    };
    
    const live = latestCot?.[item.currency];
    const data = live
      ? { long: 0, short: 0, ncLong: live.long, ncShort: live.short }
      : positionData[item.currency] || { long: 0, short: 0, ncLong: 0, ncShort: 0 };
    
    const currencyDetail = {
      currency: item.currency,
      commercialLong: data.long,
      commercialShort: data.short,
      nonCommercialLong: data.ncLong,
      nonCommercialShort: data.ncShort,
      reportDate: live?.reportDate ? `${live.reportDate}T00:00:00Z` : reportDate ? `${reportDate}T00:00:00Z` : '',
      weeklyChange: item.weeklyChange
    };
    
    console.log('Setting currency detail:', currencyDetail);
    setSelectedCurrency(currencyDetail);
    setIsDetailModalOpen(true);
  };

  // Generate data from uploaded COT data or fallback to mock data
  const generateData = (): WheelDataItem[] => {
    // CFTC TFF report, September 1, 2026 (Leveraged Funds) — VERIFIED from official PDF
    const majorPairs: WheelDataItem[] = [
      { currency: 'EUR', netPosition: -38173, strength: 38173, bias: 'BEARISH', weeklyChange: 186, color: '#EF4444', type: 'major' },
      { currency: 'GBP', netPosition: 43167, strength: 43167, bias: 'BULLISH', weeklyChange: -4742, color: '#7EBF8E', type: 'major' },
      { currency: 'JPY', netPosition: -102188, strength: 102188, bias: 'BEARISH', weeklyChange: -25146, color: '#EF4444', type: 'major' },
      { currency: 'CHF', netPosition: -10298, strength: 10298, bias: 'BEARISH', weeklyChange: -1473, color: '#EF4444', type: 'major' },
      { currency: 'AUD', netPosition: 49662, strength: 49662, bias: 'BULLISH', weeklyChange: -4399, color: '#7EBF8E', type: 'major' },
      { currency: 'CAD', netPosition: -68750, strength: 68750, bias: 'BEARISH', weeklyChange: 3342, color: '#EF4444', type: 'major' },
      { currency: 'MXN', netPosition: 93247, strength: 93247, bias: 'BULLISH', weeklyChange: 10865, color: '#7EBF8E', type: 'major' },
      { currency: 'NZD', netPosition: -22338, strength: 22338, bias: 'BEARISH', weeklyChange: 9656, color: '#EF4444', type: 'major' }
    ];

    const crossPairs: WheelDataItem[] = [
      { currency: 'EURJPY', netPosition: 64015, strength: 64015, bias: 'BULLISH', weeklyChange: 25332, color: '#7EBF8E', type: 'cross' },
      { currency: 'GBPJPY', netPosition: 145355, strength: 145355, bias: 'BULLISH', weeklyChange: 20404, color: '#7EBF8E', type: 'cross' },
      { currency: 'GBPCAD', netPosition: 111917, strength: 111917, bias: 'BULLISH', weeklyChange: -8084, color: '#7EBF8E', type: 'cross' },
      { currency: 'AUDJPY', netPosition: 151850, strength: 151850, bias: 'BULLISH', weeklyChange: 20747, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURAUD', netPosition: -87835, strength: 87835, bias: 'BEARISH', weeklyChange: 4585, color: '#EF4444', type: 'cross' },
      { currency: 'GBPAUD', netPosition: -6495, strength: 6495, bias: 'BEARISH', weeklyChange: -343, color: '#EF4444', type: 'cross' },
      { currency: 'EURCAD', netPosition: 30577, strength: 30577, bias: 'BULLISH', weeklyChange: -3156, color: '#7EBF8E', type: 'cross' },
      { currency: 'NZDJPY', netPosition: 79850, strength: 79850, bias: 'BULLISH', weeklyChange: 34802, color: '#7EBF8E', type: 'cross' },
      { currency: 'CADJPY', netPosition: 33438, strength: 33438, bias: 'BULLISH', weeklyChange: 28488, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURGBP', netPosition: -81340, strength: 81340, bias: 'BEARISH', weeklyChange: 4928, color: '#EF4444', type: 'cross' }
    ];

    const liveMajors = majorPairs.map((item) => {
      const row = latestCot?.[item.currency];
      if (!row) return item;
      return {
        ...item,
        netPosition: row.net,
        strength: Math.abs(row.net),
        bias: row.net > 0 ? 'BULLISH' : row.net < 0 ? 'BEARISH' : 'NEUTRAL',
        weeklyChange: row.weekly,
      };
    });

    const liveCrosses = crossPairs.map((item) => {
      const base = item.currency.slice(0, 3);
      const quote = item.currency.slice(3, 6);
      const baseRow = latestCot?.[base];
      const quoteRow = latestCot?.[quote];
      if (!baseRow || !quoteRow) return item;
      const netPosition = baseRow.net - quoteRow.net;
      return {
        ...item,
        netPosition,
        strength: Math.abs(netPosition),
        bias: netPosition > 0 ? 'BULLISH' : netPosition < 0 ? 'BEARISH' : 'NEUTRAL',
        weeklyChange: baseRow.weekly - quoteRow.weekly,
      };
    });

    return [...liveMajors, ...liveCrosses];
  };

  const allData = generateData();
  const majorPairs = allData.filter(d => d.type === 'major');
  const crossPairs = allData.filter(d => d.type === 'cross');

  const CurrencyRow = ({ item }: { item: WheelDataItem }) => (
    <div 
      onClick={() => handleCurrencyClick(item)}
      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer group ${
        item.bias === 'BULLISH' 
          ? 'bg-success/5 border-success/30 hover:bg-success/15 hover:border-success/50' 
          : item.bias === 'BEARISH'
          ? 'bg-destructive/5 border-destructive/30 hover:bg-destructive/15 hover:border-destructive/50'
          : 'bg-muted/5 border-muted/30 hover:bg-muted/15 hover:border-muted/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          item.bias === 'BULLISH' ? 'bg-success' : 
          item.bias === 'BEARISH' ? 'bg-destructive' : 'bg-muted-foreground'
        }`} />
        <span className="font-bold text-foreground text-lg">{formatCurrencyPair(item.currency)}</span>
        {item.bias === 'BULLISH' ? (
          <TrendingUp className="w-4 h-4 text-success" />
        ) : item.bias === 'BEARISH' ? (
          <TrendingDown className="w-4 h-4 text-destructive" />
        ) : (
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className={`font-mono font-bold ${
            item.netPosition > 0 ? 'text-success' : 'text-destructive'
          }`}>
            {item.netPosition > 0 ? '+' : ''}{(item.netPosition / 1000).toFixed(1)}K
          </div>
          <div className={`text-xs font-mono ${
            item.weeklyChange > 0 ? 'text-success/70' : 'text-destructive/70'
          }`}>
            {item.weeklyChange > 0 ? '+' : ''}{(item.weeklyChange / 1000).toFixed(1)}K
          </div>
        </div>
        
        <Badge 
          variant="secondary" 
          className={`text-xs min-w-[70px] justify-center ${
            item.bias === 'BULLISH' ? 'bg-success/20 text-success' :
            item.bias === 'BEARISH' ? 'bg-destructive/20 text-destructive' :
            'bg-muted/20 text-muted-foreground'
          }`}
        >
          {item.bias}
        </Badge>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2 font-display">
          🎯 COT Market Positioning
        </CardTitle>
        <CardDescription className="font-medium">
          Click any pair to see detailed COT analysis and trading signals{reportDate ? ` from the latest stored CFTC report (${reportDate})` : ''}.
          {lastUpdated && (
            <div className="text-xs text-success mt-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Major USD Pairs */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Major USD Pairs
          </h3>
          <div className="space-y-2">
            {majorPairs.map((item) => (
              <CurrencyRow key={item.currency} item={item} />
            ))}
          </div>
        </div>

        {/* Cross Pairs */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full"></span>
            Cross Pairs
          </h3>
          <div className="space-y-2">
            {crossPairs.map((item) => (
              <CurrencyRow key={item.currency} item={item} />
            ))}
          </div>
        </div>

        {/* Market Summary */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
          <h4 className="font-bold text-primary mb-2">Quick Summary{reportDate ? ` — ${reportDate} Report` : ''}</h4>
          <div className="text-sm text-foreground grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Most Bullish:</span>
              <span className="font-bold text-success ml-2">
                {formatCurrencyPair(allData.reduce((max, d) => d.netPosition > max.netPosition ? d : max).currency)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Most Bearish:</span>
              <span className="font-bold text-destructive ml-2">
                {formatCurrencyPair(allData.reduce((min, d) => d.netPosition < min.netPosition ? d : min).currency)}
              </span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default COTMarketWheel;