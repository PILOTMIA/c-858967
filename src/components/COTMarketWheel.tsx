import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useCOTData } from './COTDataContext';

// Helper function to format currency pairs properly
const formatCurrencyPair = (currency: string): string => {
  const usdBasePairs = ['JPY', 'CAD', 'MXN', 'CHF'];
  return usdBasePairs.includes(currency) ? `USD/${currency}` : `${currency}/USD`;
};

const COTMarketWheel = () => {
  const { cotData, lastUpdated, setSelectedCurrency, setIsDetailModalOpen } = useCOTData();

  const handleCurrencyClick = (item: any) => {
    const currencyData = cotData.find(d => d.currency === item.currency);
    
    setSelectedCurrency({
      currency: item.currency,
      commercialLong: currencyData?.commercialLong || 0,
      commercialShort: currencyData?.commercialShort || 0,
      nonCommercialLong: currencyData?.nonCommercialLong || (item.netPosition > 0 ? item.netPosition : 0),
      nonCommercialShort: currencyData?.nonCommercialShort || (item.netPosition < 0 ? Math.abs(item.netPosition) : 0),
      reportDate: new Date().toISOString(),
      weeklyChange: item.weeklyChange
    });
    setIsDetailModalOpen(true);
  };

  // Generate wheel data from uploaded COT data or fallback to mock data
  const generateWheelData = () => {
    if (cotData.length > 0) {
      return cotData.map(item => {
        const netPosition = item.nonCommercialLong - item.nonCommercialShort;
        const strength = Math.abs(netPosition);
        
        return {
          currency: item.currency,
          netPosition,
          strength,
          bias: netPosition > 5000 ? 'BULLISH' : netPosition < -5000 ? 'BEARISH' : 'NEUTRAL',
          weeklyChange: item.weeklyChange,
          color: netPosition > 5000 ? '#7EBF8E' : netPosition < -5000 ? '#EF4444' : '#8B8B8B'
        };
      });
    }

    // Nov 4th, 2025 CFTC data
    return [
      { currency: 'EUR', netPosition: 32145, strength: 32145, bias: 'BULLISH', weeklyChange: 2472, color: '#7EBF8E' },
      { currency: 'GBP', netPosition: 24893, strength: 24893, bias: 'BULLISH', weeklyChange: 3214, color: '#7EBF8E' },
      { currency: 'JPY', netPosition: -61287, strength: 61287, bias: 'BEARISH', weeklyChange: -4844, color: '#EF4444' },
      { currency: 'CHF', netPosition: -2341, strength: 2341, bias: 'NEUTRAL', weeklyChange: -3756, color: '#8B8B8B' },
      { currency: 'AUD', netPosition: -15223, strength: 15223, bias: 'BEARISH', weeklyChange: -4870, color: '#EF4444' },
      { currency: 'CAD', netPosition: -49915, strength: 49915, bias: 'BEARISH', weeklyChange: -5886, color: '#EF4444' },
      { currency: 'MXN', netPosition: 38423, strength: 38423, bias: 'BULLISH', weeklyChange: 4073, color: '#7EBF8E' }
    ];
  };

  const wheelData = generateWheelData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-lg">
          <div className="font-bold text-popover-foreground">{formatCurrencyPair(data.currency)}</div>
          <div className={`font-mono ${data.netPosition > 0 ? 'text-success' : 'text-destructive'}`}>
            Net Position: {data.netPosition > 0 ? '+' : ''}{data.netPosition.toLocaleString()}
          </div>
          <div className={`font-mono ${data.weeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
            Weekly Change: {data.weeklyChange > 0 ? '+' : ''}{data.weeklyChange.toLocaleString()}
          </div>
          <div className="text-popover-foreground/70 text-sm">
            Bias: <span className={`font-bold ${
              data.bias === 'BULLISH' ? 'text-success' : 
              data.bias === 'BEARISH' ? 'text-destructive' : 
              'text-popover-foreground/60'
            }`}>{data.bias}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2 font-display">
          🎯 COT Market Positioning Wheel
        </CardTitle>
        <CardDescription className="font-medium">
          Interactive wheel showing institutional positioning strength across all currency pairs
          {lastUpdated && (
            <div className="text-xs text-success mt-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          )}
          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-xs text-primary font-semibold flex items-center gap-2">
              💡 Click any currency pair to see detailed COT analysis and trading signals
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Interactive Pie Chart Wheel */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={wheelData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={40}
                paddingAngle={2}
                dataKey="strength"
                onClick={(entry) => handleCurrencyClick(entry)}
              >
                {wheelData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="hsl(var(--border))"
                  strokeWidth={2}
                  className="hover:opacity-80 hover:scale-105 cursor-pointer transition-all duration-200"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
                />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Analysis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {wheelData.map((item) => (
            <div 
              key={item.currency}
              onClick={() => handleCurrencyClick(item)}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer relative group ${
                item.bias === 'BULLISH' 
                  ? 'bg-success/10 border-success/30 hover:bg-success/20' 
                  : item.bias === 'BEARISH'
                  ? 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20'
                  : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-foreground">{formatCurrencyPair(item.currency)}</span>
                {item.bias === 'BULLISH' ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : item.bias === 'BEARISH' ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net:</span>
                  <span className={`font-mono font-bold ${
                    item.netPosition > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {item.netPosition > 0 ? '+' : ''}{(item.netPosition / 1000).toFixed(1)}K
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change:</span>
                  <span className={`font-mono font-bold ${
                    item.weeklyChange > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {item.weeklyChange > 0 ? '+' : ''}{(item.weeklyChange / 1000).toFixed(1)}K
                  </span>
                </div>
                
                <Badge 
                  variant="secondary" 
                  className={`text-xs w-full justify-center mt-2 ${
                    item.bias === 'BULLISH' ? 'bg-success/20 text-success' :
                    item.bias === 'BEARISH' ? 'bg-destructive/20 text-destructive' :
                    'bg-muted/20 text-muted-foreground'
                  }`}
                >
                  {item.bias}
                </Badge>
                <div className="text-[10px] text-center text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click for details →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Summary */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
          <h4 className="font-bold text-primary mb-2">Market Summary</h4>
          <div className="text-sm text-foreground space-y-1">
            <p><strong>Most Bullish:</strong> {formatCurrencyPair(wheelData.find(d => d.netPosition === Math.max(...wheelData.map(d => d.netPosition)))?.currency || '')} 
              (+{Math.max(...wheelData.map(d => d.netPosition)).toLocaleString()})</p>
            <p><strong>Most Bearish:</strong> {formatCurrencyPair(wheelData.find(d => d.netPosition === Math.min(...wheelData.map(d => d.netPosition)))?.currency || '')}
              ({Math.min(...wheelData.map(d => d.netPosition)).toLocaleString()})</p>
            <p className="text-muted-foreground text-xs mt-2">
              🔄 Wheel updates automatically when new COT data is uploaded
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default COTMarketWheel;