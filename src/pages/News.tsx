import NewsSentimentAnalysis from "@/components/NewsSentimentAnalysis";
import FundamentalNewsAnalysis from "@/components/FundamentalNewsAnalysis";
import PageHeader from "@/components/PageHeader";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="news-readable hq-page space-y-8">
        <PageHeader eyebrow="Live intelligence" title="Market News" subtitle="Current sentiment, central-bank updates, yield drivers, currency headlines and gold news with source citations." />
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
