import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

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
  // Calculate market-wide sentiment distribution
  const sentimentCounts = data.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Bullish', value: sentimentCounts.BULLISH || 0, color: 'hsl(var(--success))' },
    { name: 'Bearish', value: sentimentCounts.BEARISH || 0, color: 'hsl(var(--destructive))' },
    { name: 'Neutral', value: sentimentCounts.NEUTRAL || 0, color: 'hsl(var(--muted))' }
  ];

  // Find extreme positions
  const mostBullish = data.reduce((max, item) => 
    item.netPosition > max.netPosition ? item : max, data[0]);
  const mostBearish = data.reduce((min, item) => 
    item.netPosition < min.netPosition ? item : min, data[0]);
  
  // Find biggest weekly changes
  const biggestIncrease = data.reduce((max, item) => 
    item.weeklyChange > max.weeklyChange ? item : max, data[0]);
  const biggestDecrease = data.reduce((min, item) => 
    item.weeklyChange < min.weeklyChange ? item : min, data[0]);

  const formatLargeNumber = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Sentiment Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            📊 Market Sentiment Distribution
          </CardTitle>
          <CardDescription>
            Overall institutional positioning across all currency pairs
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
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            🎯 Key Market Insights
          </CardTitle>
          <CardDescription>
            Extreme positions and significant weekly changes
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
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Market Summary:</strong> Institutional money is showing {sentimentCounts.BULLISH > sentimentCounts.BEARISH ? 'net bullish' : 'net bearish'} sentiment across major currency pairs. 
              Watch {mostBullish.currency} for potential strength and {mostBearish.currency} for potential weakness.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default COTOverview;