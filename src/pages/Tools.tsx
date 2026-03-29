import RealTimeData from "@/components/RealTimeData";
import SentimentWidget from "@/components/SentimentWidget";
import TradingBot from "@/components/TradingBot";
import MarketClock from "@/components/MarketClock";

const Tools = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Trading Tools</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-xl mx-auto">
          Essential tools for your daily trading workflow
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-8">
        <MarketClock />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealTimeData />
          <SentimentWidget />
        </div>
      </div>

      <TradingBot />
    </div>
  );
};

export default Tools;
