import { useEffect } from 'react';

const TradingViewBanner = () => {
  useEffect(() => {
    // Create container if it doesn't exist
    let container = document.getElementById('tradingview-banner-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tradingview-banner-container';
      container.style.height = '46px';
      container.style.width = '100%';
      
      // Create the widget script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          {"proName": "FX:EURUSD", "title": "EURUSD"},
          {"proName": "FX:GBPUSD", "title": "GBPUSD"},
          {"proName": "FX:USDJPY", "title": "USDJPY"},
          {"proName": "FX:AUDUSD", "title": "AUDUSD"},
          {"proName": "OANDA:XAUUSD", "title": "XAUUSD"},
          {"proName": "CRYPTOCAP:BTC", "title": "BTC"},
          {"proName": "CRYPTOCAP:ETH", "title": "ETH"},
          {"proName": "INDEX:SPX", "title": "SPX"},
          {"proName": "INDEX:DJI", "title": "DJI"},
          {"proName": "INDEX:NDX", "title": "NDX"}
        ],
        "showSymbolLogo": true,
        "colorTheme": "dark",
        "isTransparent": false,
        "displayMode": "adaptive",
        "width": "100%",
        "height": 46,
        "utm_source": window.location.hostname,
        "utm_medium": "widget",
        "utm_campaign": "ticker-tape",
        "page-uri": window.location.hostname + "/"
      });
      
      container.appendChild(script);
      
      const widgetContainer = document.querySelector('.tradingview-widget-container');
      if (widgetContainer) {
        widgetContainer.appendChild(container);
      }
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-card border-b border-border">
      <div className="tradingview-widget-container" style={{ height: '46px', width: '100%' }}>
        {/* TradingView widget will be injected here */}
      </div>
    </div>
  );
};

export default TradingViewBanner;