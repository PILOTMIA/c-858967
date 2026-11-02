import LiveRateTicker from "./LiveRateTicker";

export default function TradingViewBanner() {
  return <header aria-label="Market price ticker" className="fixed inset-x-0 top-0 z-50 h-[46px] border-b border-border bg-background">
    <LiveRateTicker compact />
  </header>;
}
