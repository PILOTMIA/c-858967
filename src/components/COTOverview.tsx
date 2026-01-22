import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
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

interface COTOverviewProps {
  data: Array<{
    currency: string;
    netPosition: number;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    weeklyChange: number;
    commercialLong: number;
    commercialShort: number;
    nonCommercialLong: number;
    nonCommercialShort: number;
  }>;
}

const COTOverview = ({ data }: COTOverviewProps) => {
  const { cotData, lastUpdated, isDataLoading, setSelectedCurrency, setIsDetailModalOpen } = useCOTData();
  
  // Use uploaded data if available, otherwise use prop data
  const workingData = cotData.length > 0 ? cotData.map(item => {
    const netPosition = item.nonCommercialLong - item.nonCommercialShort;
    const sentiment = netPosition > 5000 ? 'BULLISH' : netPosition < -5000 ? 'BEARISH' : 'NEUTRAL';
    
    return {
      currency: item.currency,
      netPosition,
      sentiment,
      weeklyChange: item.weeklyChange,
      commercialLong: item.commercialLong,
      commercialShort: item.commercialShort,
      nonCommercialLong: item.nonCommercialLong,
      nonCommercialShort: item.nonCommercialShort,
    };
  }) : data;
  // Calculate market-wide sentiment distribution
  const sentimentCounts = workingData.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find extreme positions
  const mostBullish = workingData.reduce((max, item) => 
    item.netPosition > max.netPosition ? item : max, workingData[0]);
  const mostBearish = workingData.reduce((min, item) => 
    item.netPosition < min.netPosition ? item : min, workingData[0]);
  
  // Find biggest weekly changes
  const biggestIncrease = workingData.reduce((max, item) => 
    item.weeklyChange > max.weeklyChange ? item : max, workingData[0]);
  const biggestDecrease = workingData.reduce((min, item) => 
    item.weeklyChange < min.weeklyChange ? item : min, workingData[0]);

  const formatLargeNumber = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Sentiment Distribution */}
      <Card className="bg-card border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2 font-display">
            📊 Market Sentiment Distribution
            {isDataLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </CardTitle>
          <CardDescription className="font-medium">
            Overall institutional positioning across all currency pairs
            {lastUpdated && (
              <div className="text-xs text-success mt-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sentiment Bars */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm font-medium text-foreground">Bullish</span>
                </div>
                <span className="text-2xl font-bold text-success">{sentimentCounts.BULLISH || 0}</span>
              </div>
              <Progress 
                value={workingData.length > 0 ? ((sentimentCounts.BULLISH || 0) / workingData.length) * 100 : 0} 
                className="h-3 bg-muted [&>div]:bg-success"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-sm font-medium text-foreground">Bearish</span>
                </div>
                <span className="text-2xl font-bold text-destructive">{sentimentCounts.BEARISH || 0}</span>
              </div>
              <Progress 
                value={workingData.length > 0 ? ((sentimentCounts.BEARISH || 0) / workingData.length) * 100 : 0} 
                className="h-3 bg-muted [&>div]:bg-destructive"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                  <span className="text-sm font-medium text-foreground">Neutral</span>
                </div>
                <span className="text-2xl font-bold text-muted-foreground">{sentimentCounts.NEUTRAL || 0}</span>
              </div>
              <Progress 
                value={workingData.length > 0 ? ((sentimentCounts.NEUTRAL || 0) / workingData.length) * 100 : 0} 
                className="h-3 bg-muted [&>div]:bg-muted-foreground"
              />
            </div>
          </div>

          {/* Total Pairs */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-foreground">{workingData.length}</div>
            <div className="text-sm text-muted-foreground">Total Currency Pairs Tracked</div>
          </div>
        </CardContent>
      </Card>

      {/* Key Market Insights */}
      <Card className="bg-card border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2 font-display">
            🎯 Key Market Insights
            {isDataLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            )}
          </CardTitle>
          <CardDescription className="font-medium">
            Extreme positions and significant weekly changes - Updates automatically with new data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Most Extreme Positions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Extreme Positions
            </h4>
            
          <div className="grid grid-cols-1 gap-2">
              <div 
                onClick={() => {
                  setSelectedCurrency({
                    currency: mostBullish.currency,
                    commercialLong: mostBullish.commercialLong,
                    commercialShort: mostBullish.commercialShort,
                    nonCommercialLong: mostBullish.nonCommercialLong,
                    nonCommercialShort: mostBullish.nonCommercialShort,
                    reportDate: '2026-01-21T00:00:00Z',
                    weeklyChange: mostBullish.weeklyChange
                  });
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20 cursor-pointer hover:bg-success/20 hover:shadow-lg transition-all animate-pulse-slow"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-success/20 text-success animate-pulse">
                    Most Bullish
                  </Badge>
                  <span className="font-bold text-success">{formatCurrencyPair(mostBullish.currency)}</span>
                  {Math.abs(mostBullish.weeklyChange) > 5000 && (
                    <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                      🔥 HOT
                    </Badge>
                  )}
                </div>
                <span className="font-mono text-success font-bold text-lg">
                  +{formatLargeNumber(mostBullish.netPosition)}
                </span>
              </div>

              <div 
                onClick={() => {
                  setSelectedCurrency({
                    currency: mostBearish.currency,
                    commercialLong: mostBearish.commercialLong,
                    commercialShort: mostBearish.commercialShort,
                    nonCommercialLong: mostBearish.nonCommercialLong,
                    nonCommercialShort: mostBearish.nonCommercialShort,
                    reportDate: '2026-01-21T00:00:00Z',
                    weeklyChange: mostBearish.weeklyChange
                  });
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20 cursor-pointer hover:bg-destructive/20 hover:shadow-lg transition-all animate-pulse-slow"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-destructive/20 text-destructive animate-pulse">
                    Most Bearish
                  </Badge>
                  <span className="font-bold text-destructive">{formatCurrencyPair(mostBearish.currency)}</span>
                  {Math.abs(mostBearish.weeklyChange) > 5000 && (
                    <Badge className="bg-warning/20 text-warning border-warning/30 text-xs">
                      🔥 HOT
                    </Badge>
                  )}
                </div>
                <span className="font-mono text-destructive font-bold text-lg">
                  {formatLargeNumber(mostBearish.netPosition)}
                </span>
              </div>
            </div>
          </div>

          {/* Biggest Weekly Changes */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Biggest Weekly Changes
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              <div 
                onClick={() => {
                  setSelectedCurrency({
                    currency: biggestIncrease.currency,
                    commercialLong: biggestIncrease.commercialLong,
                    commercialShort: biggestIncrease.commercialShort,
                    nonCommercialLong: biggestIncrease.nonCommercialLong,
                    nonCommercialShort: biggestIncrease.nonCommercialShort,
                    reportDate: '2026-01-21T00:00:00Z',
                    weeklyChange: biggestIncrease.weeklyChange
                  });
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary/30 cursor-pointer hover:bg-primary/20 hover:shadow-lg transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-shimmer"></div>
                <div className="flex items-center gap-2 relative z-10">
                  <Badge variant="secondary" className="bg-primary/20 text-primary animate-pulse">
                    📈 Largest Increase
                  </Badge>
                  <span className="font-bold text-primary">{formatCurrencyPair(biggestIncrease.currency)}</span>
                  <Badge className="bg-success/20 text-success border-success/30 text-xs">
                    NEW UPDATE
                  </Badge>
                </div>
                <span className="font-mono text-primary font-bold text-lg relative z-10">
                  +{formatLargeNumber(biggestIncrease.weeklyChange)}
                </span>
              </div>

              <div 
                onClick={() => {
                  setSelectedCurrency({
                    currency: biggestDecrease.currency,
                    commercialLong: biggestDecrease.commercialLong,
                    commercialShort: biggestDecrease.commercialShort,
                    nonCommercialLong: biggestDecrease.nonCommercialLong,
                    nonCommercialShort: biggestDecrease.nonCommercialShort,
                    reportDate: '2026-01-21T00:00:00Z',
                    weeklyChange: biggestDecrease.weeklyChange
                  });
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border-2 border-warning/30 cursor-pointer hover:bg-warning/20 hover:shadow-lg transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-warning/0 via-warning/10 to-warning/0 animate-shimmer"></div>
                <div className="flex items-center gap-2 relative z-10">
                  <Badge variant="secondary" className="bg-warning/20 text-warning animate-pulse">
                    📉 Largest Decrease
                  </Badge>
                  <span className="font-bold text-warning">{formatCurrencyPair(biggestDecrease.currency)}</span>
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                    NEW UPDATE
                  </Badge>
                </div>
                <span className="font-mono text-warning font-bold text-lg relative z-10">
                  {formatLargeNumber(biggestDecrease.weeklyChange)}
                </span>
              </div>
            </div>
          </div>

          {/* Market Summary with prominent update indicator */}
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30 relative overflow-hidden">
            {lastUpdated && (
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-ping"></div>
                <Badge className="bg-success/20 text-success border-success/30 text-xs animate-pulse">
                  LIVE
                </Badge>
              </div>
            )}
            <p className="text-sm font-medium text-foreground">
              <strong className="text-primary">🔄 Auto-Updating Market Summary:</strong> Institutional money is showing {sentimentCounts.BULLISH > sentimentCounts.BEARISH ? 'net bullish' : 'net bearish'} sentiment across major currency pairs. 
              Watch <span className="font-bold text-success">{mostBullish ? formatCurrencyPair(mostBullish.currency) : 'N/A'}</span> for potential strength and <span className="font-bold text-destructive">{mostBearish ? formatCurrencyPair(mostBearish.currency) : 'N/A'}</span> for potential weakness.
              {lastUpdated && (
                <span className="block text-xs text-success mt-3 font-semibold bg-success/10 p-2 rounded border border-success/20">
                  ✨ Last Updated: {lastUpdated.toLocaleTimeString()} • All visualizations sync automatically with uploaded data
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default COTOverview;