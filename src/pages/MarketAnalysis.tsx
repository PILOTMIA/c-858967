
import ForexHeatMap from "@/components/ForexHeatMap";
import ForexChart from "@/components/ForexChart";
import ForexPerformance from "@/components/ForexPerformance";
import COTData from "@/components/COTData";
import FedWatchTool from "@/components/FedWatchTool";
import NewsSentimentAnalysis from "@/components/NewsSentimentAnalysis";
import FundamentalNewsAnalysis from "@/components/FundamentalNewsAnalysis";
import CentralBankNewsTracker from "@/components/CentralBankNewsTracker";
import { useState } from "react";

const MarketAnalysis = () => {
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState('EURUSD');

  const handlePairChange = (pair: string) => {
    setSelectedCurrencyPair(pair);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Market Analysis</h1>
          <p className="text-gray-300">Real-time forex market analysis and insights</p>
        </div>

        {/* Central Bank News Tracker */}
        <CentralBankNewsTracker />

        {/* News Sentiment Analysis */}
        <NewsSentimentAnalysis />

        {/* Fundamental News Analysis */}
        <FundamentalNewsAnalysis />

        {/* Heat Map */}
        <ForexHeatMap />

        {/* Chart & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForexChart onPairChange={handlePairChange} />
          </div>
          <div>
            <ForexPerformance selectedPair={selectedCurrencyPair} />
          </div>
        </div>

        {/* COT Data & Fed Watch */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-card border-border rounded-lg p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-card-foreground mb-2">COT Analysis</h3>
              <p className="text-muted-foreground text-sm mb-4">
                For detailed Commitment of Traders analysis, visit our dedicated COT section
              </p>
              <button 
                onClick={() => window.location.href = '/cot-analysis'}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
              >
                View Full COT Analysis
              </button>
            </div>
          </div>
          <FedWatchTool />
        </div>

        {/* MidasFX Banner */}
        <div className="mt-8 flex justify-center">
          <a 
            href="https://www.midasfx.com/?ib=1127736"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity duration-300 shadow-lg hover:shadow-xl rounded-lg overflow-hidden"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX - Professional Forex Trading"
              className="w-full h-auto max-w-[468px]"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
