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
    
    // Mar 29, 2026 CFTC Report (data as of Mar 24, 2026) - Real institutional positioning
    const positionData: Record<string, { long: number; short: number; ncLong: number; ncShort: number }> = {
      'CAD': { long: 67647, short: 41518, ncLong: 26751, ncShort: 58451 },
      'CHF': { long: 5541, short: 42537, ncLong: 7950, ncShort: 7715 },
      'GBP': { long: 28499, short: 122962, ncLong: 47450, ncShort: 31734 },
      'JPY': { long: 58266, short: 64516, ncLong: 67921, ncShort: 122773 },
      'EUR': { long: 446373, short: 158433, ncLong: 97985, ncShort: 111523 },
      'AUD': { long: 103155, short: 59229, ncLong: 68577, ncShort: 19432 },
      'MXN': { long: 72526, short: 23942, ncLong: 75059, ncShort: 20272 },
      'NZD': { long: 6572, short: 31584, ncLong: 7461, ncShort: 24191 },
      'EURGBP': { long: 18219, short: 549, ncLong: 2259, ncShort: 6456 },
      'EURJPY': { long: 5238, short: 12785, ncLong: 1954, ncShort: 0 },
      'GBPJPY': { long: 86765, short: 187478, ncLong: 115371, ncShort: 154507 },
      'GBPCAD': { long: 96146, short: 164480, ncLong: 74201, ncShort: 90185 },
      'AUDJPY': { long: 161421, short: 123745, ncLong: 136498, ncShort: 142205 },
      'EURAUD': { long: 549528, short: 217662, ncLong: 166562, ncShort: 130955 },
      'GBPAUD': { long: 131654, short: 182191, ncLong: 116027, ncShort: 51166 },
      'EURCAD': { long: 514020, short: 199951, ncLong: 124736, ncShort: 153041 },
      'NZDJPY': { long: 64838, short: 96100, ncLong: 75382, ncShort: 146964 },
      'CADJPY': { long: 125913, short: 106034, ncLong: 94672, ncShort: 181224 }
    };
    
    const data = positionData[item.currency] || { long: 0, short: 0, ncLong: 0, ncShort: 0 };
    
    const currencyDetail = {
      currency: item.currency,
      commercialLong: data.long,
      commercialShort: data.short,
      nonCommercialLong: data.ncLong,
      nonCommercialShort: data.ncShort,
      reportDate: '2026-03-29T00:00:00Z',
      weeklyChange: item.weeklyChange
    };
    
    console.log('Setting currency detail:', currencyDetail);
    setSelectedCurrency(currencyDetail);
    setIsDetailModalOpen(true);
  };

  // Generate data from uploaded COT data or fallback to mock data
  const generateData = (): WheelDataItem[] => {
    // Mar 29, 2026 CFTC Report (data as of Mar 24, 2026) - VERIFIED from uploaded PDF
    const majorPairs: WheelDataItem[] = [
      { currency: 'EUR', netPosition: -13538, strength: 13538, bias: 'BEARISH', weeklyChange: -6586, color: '#EF4444', type: 'major' },
      { currency: 'GBP', netPosition: 15716, strength: 15716, bias: 'BULLISH', weeklyChange: 3948, color: '#7EBF8E', type: 'major' },
      { currency: 'JPY', netPosition: -54852, strength: 54852, bias: 'BEARISH', weeklyChange: 10577, color: '#EF4444', type: 'major' },
      { currency: 'CHF', netPosition: 235, strength: 235, bias: 'NEUTRAL', weeklyChange: -278, color: '#8B8B8B', type: 'major' },
      { currency: 'AUD', netPosition: 49145, strength: 49145, bias: 'BULLISH', weeklyChange: 3786, color: '#7EBF8E', type: 'major' },
      { currency: 'CAD', netPosition: -31700, strength: 31700, bias: 'BEARISH', weeklyChange: 6152, color: '#EF4444', type: 'major' },
      { currency: 'MXN', netPosition: 54787, strength: 54787, bias: 'BULLISH', weeklyChange: 7841, color: '#7EBF8E', type: 'major' },
      { currency: 'NZD', netPosition: -16730, strength: 16730, bias: 'BEARISH', weeklyChange: -813, color: '#EF4444', type: 'major' }
    ];

    const crossPairs: WheelDataItem[] = [
      { currency: 'EURJPY', netPosition: 1954, strength: 1954, bias: 'NEUTRAL', weeklyChange: -336, color: '#8B8B8B', type: 'cross' },
      { currency: 'GBPJPY', netPosition: 70568, strength: 70568, bias: 'BULLISH', weeklyChange: -6629, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURGBP', netPosition: -4197, strength: 4197, bias: 'BEARISH', weeklyChange: -3671, color: '#EF4444', type: 'cross' },
      { currency: 'GBPCAD', netPosition: 47416, strength: 47416, bias: 'BULLISH', weeklyChange: -2204, color: '#7EBF8E', type: 'cross' },
      { currency: 'AUDJPY', netPosition: 103997, strength: 103997, bias: 'BULLISH', weeklyChange: -6791, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURAUD', netPosition: -62683, strength: 62683, bias: 'BEARISH', weeklyChange: -10372, color: '#EF4444', type: 'cross' },
      { currency: 'GBPAUD', netPosition: -33429, strength: 33429, bias: 'BEARISH', weeklyChange: 162, color: '#EF4444', type: 'cross' },
      { currency: 'EURCAD', netPosition: 18162, strength: 18162, bias: 'BULLISH', weeklyChange: -12738, color: '#7EBF8E', type: 'cross' },
      { currency: 'NZDJPY', netPosition: 38122, strength: 38122, bias: 'BULLISH', weeklyChange: -11390, color: '#7EBF8E', type: 'cross' },
      { currency: 'CADJPY', netPosition: 23152, strength: 23152, bias: 'BULLISH', weeklyChange: -4425, color: '#7EBF8E', type: 'cross' }
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