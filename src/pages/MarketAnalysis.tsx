
import ForexHeatMap from "@/components/ForexHeatMap";
import { useNavigate } from "react-router-dom";

const MarketAnalysis = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Market Analysis</h1>
          <p className="text-gray-300">Real-time forex market analysis and insights</p>
        </div>

        {/* Heat Map - Full Focus */}
        <ForexHeatMap />

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div 
            onClick={() => navigate('/charts')}
            className="bg-card border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">Live Charts</h3>
              <p className="text-muted-foreground text-sm mb-4">
                View live TradingView charts with performance metrics
              </p>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                View Charts
              </button>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/cot-analysis')}
            className="bg-card border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-card-foreground mb-2">COT Analysis</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Commitment of Traders data and institutional positioning
              </p>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                View Full COT Analysis
              </button>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/economic-radar')}
            className="bg-card border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-card-foreground mb-2">Economic Radar</h3>
              <p className="text-muted-foreground text-sm mb-4">
                CPI, PPI, 10Y Breakeven, Bonds & Seasonality Analysis
              </p>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                View Economic Radar
              </button>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/news')}
            className="bg-card border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-card-foreground mb-2">Market News</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Live news, sentiment analysis, and central bank updates
              </p>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
                View Market News
              </button>
            </div>
          </div>
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
