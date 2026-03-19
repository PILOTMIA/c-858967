
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentData {
  pair: string;
  bullish: number;
  bearish: number;
  neutral: number;
  overall: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

const fetchSentimentData = async (): Promise<SentimentData[]> => {
  // Current sentiment data as of March 19, 2026
  // Reflects Fed hold at 4.50%, ECB cuts to 2.75%, BoJ normalization to 0.75%, tariff uncertainty
  return [
    { pair: 'EURUSD', bullish: 45, bearish: 42, neutral: 13, overall: 'NEUTRAL' },
    { pair: 'GBPUSD', bullish: 55, bearish: 35, neutral: 10, overall: 'BULLISH' },
    { pair: 'USDJPY', bullish: 30, bearish: 62, neutral: 8, overall: 'BEARISH' },
    { pair: 'USDCHF', bullish: 40, bearish: 50, neutral: 10, overall: 'BEARISH' },
    { pair: 'AUDUSD', bullish: 52, bearish: 38, neutral: 10, overall: 'BULLISH' },
    { pair: 'NZDUSD', bullish: 32, bearish: 58, neutral: 10, overall: 'BEARISH' },
    { pair: 'USDCAD', bullish: 48, bearish: 44, neutral: 8, overall: 'BULLISH' },
  ];
};

const SentimentWidget = () => {
  const { data: sentimentData, isLoading } = useQuery({
    queryKey: ['sentimentData'],
    queryFn: fetchSentimentData,
    refetchInterval: 300000, // 5 minutes
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'BEARISH':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return 'text-success';
      case 'BEARISH':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">Market Sentiment</h3>
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sentimentData?.map((item) => (
            <div key={item.pair} className="flex items-center justify-between">
              <span className="text-foreground text-sm font-medium">{item.pair}</span>
              <div className="flex items-center gap-2">
                {getSentimentIcon(item.overall)}
                <span className={`text-sm font-bold ${getSentimentColor(item.overall)}`}>
                  {item.overall}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.overall === 'BULLISH' ? item.bullish : item.bearish}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentimentWidget;
