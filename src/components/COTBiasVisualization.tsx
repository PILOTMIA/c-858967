import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
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
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2 font-extrabold text-2xl">
          📊 Institutional Positioning Strength
        </CardTitle>
        <CardDescription className="font-medium text-base">
          Visual analysis of hedge fund and institutional trader bias across major currency pairs. 
          Positive bars = bullish positioning, negative bars = bearish positioning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-lg mb-6 border-2 border-primary/30">
          <p className="text-base font-bold text-foreground mb-3">
            <strong className="text-primary text-lg">📖 How to Read This Chart:</strong>
          </p>
          <div className="space-y-2 text-sm font-semibold">
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 bg-success rounded"></span>
              <span className="text-foreground">Bars extending <span className="text-success font-extrabold text-base">RIGHT (positive)</span> = Institutions are <span className="text-success font-extrabold text-base">BUYING</span> that currency</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 bg-destructive rounded"></span>
              <span className="text-foreground">Bars extending <span className="text-destructive font-extrabold text-base">LEFT (negative)</span> = Institutions are <span className="text-destructive font-extrabold text-base">SELLING</span> that currency</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-4 h-4 bg-primary rounded"></span>
              <span className="text-foreground"><span className="font-extrabold text-base">Longer bars</span> = Stronger institutional conviction & positioning</span>
            </p>
          </div>
        </div>
        
        <div className="h-80 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                type="number"
                stroke="hsl(var(--foreground))"
                fontSize={14}
                fontWeight={700}
                tickFormatter={(value) => value.toLocaleString()}
                label={{ value: 'Net Position (Contracts)', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--foreground))', fontWeight: 700, fontSize: 14 } }}
              />
              <YAxis 
                type="category"
                dataKey="currency"
                stroke="hsl(var(--foreground))"
                fontSize={16}
                fontWeight={900}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Net Position']}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '2px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              />
              <ReferenceLine x={0} stroke="hsl(var(--foreground))" strokeWidth={2} strokeDasharray="3 3" />
              
              <Bar 
                dataKey="netPosition" 
                fill="hsl(var(--primary))"
                radius={[0, 8, 8, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.netPosition > 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Bias Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div 
              key={item.currency}
              className="bg-card/90 dark:bg-card/95 backdrop-blur-sm rounded-lg p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:border-primary/60"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl text-foreground">{item.currency}</span>
                  {getBiasIcon(item.bias)}
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  item.bias === 'BULLISH' ? 'bg-success/20 text-success border-success/30' :
                  item.bias === 'BEARISH' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                  'bg-muted/20 text-muted-foreground border-muted-foreground/30'
                }`}>
                  {item.bias}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground font-semibold">Net Position:</span>
                  <span className={`font-mono font-extrabold text-base ${
                    item.netPosition > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {item.netPosition > 0 ? '+' : ''}{item.netPosition.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground font-semibold">Weekly Change:</span>
                  <span className={`font-mono font-extrabold text-base ${
                    item.weeklyChange > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {item.weeklyChange > 0 ? '+' : ''}{item.weeklyChange.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-1 border-t border-border/30 mt-2 pt-2">
                  <span className="text-muted-foreground font-semibold">Current Price:</span>
                  <span className="font-mono font-extrabold text-base text-foreground">
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