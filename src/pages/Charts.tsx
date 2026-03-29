import { useState } from "react";
import ForexChart from "@/components/ForexChart";
import ForexPerformance from "@/components/ForexPerformance";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Charts = () => {
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState('EURUSD');
  const navigate = useNavigate();

  const handlePairChange = (pair: string) => {
    setSelectedCurrencyPair(pair);
  };

  const tips = [
    "Use multiple timeframes to confirm trends",
    "Watch for key support and resistance levels",
    "Combine with COT data for institutional insights",
    "Monitor economic calendar for high-impact events",
  ];

  const quickLinks = [
    { path: '/cot-analysis', label: 'COT Analysis' },
    { path: '/economic-radar', label: 'Economic Radar' },
    { path: '/market-analysis', label: 'Heat Map Analysis' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Live Charts</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-xl mx-auto">
          Real-time forex charts with performance metrics
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-8">
        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForexChart onPairChange={handlePairChange} />
          </div>
          <div>
            <ForexPerformance selectedPair={selectedCurrencyPair} />
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Chart Analysis Tips</h3>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="group w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/30 bg-card/20 hover:bg-card/50 hover:border-border/60 transition-all text-left"
                >
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MidasFX Banner */}
        <div className="flex justify-center">
          <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity duration-500">
            <img src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" alt="MidasFX Trading" className="rounded-xl max-w-[468px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Charts;
