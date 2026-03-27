import RealTimeData from "@/components/RealTimeData";
import SentimentWidget from "@/components/SentimentWidget";
import TradingBot from "@/components/TradingBot";
import MarketClock from "@/components/MarketClock";

const Tools = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Trading Tools</h1>
          <p className="text-muted-foreground">Essential tools for your daily trading workflow</p>
        </div>

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
