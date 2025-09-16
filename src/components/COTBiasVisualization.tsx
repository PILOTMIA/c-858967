import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

interface COTBiasData {
  currency: string;
  netPosition: number;
  positioningStrength: number;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  weeklyChange: number;
  currentPrice: number;
}

interface COTBiasVisualizationProps {
  data: COTBiasData[];
}

const COTBiasVisualization = ({ data }: COTBiasVisualizationProps) => {
  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'BULLISH': return 'hsl(var(--success))';
      case 'BEARISH': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--muted))';
    }
  };

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case 'BULLISH': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'BEARISH': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <div className="w-4 h-4 bg-muted rounded-full"></div>;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          📊 Currency Pair Bias Overview
        </CardTitle>
        <CardDescription>
          Institutional positioning strength across all major currency pairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                type="category"
                dataKey="currency"
                stroke="hsl(var(--foreground))"
                fontSize={12}
                width={60}
              />
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Net Position']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              
              <Bar 
                dataKey="netPosition" 
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bias Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((item) => (
            <div 
              key={item.currency}
              className="bg-background/50 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{item.currency}</span>
                  {getBiasIcon(item.bias)}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.bias === 'BULLISH' ? 'bg-success/20 text-success' :
                  item.bias === 'BEARISH' ? 'bg-destructive/20 text-destructive' :
                  'bg-muted/20 text-muted-foreground'
                }`}>
                  {item.bias}
                </span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Position:</span>
                  <span className={`font-mono font-bold ${
                    item.netPosition > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {item.netPosition > 0 ? '+' : ''}{item.netPosition.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly Change:</span>
                  <span className={`font-mono font-bold ${
                    item.weeklyChange > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {item.weeklyChange > 0 ? '+' : ''}{item.weeklyChange.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price:</span>
                  <span className="font-mono font-bold text-foreground">
                    {item.currentPrice.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default COTBiasVisualization;