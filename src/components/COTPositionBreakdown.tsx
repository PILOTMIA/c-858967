import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Building2, Users, BarChart3 } from 'lucide-react';

interface PositionData {
  currency: string;
  dealerLong: number;
  dealerShort: number;
  assetManagerLong: number;
  assetManagerShort: number;
  leveragedFundsLong: number;
  leveragedFundsShort: number;
  otherLong: number;
  otherShort: number;
  nonReportableLong: number;
  nonReportableShort: number;
  openInterest: number;
}

interface COTPositionBreakdownProps {
  data: PositionData;
}

const COTPositionBreakdown = ({ data }: COTPositionBreakdownProps) => {
  const calculateNetPosition = (long: number, short: number) => long - short;
  
  const positionCategories = [
    {
      name: 'Dealers/Intermediaries',
      icon: Building2,
      description: 'Commercial banks and dealers facilitating transactions',
      netPosition: calculateNetPosition(data.dealerLong, data.dealerShort),
      long: data.dealerLong,
      short: data.dealerShort,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Asset Managers',
      icon: BarChart3,
      description: 'Institutional investors, pension funds, insurance companies',
      netPosition: calculateNetPosition(data.assetManagerLong, data.assetManagerShort),
      long: data.assetManagerLong,
      short: data.assetManagerShort,
      color: 'hsl(var(--chart-2))'
    },
    {
      name: 'Leveraged Funds',
      icon: TrendingUp,
      description: 'Hedge funds and CTAs - THE SMART MONEY',
      netPosition: calculateNetPosition(data.leveragedFundsLong, data.leveragedFundsShort),
      long: data.leveragedFundsLong,
      short: data.leveragedFundsShort,
      color: 'hsl(var(--chart-3))',
      highlight: true
    },
    {
      name: 'Other Reportables',
      icon: Users,
      description: 'Other large traders required to report',
      netPosition: calculateNetPosition(data.otherLong, data.otherShort),
      long: data.otherLong,
      short: data.otherShort,
      color: 'hsl(var(--chart-4))'
    }
  ];

  const chartData = positionCategories.map(cat => ({
    name: cat.name.split(' ')[0],
    'Net Position': cat.netPosition,
    Long: cat.long,
    Short: -cat.short
  }));

  const formatNumber = (num: number) => {
    const abs = Math.abs(num);
    if (abs >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSentimentBadge = (netPosition: number) => {
    if (netPosition > 5000) return <Badge className="bg-success/20 text-success border-success/30">NET LONG</Badge>;
    if (netPosition < -5000) return <Badge className="bg-destructive/20 text-destructive border-destructive/30">NET SHORT</Badge>;
    return <Badge className="bg-muted/20 text-muted-foreground border-muted/30">NEUTRAL</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with Open Interest */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            📊 Position Breakdown: {data.currency}
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-lg font-bold text-foreground">
                Total Open Interest: <span className="text-primary">{formatNumber(data.openInterest)}</span> contracts
              </span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positionCategories.map((category) => {
          const Icon = category.icon;
          const percentOfOI = ((Math.abs(category.netPosition) / data.openInterest) * 100).toFixed(1);
          
          return (
            <Card 
              key={category.name}
              className={`border-2 transition-all duration-300 hover:shadow-xl ${
                category.highlight 
                  ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg' 
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.highlight ? 'bg-primary/20' : 'bg-muted/20'}`}>
                      <Icon className={`h-5 w-5 ${category.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        {category.name}
                        {category.highlight && (
                          <Badge className="bg-warning/20 text-warning border-warning/30 text-xs animate-pulse">
                            KEY
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Net Position */}
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <span className="text-sm font-medium">Net Position:</span>
                  <div className="flex items-center gap-2">
                    {getSentimentBadge(category.netPosition)}
                    <span className={`font-bold text-lg ${
                      category.netPosition > 0 ? 'text-success' : category.netPosition < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {category.netPosition > 0 ? '+' : ''}{formatNumber(category.netPosition)}
                    </span>
                  </div>
                </div>

                {/* Long/Short Breakdown */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-success/10 rounded border border-success/20">
                    <div className="text-xs text-success/80 font-medium">Long Positions</div>
                    <div className="text-lg font-bold text-success">{formatNumber(category.long)}</div>
                  </div>
                  <div className="p-2 bg-destructive/10 rounded border border-destructive/20">
                    <div className="text-xs text-destructive/80 font-medium">Short Positions</div>
                    <div className="text-lg font-bold text-destructive">{formatNumber(category.short)}</div>
                  </div>
                </div>

                {/* Percentage of Open Interest */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                  <strong>{percentOfOI}%</strong> of total open interest
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparative Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Net Positioning Comparison</CardTitle>
          <CardDescription>
            Green = Long bias | Red = Short bias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatNumber(value)}
                />
                <Legend />
                <Bar dataKey="Net Position" fill="hsl(var(--primary))">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry['Net Position'] > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trading Insight */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 text-primary mt-1" />
            <div>
              <h4 className="font-bold text-lg mb-2 text-foreground">💡 Smart Money Analysis</h4>
              <p className="text-sm text-foreground/90">
                <strong className="text-primary">Leveraged Funds (Hedge Funds)</strong> are the most important category to watch. 
                They are currently <strong className={
                  positionCategories[2].netPosition > 5000 ? 'text-success' : 
                  positionCategories[2].netPosition < -5000 ? 'text-destructive' : 
                  'text-warning'
                }>
                  {positionCategories[2].netPosition > 5000 ? 'NET LONG' : 
                   positionCategories[2].netPosition < -5000 ? 'NET SHORT' : 
                   'NEUTRAL'}
                </strong> {data.currency} with {formatNumber(Math.abs(positionCategories[2].netPosition))} contracts net position.
                {positionCategories[2].netPosition > 10000 && " This is a strong bullish signal."}
                {positionCategories[2].netPosition < -10000 && " This is a strong bearish signal."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default COTPositionBreakdown;
