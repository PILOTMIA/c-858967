import { useState } from "react";
import TradingViewWidget from "react-tradingview-widget";
import { Maximize2, LineChart as LineIcon, BarChart3, CandlestickChart } from "lucide-react";

interface ForexChartProps {
  onPairChange?: (pair: string) => void;
}

const PAIRS = [
  { symbol: "EURUSD", label: "EUR/USD" },
  { symbol: "GBPUSD", label: "GBP/USD" },
  { symbol: "USDJPY", label: "USD/JPY" },
  { symbol: "USDCHF", label: "USD/CHF" },
  { symbol: "AUDUSD", label: "AUD/USD" },
  { symbol: "USDCAD", label: "USD/CAD" },
  { symbol: "NZDUSD", label: "NZD/USD" },
  { symbol: "EURJPY", label: "EUR/JPY" },
  { symbol: "GBPJPY", label: "GBP/JPY" },
  { symbol: "XAUUSD", label: "GOLD" },
  { symbol: "XTIUSD", label: "OIL" },
  { symbol: "BTCUSD", label: "BTC" },
];

const INTERVALS = [
  { key: "15", label: "15m" },
  { key: "60", label: "1H" },
  { key: "240", label: "4H" },
  { key: "D", label: "1D" },
  { key: "W", label: "1W" },
] as const;

const STYLES = [
  { key: "1", label: "Candles", icon: CandlestickChart },
  { key: "2", label: "Bars", icon: BarChart3 },
  { key: "3", label: "Line", icon: LineIcon },
] as const;

const ForexChart = ({ onPairChange }: ForexChartProps) => {
  const [selectedPair, setSelectedPair] = useState("EURUSD");
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]["key"]>("D");
  const [style, setStyle] = useState<(typeof STYLES)[number]["key"]>("1");

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    onPairChange?.(pair);
  };

  const getSymbol = (p: string) => {
    if (p === "XAUUSD") return "OANDA:XAUUSD";
    if (p === "XTIUSD") return "TVC:USOIL";
    if (p === "BTCUSD") return "BITSTAMP:BTCUSD";
    return `FX:${p}`;
  };

  const openFullscreen = () => {
    const symbol = getSymbol(selectedPair).replace(":", "-");
    window.open(`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(getSymbol(selectedPair))}`, "_blank");
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 sm:p-6">
      {/* Top controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">TradingView · Live</p>
          <h2 className="text-xl font-bold text-foreground mt-0.5">Interactive Chart</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart style */}
          <div className="inline-flex rounded-lg border border-border/40 p-0.5 bg-background/40">
            {STYLES.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => setStyle(s.key)}
                  title={s.label}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    style === s.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          {/* Interval */}
          <div className="inline-flex rounded-lg border border-border/40 p-0.5 bg-background/40">
            {INTERVALS.map((i) => (
              <button
                key={i.key}
                onClick={() => setInterval(i.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  interval === i.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>

          <button
            onClick={openFullscreen}
            title="Open in TradingView"
            className="p-1.5 rounded-lg border border-border/40 bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Pair chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PAIRS.map((p) => (
          <button
            key={p.symbol}
            onClick={() => handlePairChange(p.symbol)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums transition-all ${
              selectedPair === p.symbol
                ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                : "bg-background/40 border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[500px] w-full rounded-xl overflow-hidden border border-border/30">
        <TradingViewWidget
          key={`${selectedPair}-${interval}-${style}`}
          symbol={getSymbol(selectedPair)}
          theme="dark"
          locale="en"
          autosize
          interval={interval as any}
          style={style as any}
          hide_side_toolbar={false}
          allow_symbol_change={true}
          toolbar_bg="#0a0a1a"
          enable_publishing={false}
          hide_top_toolbar={false}
          save_image={false}
          studies={["MASimple@tv-basicstudies", "RSI@tv-basicstudies"]}
          container_id={`tv_${selectedPair}_${interval}_${style}`}
        />
      </div>
    </div>
  );
};

export default ForexChart;
