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
    
    // Jan 21, 2026 CFTC Report (data as of Jan 13, 2026) - Real institutional positioning
    const positionData: Record<string, { long: number; short: number; ncLong: number; ncShort: number }> = {
      // Major USD pairs - Asset Mgr (Commercial) and Leveraged Funds (Non-Commercial)
      // Verified from CFTC Financial Traders report released Jan 21, 2026
      'CAD': { long: 71451, short: 63407, ncLong: 22400, ncShort: 78099 },
      'CHF': { long: 6766, short: 59792, ncLong: 10064, ncShort: 10635 },
      'GBP': { long: 43857, short: 123791, ncLong: 66540, ncShort: 28450 },
      'JPY': { long: 75804, short: 47581, ncLong: 43869, ncShort: 142519 },
      'EUR': { long: 555117, short: 151001, ncLong: 103621, ncShort: 78229 },
      'AUD': { long: 59649, short: 93135, ncLong: 68678, ncShort: 38461 },
      'MXN': { long: 105727, short: 23702, ncLong: 112440, ncShort: 51021 },
      'NZD': { long: 8135, short: 53891, ncLong: 12239, ncShort: 22372 },
      'BRL': { long: 44473, short: 1677, ncLong: 23645, ncShort: 22729 },
      // Cross pairs - EURGBP from CFTC report
      'EURGBP': { long: 18940, short: 0, ncLong: 2843, ncShort: 4231 },
      // EURJPY from CFTC report
      'EURJPY': { long: 5084, short: 11710, ncLong: 1537, ncShort: 0 },
      // Derived cross pairs based on component positioning
      'GBPJPY': { long: 119661, short: 171372, ncLong: 110409, ncShort: 170969 },
      'GBPCAD': { long: 115308, short: 187198, ncLong: 88940, ncShort: 106549 },
      'AUDJPY': { long: 135453, short: 140716, ncLong: 112547, ncShort: 180980 },
      'EURAUD': { long: 614766, short: 244136, ncLong: 172299, ncShort: 116690 },
      'GBPAUD': { long: 103506, short: 216926, ncLong: 135218, ncShort: 66911 },
      'EURCAD': { long: 626568, short: 214408, ncLong: 126021, ncShort: 156328 },
      'NZDJPY': { long: 83939, short: 101472, ncLong: 56108, ncShort: 164891 },
      'CADJPY': { long: 147255, short: 110988, ncLong: 66269, ncShort: 220618 }
    };
    
    const data = positionData[item.currency] || { long: 0, short: 0, ncLong: 0, ncShort: 0 };
    
    const currencyDetail = {
      currency: item.currency,
      commercialLong: data.long,
      commercialShort: data.short,
      nonCommercialLong: data.ncLong,
      nonCommercialShort: data.ncShort,
      reportDate: '2026-01-21T00:00:00Z',
      weeklyChange: item.weeklyChange
    };
    
    console.log('Setting currency detail:', currencyDetail);
    setSelectedCurrency(currencyDetail);
    setIsDetailModalOpen(true);
  };

  // Generate data from uploaded COT data or fallback to mock data
  const generateData = (): WheelDataItem[] => {
    // Jan 21, 2026 CFTC Report (data as of Jan 13, 2026) - VERIFIED from uploaded PDF
    const majorPairs: WheelDataItem[] = [
      // EUR: NC Long 103,621 - NC Short 78,229 = +25,392 (Bullish)
      { currency: 'EUR', netPosition: 25392, strength: 25392, bias: 'BULLISH', weeklyChange: -25208, color: '#7EBF8E', type: 'major' },
      // GBP: NC Long 66,540 - NC Short 28,450 = +38,090 (Bullish)
      { currency: 'GBP', netPosition: 38090, strength: 38090, bias: 'BULLISH', weeklyChange: 9143, color: '#7EBF8E', type: 'major' },
      // JPY: NC Long 43,869 - NC Short 142,519 = -98,650 (Bearish) - STRONGEST BEARISH
      { currency: 'JPY', netPosition: -98650, strength: 98650, bias: 'BEARISH', weeklyChange: -35420, color: '#EF4444', type: 'major' },
      // CHF: NC Long 10,064 - NC Short 10,635 = -571 (Neutral)
      { currency: 'CHF', netPosition: -571, strength: 571, bias: 'NEUTRAL', weeklyChange: 669, color: '#8B8B8B', type: 'major' },
      // AUD: NC Long 68,678 - NC Short 38,461 = +30,217 (Bullish)
      { currency: 'AUD', netPosition: 30217, strength: 30217, bias: 'BULLISH', weeklyChange: -4898, color: '#7EBF8E', type: 'major' },
      // CAD: NC Long 22,400 - NC Short 78,099 = -55,699 (Bearish)
      { currency: 'CAD', netPosition: -55699, strength: 55699, bias: 'BEARISH', weeklyChange: 1397, color: '#EF4444', type: 'major' },
      // MXN: NC Long 112,440 - NC Short 51,021 = +61,419 (Bullish)
      { currency: 'MXN', netPosition: 61419, strength: 61419, bias: 'BULLISH', weeklyChange: -2096, color: '#7EBF8E', type: 'major' },
      // NZD: NC Long 12,239 - NC Short 22,372 = -10,133 (Bearish)
      { currency: 'NZD', netPosition: -10133, strength: 10133, bias: 'BEARISH', weeklyChange: 472, color: '#EF4444', type: 'major' }
    ];

    // Cross pairs - derived from component currencies and CFTC report
    const crossPairs: WheelDataItem[] = [
      // EURJPY: From report - NC Long 1,537 - NC Short 0 = +1,537 (Bullish)
      { currency: 'EURJPY', netPosition: 1537, strength: 1537, bias: 'BULLISH', weeklyChange: -297, color: '#7EBF8E', type: 'cross' },
      // GBPJPY: GBP bullish + JPY bearish = Strong Bullish on GBPJPY - STRONGEST CROSS
      { currency: 'GBPJPY', netPosition: 136740, strength: 136740, bias: 'BULLISH', weeklyChange: 44563, color: '#7EBF8E', type: 'cross' },
      // EURGBP: From report - NC Long 2,843 - NC Short 4,231 = -1,388 (Bearish)
      { currency: 'EURGBP', netPosition: -1388, strength: 1388, bias: 'BEARISH', weeklyChange: 0, color: '#EF4444', type: 'cross' },
      // GBPCAD: GBP bullish + CAD bearish = Bullish
      { currency: 'GBPCAD', netPosition: 93789, strength: 93789, bias: 'BULLISH', weeklyChange: 13746, color: '#7EBF8E', type: 'cross' },
      // AUDJPY: AUD bullish + JPY bearish = Bullish
      { currency: 'AUDJPY', netPosition: 128867, strength: 128867, bias: 'BULLISH', weeklyChange: 30522, color: '#7EBF8E', type: 'cross' },
      // EURAUD: EUR bullish + AUD bullish but EUR weaker
      { currency: 'EURAUD', netPosition: -4825, strength: 4825, bias: 'BEARISH', weeklyChange: -1792, color: '#EF4444', type: 'cross' },
      // GBPAUD: GBP bullish + AUD bullish but GBP stronger
      { currency: 'GBPAUD', netPosition: 7873, strength: 7873, bias: 'BULLISH', weeklyChange: 14041, color: '#7EBF8E', type: 'cross' },
      // EURCAD: EUR bullish + CAD bearish = Bullish
      { currency: 'EURCAD', netPosition: 81091, strength: 81091, bias: 'BULLISH', weeklyChange: 2087, color: '#7EBF8E', type: 'cross' },
      // NZDJPY: NZD bearish + JPY bearish but JPY more = Bullish
      { currency: 'NZDJPY', netPosition: 88517, strength: 88517, bias: 'BULLISH', weeklyChange: 35892, color: '#7EBF8E', type: 'cross' },
      // CADJPY: CAD bearish + JPY bearish but JPY more = Bullish
      { currency: 'CADJPY', netPosition: 42951, strength: 42951, bias: 'BULLISH', weeklyChange: 30817, color: '#7EBF8E', type: 'cross' }
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
          Click any pair to see detailed COT analysis and trading signals. Data from CFTC report Jan 21, 2026 (as of Jan 13).
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
          <h4 className="font-bold text-primary mb-2">Quick Summary - Jan 21, 2026 Report</h4>
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