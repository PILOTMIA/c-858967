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
    
    // Mar 19, 2026 CFTC Report (data as of Mar 10, 2026) - Real institutional positioning
    const positionData: Record<string, { long: number; short: number; ncLong: number; ncShort: number }> = {
      // Major USD pairs - Asset Mgr (Commercial) and Leveraged Funds (Non-Commercial)
      // Verified from CFTC Financial Traders report released Mar 19, 2026
      'CAD': { long: 105105, short: 35593, ncLong: 28252, ncShort: 65411 },
      'CHF': { long: 5888, short: 60251, ncLong: 10750, ncShort: 6470 },
      'GBP': { long: 33647, short: 154150, ncLong: 48818, ncShort: 28716 },
      'JPY': { long: 65494, short: 62663, ncLong: 77546, ncShort: 126765 },
      'EUR': { long: 509748, short: 143449, ncLong: 105592, ncShort: 100361 },
      'AUD': { long: 86048, short: 62719, ncLong: 69980, ncShort: 23412 },
      'MXN': { long: 85939, short: 29494, ncLong: 89244, ncShort: 36359 },
      'NZD': { long: 10660, short: 48031, ncLong: 11699, ncShort: 15865 },
      'BRL': { long: 58972, short: 2305, ncLong: 33583, ncShort: 17985 },
      // Cross pairs - EURGBP from CFTC report
      'EURGBP': { long: 18478, short: 0, ncLong: 2869, ncShort: 3395 },
      // EURJPY from CFTC report
      'EURJPY': { long: 5437, short: 13164, ncLong: 2290, ncShort: 0 },
      // Derived cross pairs based on component positioning
      'GBPJPY': { long: 99141, short: 216813, ncLong: 126364, ncShort: 155481 },
      'GBPCAD': { long: 138752, short: 189743, ncLong: 77070, ncShort: 94127 },
      'AUDJPY': { long: 151542, short: 125382, ncLong: 147526, ncShort: 150177 },
      'EURAUD': { long: 595796, short: 206168, ncLong: 175572, ncShort: 123773 },
      'GBPAUD': { long: 119695, short: 216869, ncLong: 118798, ncShort: 52128 },
      'EURCAD': { long: 614853, short: 179042, ncLong: 133844, ncShort: 135954 },
      'NZDJPY': { long: 76154, short: 110694, ncLong: 89245, ncShort: 142630 },
      'CADJPY': { long: 170599, short: 98256, ncLong: 105798, ncShort: 192176 }
    };
    
    const data = positionData[item.currency] || { long: 0, short: 0, ncLong: 0, ncShort: 0 };
    
    const currencyDetail = {
      currency: item.currency,
      commercialLong: data.long,
      commercialShort: data.short,
      nonCommercialLong: data.ncLong,
      nonCommercialShort: data.ncShort,
      reportDate: '2026-03-19T00:00:00Z',
      weeklyChange: item.weeklyChange
    };
    
    console.log('Setting currency detail:', currencyDetail);
    setSelectedCurrency(currencyDetail);
    setIsDetailModalOpen(true);
  };

  // Generate data from uploaded COT data or fallback to mock data
  const generateData = (): WheelDataItem[] => {
    // Mar 19, 2026 CFTC Report (data as of Mar 10, 2026) - VERIFIED from uploaded PDF
    const majorPairs: WheelDataItem[] = [
      // EUR: NC Long 105,592 - NC Short 100,361 = +5,231 (Neutral — was +25K)
      { currency: 'EUR', netPosition: 5231, strength: 5231, bias: 'NEUTRAL', weeklyChange: -24401, color: '#8B8B8B', type: 'major' },
      // GBP: NC Long 48,818 - NC Short 28,716 = +20,102 (Bullish — was +38K)
      { currency: 'GBP', netPosition: 20102, strength: 20102, bias: 'BULLISH', weeklyChange: -14404, color: '#7EBF8E', type: 'major' },
      // JPY: NC Long 77,546 - NC Short 126,765 = -49,219 (Bearish — was -98K, shorts covering!)
      { currency: 'JPY', netPosition: -49219, strength: 49219, bias: 'BEARISH', weeklyChange: -14994, color: '#EF4444', type: 'major' },
      // CHF: NC Long 10,750 - NC Short 6,470 = +4,280 (Bullish — was -571, FLIPPED!)
      { currency: 'CHF', netPosition: 4280, strength: 4280, bias: 'BULLISH', weeklyChange: -176, color: '#7EBF8E', type: 'major' },
      // AUD: NC Long 69,980 - NC Short 23,412 = +46,568 (Bullish — was +30K, STRONGEST BULL!)
      { currency: 'AUD', netPosition: 46568, strength: 46568, bias: 'BULLISH', weeklyChange: -8067, color: '#7EBF8E', type: 'major' },
      // CAD: NC Long 28,252 - NC Short 65,411 = -37,159 (Bearish — was -55K, improving)
      { currency: 'CAD', netPosition: -37159, strength: 37159, bias: 'BEARISH', weeklyChange: 4212, color: '#EF4444', type: 'major' },
      // MXN: NC Long 89,244 - NC Short 36,359 = +52,885 (Bullish)
      { currency: 'MXN', netPosition: 52885, strength: 52885, bias: 'BULLISH', weeklyChange: -1921, color: '#7EBF8E', type: 'major' },
      // NZD: NC Long 11,699 - NC Short 15,865 = -4,166 (Bearish — was -10K, improving)
      { currency: 'NZD', netPosition: -4166, strength: 4166, bias: 'BEARISH', weeklyChange: 6129, color: '#EF4444', type: 'major' }
    ];

    // Cross pairs - derived from component currencies
    const crossPairs: WheelDataItem[] = [
      { currency: 'EURJPY', netPosition: 2290, strength: 2290, bias: 'BULLISH', weeklyChange: 185, color: '#7EBF8E', type: 'cross' },
      { currency: 'GBPJPY', netPosition: 69321, strength: 69321, bias: 'BULLISH', weeklyChange: -14220, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURGBP', netPosition: -526, strength: 526, bias: 'NEUTRAL', weeklyChange: 0, color: '#8B8B8B', type: 'cross' },
      { currency: 'GBPCAD', netPosition: 57261, strength: 57261, bias: 'BULLISH', weeklyChange: -18616, color: '#7EBF8E', type: 'cross' },
      { currency: 'AUDJPY', netPosition: 95787, strength: 95787, bias: 'BULLISH', weeklyChange: 6927, color: '#7EBF8E', type: 'cross' },
      { currency: 'EURAUD', netPosition: -41337, strength: 41337, bias: 'BEARISH', weeklyChange: -16334, color: '#EF4444', type: 'cross' },
      { currency: 'GBPAUD', netPosition: -26466, strength: 26466, bias: 'BEARISH', weeklyChange: -6337, color: '#EF4444', type: 'cross' },
      { currency: 'EURCAD', netPosition: 42390, strength: 42390, bias: 'BULLISH', weeklyChange: -28613, color: '#7EBF8E', type: 'cross' },
      { currency: 'NZDJPY', netPosition: 45053, strength: 45053, bias: 'BULLISH', weeklyChange: 21123, color: '#7EBF8E', type: 'cross' },
      { currency: 'CADJPY', netPosition: 12060, strength: 12060, bias: 'BULLISH', weeklyChange: 19206, color: '#7EBF8E', type: 'cross' }
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
          Click any pair to see detailed COT analysis and trading signals. Data from CFTC report Mar 19, 2026 (as of Mar 10).
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
          <h4 className="font-bold text-primary mb-2">Quick Summary - Mar 19, 2026 Report</h4>
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