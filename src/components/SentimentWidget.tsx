
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
  // Mock sentiment data - in production you'd use APIs like ForexFactory, MyFxBook, etc.
  return [
    { pair: 'EURUSD', bullish: 65, bearish: 25, neutral: 10, overall: 'BULLISH' },
    { pair: 'GBPUSD', bullish: 35, bearish: 55, neutral: 10, overall: 'BEARISH' },
    { pair: 'USDJPY', bullish: 70, bearish: 20, neutral: 10, overall: 'BULLISH' },
    { pair: 'USDCHF', bullish: 45, bearish: 45, neutral: 10, overall: 'NEUTRAL' },
    { pair: 'AUDUSD', bullish: 40, bearish: 50, neutral: 10, overall: 'BEARISH' },
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
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'BEARISH':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return 'text-green-400';
      case 'BEARISH':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Market Sentiment</h3>
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sentimentData?.map((item) => (
            <div key={item.pair} className="flex items-center justify-between">
              <span className="text-gray-300 text-sm font-medium">{item.pair}</span>
              <div className="flex items-center gap-2">
                {getSentimentIcon(item.overall)}
                <span className={`text-sm font-bold ${getSentimentColor(item.overall)}`}>
                  {item.overall}
                </span>
                <span className="text-xs text-gray-500">
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
