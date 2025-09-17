import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useCOTData } from './COTDataContext';

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
  const { cotData, lastUpdated, isDataLoading } = useCOTData();
  
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

  const pieData = [
    { name: 'Bullish', value: sentimentCounts.BULLISH || 0, color: 'hsl(var(--success))' },
    { name: 'Bearish', value: sentimentCounts.BEARISH || 0, color: 'hsl(var(--destructive))' },
    { name: 'Neutral', value: sentimentCounts.NEUTRAL || 0, color: 'hsl(var(--muted))' }
  ];

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
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Currency Pairs']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{sentimentCounts.BULLISH || 0}</div>
              <div className="text-xs text-muted-foreground">Bullish</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{sentimentCounts.BEARISH || 0}</div>
              <div className="text-xs text-muted-foreground">Bearish</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{sentimentCounts.NEUTRAL || 0}</div>
              <div className="text-xs text-muted-foreground">Neutral</div>
            </div>
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
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    Most Bullish
                  </Badge>
                  <span className="font-bold text-success">{mostBullish.currency}</span>
                </div>
                <span className="font-mono text-success font-bold">
                  +{formatLargeNumber(mostBullish.netPosition)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                    Most Bearish
                  </Badge>
                  <span className="font-bold text-destructive">{mostBearish.currency}</span>
                </div>
                <span className="font-mono text-destructive font-bold">
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
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Largest Increase
                  </Badge>
                  <span className="font-bold text-primary">{biggestIncrease.currency}</span>
                </div>
                <span className="font-mono text-primary font-bold">
                  +{formatLargeNumber(biggestIncrease.weeklyChange)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-warning/20 text-warning">
                    Largest Decrease
                  </Badge>
                  <span className="font-bold text-warning">{biggestDecrease.currency}</span>
                </div>
                <span className="font-mono text-warning font-bold">
                  {formatLargeNumber(biggestDecrease.weeklyChange)}
                </span>
              </div>
            </div>
          </div>

          {/* Market Summary */}
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-foreground">
              <strong className="text-primary">Auto-Updating Market Summary:</strong> Institutional money is showing {sentimentCounts.BULLISH > sentimentCounts.BEARISH ? 'net bullish' : 'net bearish'} sentiment across major currency pairs. 
              Watch {mostBullish?.currency || 'N/A'} for potential strength and {mostBearish?.currency || 'N/A'} for potential weakness.
              {lastUpdated && (
                <span className="block text-xs text-success mt-2">
                  🔄 All analysis updates automatically when new COT data is uploaded
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