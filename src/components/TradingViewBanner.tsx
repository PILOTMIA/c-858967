import { useEffect, useRef } from 'react';

const TradingViewBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || !containerRef.current) return;
    scriptLoaded.current = true;

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.textContent = JSON.stringify({
      symbols: [
        { proName: "FX:EURUSD", title: "EURUSD" },
        { proName: "FX:GBPUSD", title: "GBPUSD" },
        { proName: "FX:USDJPY", title: "USDJPY" },
        { proName: "FX:AUDUSD", title: "AUDUSD" },
        { proName: "FX:USDCAD", title: "USDCAD" },
        { proName: "FX:NZDUSD", title: "NZDUSD" },
        { proName: "OANDA:XAUUSD", title: "Gold" },
        { proName: "BITSTAMP:BTCUSD", title: "BTC" },
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "TVC:DXY", title: "DXY" },
        { proName: "TVC:US10Y", title: "US10Y" },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/30">
      <div ref={containerRef} style={{ height: '46px', width: '100%', overflow: 'hidden' }} />
    </div>
  );
};

export default TradingViewBanner;
