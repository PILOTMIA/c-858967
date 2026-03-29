import NewsSentimentAnalysis from "@/components/NewsSentimentAnalysis";
import FundamentalNewsAnalysis from "@/components/FundamentalNewsAnalysis";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Market News</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-2xl mx-auto">
          Real-time sentiment analysis, central bank updates, and fundamental news — covering all of Q1 2026.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-10">
        <NewsSentimentAnalysis />
        <FundamentalNewsAnalysis />

        {/* Footer Info */}
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">Data Coverage</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            News data covers January through March 2026. Sentiment analysis aggregates 12+ central bank decisions and key economic events across 8 major currencies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default News;
