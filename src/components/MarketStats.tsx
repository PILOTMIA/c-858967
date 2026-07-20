import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, DollarSign, Bitcoin, Euro } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Stat {
  value: number;
  change: number;        // absolute change
  changePercent: number; // percent
}

interface MarketData {
  usdIndex: Stat & { source: string };
  btc: Stat & { source: string };
  eurUsd: Stat & { source: string };
  fetchedAt: number;
}

const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ3N1Z2VubmJkYXR3bWV0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTMyODIsImV4cCI6MjA4MDM2OTI4Mn0.Gm1gJ3CkqIn7eWidlFK-ohEVec-heE3Ts6m1dCY5ZOw";

// Official ICE DXY formula
// USDX = 50.14348112 × EURUSD^-0.576 × USDJPY^0.136 × GBPUSD^-0.119 × USDCAD^0.091 × USDSEK^0.042 × USDCHF^0.036
function computeDXY(r: Record<string, number>): number {
  return (
    50.14348112 *
    Math.pow(r.EURUSD, -0.576) *
    Math.pow(r.USDJPY, 0.136) *
    Math.pow(r.GBPUSD, -0.119) *
    Math.pow(r.USDCAD, 0.091) *
    Math.pow(r.USDSEK, 0.042) *
    Math.pow(r.USDCHF, 0.036)
  );
}

async function fetchMarketData(): Promise<MarketData> {
  // 1) Forex rates (today + 45d) from our edge function
  const fxUrl = `https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/forex-prices?pairs=EURUSD,USDJPY,GBPUSD,USDCAD,USDSEK,USDCHF&history=true`;
  const fxRes = await fetch(fxUrl, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } });
  const fx: any = await fxRes.json().catch(() => ({}));

  const rate = (p: string) => Number(fx?.rates?.[p]?.rate);
  const yday = (p: string): number | undefined => {
    const h = fx?.history?.[p] as { date: string; close: number }[] | undefined;
    if (!h || h.length < 2) return undefined;
    return h[h.length - 2].close;
  };

  const today = {
    EURUSD: rate("EURUSD"),
    USDJPY: rate("USDJPY"),
    GBPUSD: rate("GBPUSD"),
    USDCAD: rate("USDCAD"),
    USDSEK: rate("USDSEK") || 10.55, // SEK not in fallback list — soft default
    USDCHF: rate("USDCHF"),
  };
  const yest = {
    EURUSD: yday("EURUSD") ?? today.EURUSD,
    USDJPY: yday("USDJPY") ?? today.USDJPY,
    GBPUSD: yday("GBPUSD") ?? today.GBPUSD,
    USDCAD: yday("USDCAD") ?? today.USDCAD,
    USDSEK: yday("USDSEK") ?? today.USDSEK,
    USDCHF: yday("USDCHF") ?? today.USDCHF,
  };

  const dxy = computeDXY(today);
  const dxyPrev = computeDXY(yest);
  const dxyChange = dxy - dxyPrev;

  const eur = today.EURUSD;
  const eurPrev = yest.EURUSD;
  const eurChange = eur - eurPrev;

  // 2) BTC from CoinGecko (real-time)
  let btcPrice = 0;
  let btcChangePct = 0;
  let btcSource = "CoinGecko";
  try {
    const cg = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
    ).then((r) => r.json());
    btcPrice = Number(cg?.bitcoin?.usd) || 0;
    btcChangePct = Number(cg?.bitcoin?.usd_24h_change) || 0;
  } catch {
    btcSource = "unavailable";
  }
  const btcChange = (btcPrice * btcChangePct) / 100;

  const fxSource =
    fx?.rates?.EURUSD?.source && fx.rates.EURUSD.source !== "fallback"
      ? fx.rates.EURUSD.source
      : "cached";

  return {
    usdIndex: {
      value: dxy,
      change: dxyChange,
      changePercent: (dxyChange / dxyPrev) * 100,
      source: `ICE formula · ${fxSource}`,
    },
    btc: {
      value: btcPrice,
      change: btcChange,
      changePercent: btcChangePct,
      source: btcSource,
    },
    eurUsd: {
      value: eur,
      change: eurChange,
      changePercent: (eurChange / eurPrev) * 100,
      source: fxSource,
    },
    fetchedAt: Date.now(),
  };
}

const Card = ({
  label,
  Icon,
  value,
  changePercent,
  source,
}: {
  label: string;
  Icon: typeof DollarSign;
  value: string;
  changePercent: number;
  source: string;
}) => {
  const up = changePercent >= 0;
  return (
    <div className="glass-card p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <Icon className={`w-4 h-4 ${up ? "text-success" : "text-warning"}`} />
      </div>
      <p className="text-2xl font-semibold mt-2 tabular-nums">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-sm flex items-center gap-1 ${up ? "text-success" : "text-warning"}`}>
          {up ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
          {Math.abs(changePercent).toFixed(2)}%
        </span>
        <span className="text-[10px] text-muted-foreground truncate ml-2">Source: {source}</span>
      </div>
    </div>
  );
};

const MarketStats = () => {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["marketStats"],
    queryFn: fetchMarketData,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  if (isLoading || !data || !data.usdIndex || !data.btc || !data.eurUsd) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-muted/30 rounded mb-2"></div>
            <div className="h-8 bg-muted/30 rounded mb-2"></div>
            <div className="h-4 bg-muted/30 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const ageSec = Math.max(0, Math.floor((Date.now() - dataUpdatedAt) / 1000));
  const safeNum = (n: number | undefined, d = 2) =>
    Number.isFinite(n) ? (n as number).toFixed(d) : "—";

  return (
    <div className="mb-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          label="US Dollar Index (DXY)"
          Icon={DollarSign}
          value={data.usdIndex.value.toFixed(2)}
          changePercent={data.usdIndex.changePercent}
          source={data.usdIndex.source}
        />
        <Card
          label="Bitcoin"
          Icon={Bitcoin}
          value={`$${data.btc.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          changePercent={data.btc.changePercent}
          source={data.btc.source}
        />
        <Card
          label="EUR/USD"
          Icon={Euro}
          value={data.eurUsd.value.toFixed(4)}
          changePercent={data.eurUsd.changePercent}
          source={data.eurUsd.source}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-2">
        <TrendingUpIcon className="w-3 h-3" />
        Auto-refreshes every 30s · Last updated {ageSec}s ago
      </div>
    </div>
  );
};

export default MarketStats;
