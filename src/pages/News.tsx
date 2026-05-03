import NewsSentimentAnalysis from "@/components/NewsSentimentAnalysis";
import FundamentalNewsAnalysis from "@/components/FundamentalNewsAnalysis";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Market News</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-2xl mx-auto">
          Live market sentiment, central bank updates, yield drivers, currency headlines, and gold news with source citations.
        </p>
      </div>

      <div className="news-readable max-w-7xl mx-auto px-4 pb-16 space-y-10">
        <NewsSentimentAnalysis />
        <FundamentalNewsAnalysis />

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">Data Coverage</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Articles are pulled from live market-news sources through the backend feed. The site checks for fresh data continuously in-app and supports the daily 2:00 PM and 3:00 PM Arizona refresh windows.
          </p>
        </div>
      </div>
    </div>
  );
};

export default News;
