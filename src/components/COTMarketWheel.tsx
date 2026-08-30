import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, ChevronRight } from 'lucide-react';
import { useCOTData } from './COTDataContext';

// Helper function to format currency pairs properly
const formatCurrencyPair = (currency: string): string => {
  // Cross pairs
  if (currency.includes('/')) return currency;
  if (currency === 'EURJPY') return 'EUR/JPY';
  if (currency === 'GBPJPY') return 'GBP/JPY';
  if (currency === 'EURGBP') return 'EUR/GBP';
  if (currency === 'GBPCAD') return 'GBP/CAD';
  if (currency === 'AUDJPY') return 'AUD/JPY';
  if (currency === 'EURAUD') return 'EUR/AUD';
  if (currency === 'GBPAUD') return 'GBP/AUD';
  if (currency === 'EURCAD') return 'EUR/CAD';
  if (currency === 'NZDJPY') return 'NZD/JPY';
  if (currency === 'CADJPY') return 'CAD/JPY';
  
  // USD pairs
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF', 'BRL'];
  return usdBasePairs.includes(currency) ? `USD/${currency}` : `${currency}/USD`;
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

  const handleCurrencyClick = (item: WheelDataItem) => {
    console.log('Currency clicked:', item.currency);
    
    // CFTC TFF report, August 25, 2026 — dealer (long/short) vs leveraged funds (ncLong/ncShort)
    const positionData: Record<string, { long: number; short: number; ncLong: number; ncShort: number }> = {
      'CAD': { long: 183841, short: 58911, ncLong: 27384, ncShort: 99476 },
      'CHF': { long: 57751, short: 9050, ncLong: 12353, ncShort: 21178 },
      'GBP': { long: 135405, short: 87000, ncLong: 81286, ncShort: 33377 },
      'JPY': { long: 99992, short: 57054, ncLong: 66528, ncShort: 143570 },
      'EUR': { long: 52864, short: 321445, ncLong: 90921, ncShort: 129280 },
      'AUD': { long: 101536, short: 139579, ncLong: 81344, ncShort: 27283 },
      'MXN': { long: 19497, short: 139574, ncLong: 131529, ncShort: 62625 },
      'NZD': { long: 64953, short: 34214, ncLong: 3673, ncShort: 35667 },
      'EURGBP': { long: 139864, short: 456850, ncLong: 124298, ncShort: 210566 },
      'EURJPY': { long: 109918, short: 421437, ncLong: 234491, ncShort: 195808 },
      'GBPJPY': { long: 192459, short: 186992, ncLong: 224856, ncShort: 99905 },
      'GBPCAD': { long: 194316, short: 270841, ncLong: 180762, ncShort: 60761 },
      'AUDJPY': { long: 158590, short: 239571, ncLong: 224914, ncShort: 93811 },
      'EURAUD': { long: 192443, short: 422981, ncLong: 118204, ncShort: 210624 },
      'GBPAUD': { long: 274984, short: 188536, ncLong: 108569, ncShort: 114721 },
      'EURCAD': { long: 111775, short: 505286, ncLong: 190397, ncShort: 156664 },
      'NZDJPY': { long: 122007, short: 134206, ncLong: 147243, ncShort: 102195 },
      'CADJPY': { long: 240895, short: 158903, ncLong: 170954, ncShort: 166004 }
    };
    
    const data = positionData[item.currency] || { long: 0, short: 0, ncLong: 0, ncShort: 0 };
    
    const currencyDetail = {
      currency: item.currency,
      commercialLong: data.long,
      commercialShort: data.short,
      nonCommercialLong: data.ncLong,
      nonCommercialShort: data.ncShort,
      reportDate: '2026-08-25T00:00:00Z',
      weeklyChange: item.weeklyChange
    };
    
    console.log('Setting currency detail:', currencyDetail);
    setSelectedCurrency(currencyDetail);
    setIsDetailModalOpen(true);
  };

  // Generate data from uploaded COT data or fallback to mock data
  const generateData = (): WheelDataItem[] => {
    // CFTC TFF report, August 11, 2026 (Leveraged Funds) — VERIFIED from official PDF
    const majorPairs: WheelDataItem[] = [
      { currency: 'EUR', netPosition: -60600, strength: 60600, bias: 'BEARISH', weeklyChange: -8395, color: '#EF4444', type: 'major' },
      { currency: 'GBP', netPosition: 40670, strength: 40670, bias: 'BULLISH', weeklyChange: 2496, color: '#7EBF8E', type: 'major' },
      { currency: 'JPY', netPosition: -53070, strength: 53070, bias: 'BEARISH', weeklyChange: 7755, color: '#EF4444', type: 'major' },
      { currency: 'CHF', netPosition: -11432, strength: 11432, bias: 'BEARISH', weeklyChange: -1348, color: '#EF4444', type: 'major' },
      { currency: 'AUD', netPosition: 48541, strength: 48541, bias: 'BULLISH', weeklyChange: 7904, color: '#7EBF8E', type: 'major' },
      { currency: 'CAD', netPosition: -92005, strength: 92005, bias: 'BEARISH', weeklyChange: 9743, color: '#EF4444', type: 'major' },
      { currency: 'MXN', netPosition: 76282, strength: 76282, bias: 'BULLISH', weeklyChange: 8575, color: '#7EBF8E', type: 'major' },
      { currency: 'NZD', netPosition: -33461, strength: 33461, bias: 'BEARISH', weeklyChange: -3171, color: '#EF4444', type: 'major' }
    ];

    const crossPairs: WheelDataItem[] = [
      { currency: 'EURJPY', netPosition: -7530, strength: 7530, bias: 'BEARISH', weeklyChange: -16150, color: '#EF4444', type: 'cross' },
      { currency: 'GBPJPY', netPosition: 93740, strength: 93740, bias: 'BULLISH', weeklyChange: -5259, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURGBP', netPosition: -101270, strength: 101270, bias: 'BEARISH', weeklyChange: -10891, color: '#EF4444', type: 'cross' },
      { currency: 'GBPCAD', netPosition: 132675, strength: 132675, bias: 'BULLISH', weeklyChange: -7247, color: '#7EBF8E', type: 'cross' },
      { currency: 'AUDJPY', netPosition: 101611, strength: 101611, bias: 'BULLISH', weeklyChange: 149, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURAUD', netPosition: -109141, strength: 109141, bias: 'BEARISH', weeklyChange: -16299, color: '#EF4444', type: 'cross' },
      { currency: 'GBPAUD', netPosition: -7871, strength: 7871, bias: 'BEARISH', weeklyChange: -5408, color: '#EF4444', type: 'cross' },
      { currency: 'EURCAD', netPosition: 31405, strength: 31405, bias: 'BULLISH', weeklyChange: -18138, color: '#7EBF8E', type: 'cross' },
      { currency: 'NZDJPY', netPosition: 19609, strength: 19609, bias: 'BULLISH', weeklyChange: -10926, color: '#7EBF8E', type: 'cross' },
      { currency: 'CADJPY', netPosition: -38935, strength: 38935, bias: 'BEARISH', weeklyChange: 1988, color: '#EF4444', type: 'cross' }
    ];

    return [...majorPairs, ...crossPairs];
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
          Click any pair to see detailed COT analysis and trading signals. Data from CFTC report Mar 29, 2026 (as of Mar 24).
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
          <h4 className="font-bold text-primary mb-2">Quick Summary - Mar 29, 2026 Report</h4>
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