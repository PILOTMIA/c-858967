import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { fetchMarketNews } from "@/services/MarketNewsService";

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case "BULLISH":
      return <TrendingUp className="w-4 h-4 text-success" />;
    case "BEARISH":
      return <TrendingDown className="w-4 h-4 text-destructive" />;
    default:
      return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "BULLISH":
      return "text-success";
    case "BEARISH":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
};

const SentimentWidget = () => {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["marketNewsLive"],
    queryFn: fetchMarketNews,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const entries = Object.entries(data?.majorPairs || {});

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-foreground">Market Sentiment — Live</h3>
        {dataUpdatedAt > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date(dataUpdatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Live sentiment feed is refreshing. Values appear once headlines are scored.</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([pair, item]) => (
            <div key={pair} className="flex items-center justify-between">
              <span className="text-foreground text-sm font-medium font-mono">{pair}</span>
              <div className="flex items-center gap-2">
                {getSentimentIcon(item.sentiment)}
                <span className={`text-sm font-bold ${getSentimentColor(item.sentiment)}`}>{item.sentiment}</span>
                <span className="text-xs text-muted-foreground">{Math.round(item.score * 100)}%</span>
              </div>
            </div>
          ))}
          <p className="pt-2 text-[11px] text-muted-foreground border-t border-border">
            Scored from live macro headlines (GDELT, Investing.com, ForexLive, FXStreet, WSJ), last 72 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default SentimentWidget;
