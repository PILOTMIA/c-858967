import { useState } from "react";
import ForexChart from "@/components/ForexChart";
import ForexPerformance from "@/components/ForexPerformance";

const Charts = () => {
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState('EURUSD');

  const handlePairChange = (pair: string) => {
    setSelectedCurrencyPair(pair);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Live Charts & Performance</h1>
          <p className="text-gray-300">Real-time forex charts with performance metrics and analysis</p>
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForexChart onPairChange={handlePairChange} />
          </div>
          <div>
            <ForexPerformance selectedPair={selectedCurrencyPair} />
          </div>
        </div>

        {/* Additional Chart Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border-border rounded-lg p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-4">Chart Analysis Tips</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Use multiple timeframes to confirm trends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Watch for key support and resistance levels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Combine with COT data for institutional insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Monitor economic calendar for high-impact events</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-card border-border rounded-lg p-6">
            <h3 className="text-xl font-bold text-card-foreground mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/cot-analysis'}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-4 py-3 rounded-lg font-medium transition-colors text-left"
              >
                📊 View COT Analysis
              </button>
              <button 
                onClick={() => window.location.href = '/economic-radar'}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-4 py-3 rounded-lg font-medium transition-colors text-left"
              >
                🎯 Economic Radar
              </button>
              <button 
                onClick={() => window.location.href = '/market-analysis'}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-4 py-3 rounded-lg font-medium transition-colors text-left"
              >
                🔥 Heat Map Analysis
              </button>
            </div>
          </div>
        </div>

        {/* MidasFX Banner */}
        <div className="flex justify-center my-8">
          <a 
            href="https://www.midasfx.com/?ib=1127736" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX Trading - Premium Forex Broker" 
              className="rounded-lg border-2 border-gray-700 shadow-lg hover:shadow-xl hover:border-primary/50"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Charts;
