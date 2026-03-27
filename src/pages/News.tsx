import NewsSentimentAnalysis from "@/components/NewsSentimentAnalysis";
import CentralBankNewsTracker from "@/components/CentralBankNewsTracker";
import FundamentalNewsAnalysis from "@/components/FundamentalNewsAnalysis";
import { Newspaper } from "lucide-react";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Newspaper className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Market News Center
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Real-time sentiment analysis, central bank updates, and fundamental news — covering all of Q1 2026.
          </p>
        </div>

        {/* News Sections */}
        <div className="space-y-8">
          <section>
            <NewsSentimentAnalysis />
          </section>

          <section>
            <FundamentalNewsAnalysis />
          </section>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
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
