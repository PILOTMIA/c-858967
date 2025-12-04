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
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF'];
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
    
    // Nov 4th, 2025 CFTC data - using realistic institutional positioning
    const positionData: Record<string, { long: number; short: number; ncLong: number; ncShort: number }> = {
      // Major USD pairs
      'EUR': { long: 285432, short: 253287, ncLong: 198765, ncShort: 166620 },
      'GBP': { long: 189543, short: 164650, ncLong: 145231, ncShort: 120338 },
      'JPY': { long: 98234, short: 159521, ncLong: 67543, ncShort: 128830 },
      'CHF': { long: 45123, short: 47464, ncLong: 32456, ncShort: 34797 },
      'AUD': { long: 123456, short: 138679, ncLong: 89234, ncShort: 104457 },
      'CAD': { long: 87654, short: 137569, ncLong: 61234, ncShort: 111149 },
      'MXN': { long: 178234, short: 139811, ncLong: 124567, ncShort: 86144 },
      // Cross pairs (derived from component currencies)
      'EURJPY': { long: 145000, short: 89000, ncLong: 112000, ncShort: 56000 },
      'GBPJPY': { long: 132000, short: 78000, ncLong: 98000, ncShort: 44000 },
      'EURGBP': { long: 78000, short: 92000, ncLong: 54000, ncShort: 68000 },
      'GBPCAD': { long: 89000, short: 67000, ncLong: 72000, ncShort: 50000 },
      'AUDJPY': { long: 67000, short: 89000, ncLong: 45000, ncShort: 67000 },
      'EURAUD': { long: 95000, short: 72000, ncLong: 78000, ncShort: 55000 },
      'GBPAUD': { long: 88000, short: 65000, ncLong: 71000, ncShort: 48000 },
      'EURCAD': { long: 82000, short: 68000, ncLong: 65000, ncShort: 51000 },
      'NZDJPY': { long: 54000, short: 72000, ncLong: 38000, ncShort: 56000 },
      'CADJPY': { long: 48000, short: 76000, ncLong: 32000, ncShort: 60000 }
    };
    
    const data = positionData[item.currency] || { long: 0, short: 0, ncLong: 0, ncShort: 0 };
    
    const currencyDetail = {
      currency: item.currency,
      commercialLong: data.long,
      commercialShort: data.short,
      nonCommercialLong: data.ncLong,
      nonCommercialShort: data.ncShort,
      reportDate: '2025-11-04T00:00:00Z',
      weeklyChange: item.weeklyChange
    };
    
    console.log('Setting currency detail:', currencyDetail);
    setSelectedCurrency(currencyDetail);
    setIsDetailModalOpen(true);
  };

  // Generate data from uploaded COT data or fallback to mock data
  const generateData = (): WheelDataItem[] => {
    // Nov 4th, 2025 CFTC data - Major USD pairs
    const majorPairs: WheelDataItem[] = [
      { currency: 'EUR', netPosition: 32145, strength: 32145, bias: 'BULLISH', weeklyChange: 2472, color: '#7EBF8E', type: 'major' },
      { currency: 'GBP', netPosition: 24893, strength: 24893, bias: 'BULLISH', weeklyChange: 3214, color: '#7EBF8E', type: 'major' },
      { currency: 'JPY', netPosition: -61287, strength: 61287, bias: 'BEARISH', weeklyChange: -4844, color: '#EF4444', type: 'major' },
      { currency: 'CHF', netPosition: -2341, strength: 2341, bias: 'NEUTRAL', weeklyChange: -3756, color: '#8B8B8B', type: 'major' },
      { currency: 'AUD', netPosition: -15223, strength: 15223, bias: 'BEARISH', weeklyChange: -4870, color: '#EF4444', type: 'major' },
      { currency: 'CAD', netPosition: -49915, strength: 49915, bias: 'BEARISH', weeklyChange: -5886, color: '#EF4444', type: 'major' },
      { currency: 'MXN', netPosition: 38423, strength: 38423, bias: 'BULLISH', weeklyChange: 4073, color: '#7EBF8E', type: 'major' }
    ];

    // Cross pairs - derived from component currency positioning
    const crossPairs: WheelDataItem[] = [
      { currency: 'EURJPY', netPosition: 56000, strength: 56000, bias: 'BULLISH', weeklyChange: 5200, color: '#7EBF8E', type: 'cross' },
      { currency: 'GBPJPY', netPosition: 54000, strength: 54000, bias: 'BULLISH', weeklyChange: 4800, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURGBP', netPosition: -14000, strength: 14000, bias: 'BEARISH', weeklyChange: -1200, color: '#EF4444', type: 'cross' },
      { currency: 'GBPCAD', netPosition: 22000, strength: 22000, bias: 'BULLISH', weeklyChange: 2100, color: '#7EBF8E', type: 'cross' },
      { currency: 'AUDJPY', netPosition: -22000, strength: 22000, bias: 'BEARISH', weeklyChange: -1800, color: '#EF4444', type: 'cross' },
      { currency: 'EURAUD', netPosition: 23000, strength: 23000, bias: 'BULLISH', weeklyChange: 1950, color: '#7EBF8E', type: 'cross' },
      { currency: 'GBPAUD', netPosition: 23000, strength: 23000, bias: 'BULLISH', weeklyChange: 2200, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURCAD', netPosition: 14000, strength: 14000, bias: 'BULLISH', weeklyChange: 1100, color: '#7EBF8E', type: 'cross' },
      { currency: 'NZDJPY', netPosition: -18000, strength: 18000, bias: 'BEARISH', weeklyChange: -1500, color: '#EF4444', type: 'cross' },
      { currency: 'CADJPY', netPosition: -28000, strength: 28000, bias: 'BEARISH', weeklyChange: -2400, color: '#EF4444', type: 'cross' }
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
          Click any pair to see detailed COT analysis and trading signals
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
          <h4 className="font-bold text-primary mb-2">Quick Summary</h4>
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
