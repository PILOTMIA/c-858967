import NewsSentimentAnalysis from "@/components/NewsSentimentAnalysis";
import CentralBankNewsTracker from "@/components/CentralBankNewsTracker";
import FundamentalNewsAnalysis from "@/components/FundamentalNewsAnalysis";
import { Newspaper, Globe, TrendingUp } from "lucide-react";

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">
              Market News Center
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Stay informed with real-time market news, sentiment analysis, and central bank updates. 
            Get comprehensive coverage of events moving the forex markets.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Globe className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-foreground mb-1">8</h3>
            <p className="text-sm text-muted-foreground">Major Central Banks Tracked</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-foreground mb-1">Real-Time</h3>
            <p className="text-sm text-muted-foreground">Live Market Sentiment Updates</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Newspaper className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-foreground mb-1">12+</h3>
            <p className="text-sm text-muted-foreground">News Sources Aggregated</p>
          </div>
        </div>

        {/* News Sections */}
        <div className="space-y-8">
          {/* Market Sentiment Section */}
          <section id="sentiment-analysis">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Market Sentiment Analysis</h2>
              <p className="text-muted-foreground">
                AI-powered sentiment analysis across major financial news sources and currency pairs
              </p>
            </div>
            <NewsSentimentAnalysis />
          </section>

          {/* Central Bank News Section */}
          <section id="central-bank-news">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Central Bank News</h2>
              <p className="text-muted-foreground">
                Live tracking of central bank decisions, speeches, and policy announcements
              </p>
            </div>
            <CentralBankNewsTracker />
          </section>

          {/* Fundamental Analysis Section */}
          <section id="fundamental-news">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Fundamental News Analysis</h2>
              <p className="text-muted-foreground">
                In-depth fundamental analysis of economic events and their market impact
              </p>
            </div>
            <FundamentalNewsAnalysis />
          </section>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold text-foreground">Live Updates</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            All news feeds update automatically every 30 seconds. Market sentiment analysis refreshes monthly. 
            Central bank news and fundamental analysis updates are fetched in real-time from multiple sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default News;
