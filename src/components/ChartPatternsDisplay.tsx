import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface ChartPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  description: string;
  howToTrade: string;
  imageUrl: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ChartPatternsDisplayProps {
  tradingStyle: 'conservative' | 'moderate' | 'aggressive';
}

const ChartPatternsDisplay = ({ tradingStyle }: ChartPatternsDisplayProps) => {
  // Chart patterns based on trading style
  const allPatterns: ChartPattern[] = [
    {
      name: "Double Bottom",
      type: 'bullish',
      description: "A reversal pattern that signals a potential uptrend after two consecutive lows at approximately the same level.",
      howToTrade: "Enter long when price breaks above the neckline (resistance between the two bottoms). Set stop-loss below the second bottom.",
      imageUrl: "https://www.investopedia.com/thmb/5q3Y8YPvlXZ3u7lWPZQB1T6w_Tc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/DOUBLE-BOTTOM-01-e56f54ca8df44c479a6d8d8b92b98e95.png",
      difficulty: 'beginner'
    },
    {
      name: "Head and Shoulders",
      type: 'bearish',
      description: "A reversal pattern with three peaks - the middle peak (head) being highest, flanked by two lower peaks (shoulders).",
      howToTrade: "Enter short when price breaks below the neckline. Target is typically the distance from head to neckline projected downward.",
      imageUrl: "https://www.investopedia.com/thmb/Zy_v9g-Z7T1-O0IqSZYH3C9Qz2I=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/HEAD-SHOULDERS-01-13b47b62247b4c2ab1c5a7ca7a2bc4cc.png",
      difficulty: 'intermediate'
    },
    {
      name: "Bull Flag",
      type: 'bullish',
      description: "A continuation pattern showing a strong upward move (pole) followed by a consolidation (flag) before resuming upward.",
      howToTrade: "Enter long when price breaks above the flag's upper trendline. Target equals the length of the pole.",
      imageUrl: "https://www.investopedia.com/thmb/XYMJrZkXZZQ1Q2Q2Q2Q2Q2Q2Q2Q=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/BullFlag-5c6f1c4646e0fb0001f2b3b3.png",
      difficulty: 'beginner'
    },
    {
      name: "Ascending Triangle",
      type: 'bullish',
      description: "A continuation pattern with a flat resistance line and rising support, indicating buyers are becoming more aggressive.",
      howToTrade: "Enter long on breakout above resistance. Stop-loss below the most recent swing low within the triangle.",
      imageUrl: "https://www.investopedia.com/thmb/GvCQB7QoJY2Y2Y2Y2Y2Y2Y2Y2Y2=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/AscendingTriangle.png",
      difficulty: 'intermediate'
    },
    {
      name: "Descending Triangle",
      type: 'bearish',
      description: "A continuation pattern with flat support and declining resistance, showing sellers are becoming more aggressive.",
      howToTrade: "Enter short on breakdown below support. Target is the height of the triangle projected downward.",
      imageUrl: "https://www.investopedia.com/thmb/HvCQB7QoJY3Y3Y3Y3Y3Y3Y3Y3Y3=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/DescendingTriangle.png",
      difficulty: 'intermediate'
    },
    {
      name: "Wedge Pattern",
      type: 'neutral',
      description: "Converging trendlines that can be rising (bearish) or falling (bullish). Shows compression before a breakout.",
      howToTrade: "Wait for breakout direction. Rising wedge breaks down, falling wedge breaks up. Trade in breakout direction.",
      imageUrl: "https://www.investopedia.com/thmb/JvCQB7QoJY4Y4Y4Y4Y4Y4Y4Y4Y4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/WedgePattern.png",
      difficulty: 'advanced'
    },
    {
      name: "Cup and Handle",
      type: 'bullish',
      description: "A bullish continuation pattern resembling a teacup. The cup forms a U-shape, followed by a smaller consolidation (handle).",
      howToTrade: "Enter long when price breaks above the handle's resistance. Target is the depth of the cup projected upward.",
      imageUrl: "https://www.investopedia.com/thmb/KvCQB7QoJY5Y5Y5Y5Y5Y5Y5Y5Y5=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/CupHandle.png",
      difficulty: 'advanced'
    },
    {
      name: "Triple Top",
      type: 'bearish',
      description: "A reversal pattern with three peaks at roughly the same level, indicating strong resistance that bulls cannot break.",
      howToTrade: "Enter short when price breaks below support. Very reliable pattern for aggressive traders.",
      imageUrl: "https://www.investopedia.com/thmb/LvCQB7QoJY6Y6Y6Y6Y6Y6Y6Y6Y6=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/TripleTop.png",
      difficulty: 'intermediate'
    }
  ];

  // Filter patterns based on trading style
  const getPatternsByStyle = () => {
    switch (tradingStyle) {
      case 'conservative':
        return allPatterns.filter(p => p.difficulty === 'beginner' && p.type === 'bullish');
      case 'moderate':
        return allPatterns.filter(p => p.difficulty !== 'advanced');
      case 'aggressive':
        return allPatterns;
      default:
        return allPatterns.slice(0, 4);
    }
  };

  const patterns = getPatternsByStyle();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      bullish: 'bg-green-500/10 text-green-500 border-green-500/30',
      bearish: 'bg-red-500/10 text-red-500 border-red-500/30',
      neutral: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    };
    return colors[type as keyof typeof colors] || colors.neutral;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      intermediate: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      advanced: 'bg-orange-500/10 text-orange-500 border-orange-500/30'
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <h3 className="text-lg font-bold text-foreground mb-2">
          📈 Chart Patterns for {tradingStyle.charAt(0).toUpperCase() + tradingStyle.slice(1)} Traders
        </h3>
        <p className="text-sm text-muted-foreground">
          {tradingStyle === 'conservative' && "Showing beginner-friendly bullish patterns with high probability setups."}
          {tradingStyle === 'moderate' && "Showing beginner and intermediate patterns for balanced risk/reward."}
          {tradingStyle === 'aggressive' && "Showing all patterns including advanced setups for maximum opportunities."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {patterns.map((pattern, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(pattern.type)}
                  <CardTitle className="text-lg">{pattern.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getTypeBadge(pattern.type)}>
                    {pattern.type}
                  </Badge>
                  <Badge variant="outline" className={getDifficultyBadge(pattern.difficulty)}>
                    {pattern.difficulty}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-sm">
                {pattern.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pattern Image Placeholder */}
              <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {pattern.type === 'bullish' ? '📈' : pattern.type === 'bearish' ? '📉' : '↔️'}
                  </div>
                  <p className="text-xs text-muted-foreground">{pattern.name} Pattern</p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-semibold text-sm text-foreground mb-1">How to Trade:</h4>
                <p className="text-xs text-muted-foreground">{pattern.howToTrade}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Chart patterns are educational guides. Always use proper risk management and confirm with other analysis.</p>
      </div>
    </div>
  );
};

export default ChartPatternsDisplay;
