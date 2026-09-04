import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users, Briefcase, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JobsEntry {
  country: string;
  flag: string;
  currency: string;
  unemployment: number;
  previous: number;
  nfp?: number;
  wageGrowth?: number;
  source: string;
}

const JOBS_DATA: JobsEntry[] = [
  { country: 'United States', flag: '🇺🇸', currency: 'USD', unemployment: 4.1, previous: 4.0, nfp: 228, wageGrowth: 3.8, source: 'BLS / FRED' },
  { country: 'Eurozone', flag: '🇪🇺', currency: 'EUR', unemployment: 6.4, previous: 6.5, wageGrowth: 4.1, source: 'Eurostat' },
  { country: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', unemployment: 4.4, previous: 4.3, wageGrowth: 4.8, source: 'ONS' },
  { country: 'Japan', flag: '🇯🇵', currency: 'JPY', unemployment: 2.5, previous: 2.4, wageGrowth: 5.4, source: 'Statistics Bureau' },
  { country: 'Switzerland', flag: '🇨🇭', currency: 'CHF', unemployment: 2.3, previous: 2.2, wageGrowth: 1.8, source: 'SECO' },
  { country: 'Australia', flag: '🇦🇺', currency: 'AUD', unemployment: 4.1, previous: 4.0, wageGrowth: 3.4, source: 'ABS' },
  { country: 'Canada', flag: '🇨🇦', currency: 'CAD', unemployment: 6.7, previous: 6.6, wageGrowth: 3.1, source: 'StatCan' },
  { country: 'New Zealand', flag: '🇳🇿', currency: 'NZD', unemployment: 5.4, previous: 5.1, wageGrowth: 2.8, source: 'StatsNZ' },
];

const US_NFP_HISTORY_FALLBACK = [
  { month: 'Sep', year: 2025, value: 76 },
  { month: 'Oct', year: 2025, value: -140 },
  { month: 'Nov', year: 2025, value: 41 },
  { month: 'Dec', year: 2025, value: -17 },
  { month: 'Jan', year: 2026, value: 160 },
  { month: 'Feb', year: 2026, value: -156 },
  { month: 'Mar', year: 2026, value: 214 },
  { month: 'Apr', year: 2026, value: 148 },
  { month: 'May', year: 2026, value: 63 },
  { month: 'Jun', year: 2026, value: 31 },
  { month: 'Jul', year: 2026, value: 21 },
  { month: 'Aug', year: 2026, value: 162 },
];

// First Friday of the month after the latest released reference month
const nextNfpRelease = () => {
  const now = new Date();
  const findFirstFriday = (y: number, m: number) => {
    const d = new Date(Date.UTC(y, m, 1));
    while (d.getUTCDay() !== 5) d.setUTCDate(d.getUTCDate() + 1);
    return d;
  };
  let rel = findFirstFriday(now.getUTCFullYear(), now.getUTCMonth());
  if (rel.getTime() <= now.getTime()) rel = findFirstFriday(now.getUTCFullYear(), now.getUTCMonth() + 1);
  return rel.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

interface JobsResult {
  entries: JobsEntry[];
  nfpHistory: { month: string; year?: number; value: number }[];
  nfpSource: string;
  nfpLatestMonth: string;
  nfpPrevious: number | null;
}

const fetchLiveJobs = async (): Promise<JobsResult> => {
  const fallback: JobsResult = {
    entries: JOBS_DATA,
    nfpHistory: US_NFP_HISTORY_FALLBACK,
    nfpSource: 'BLS (cached)',
    nfpLatestMonth: 'Aug 2026',
    nfpPrevious: 21,
  };
  try {
    const currencies = JOBS_DATA.map(j => j.currency).join(',');
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/macro-data?currencies=${currencies}&nfp=true`,
      {
        cache: 'no-store',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) throw new Error('Failed');
    const result = await res.json();
    const nfp = result.nfp;
    return {
      entries: JOBS_DATA.map(entry => ({
        ...entry,
        unemployment: result.data?.[entry.currency]?.unemployment ?? entry.unemployment,
        source: result.data?.[entry.currency]?.source === 'fred' ? 'FRED API (live)' : entry.source,
      })),
      nfpHistory: nfp?.history?.length ? nfp.history : fallback.nfpHistory,
      nfpSource:
        nfp?.source === 'bls'
          ? 'BLS Public API (live)'
          : nfp?.source === 'fred'
            ? 'FRED / BLS (live)'
            : 'BLS (cached)',
      nfpLatestMonth: nfp?.latestMonth ?? fallback.nfpLatestMonth,
      nfpPrevious: typeof nfp?.previous === 'number' ? nfp.previous : fallback.nfpPrevious,
    };
  } catch {
    return fallback;
  }
};

const JobsRadar = () => {
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobsRadar'],
    queryFn: fetchLiveJobs,
    refetchInterval: 30 * 60 * 1000,
  });

  const entries = jobsData?.entries || JOBS_DATA;
  const nfpHistory = jobsData?.nfpHistory || US_NFP_HISTORY_FALLBACK;
  const latestNfp = nfpHistory[nfpHistory.length - 1]?.value ?? 0;
  const previousNfp = jobsData?.nfpPrevious ?? nfpHistory[nfpHistory.length - 2]?.value ?? 0;
  const latestMonthLabel = jobsData?.nfpLatestMonth || 'Latest';
  const avgNfp = Math.round(nfpHistory.reduce((s, m) => s + m.value, 0) / (nfpHistory.length || 1));

  const chartData = entries.map(e => ({ name: e.currency, rate: e.unemployment }));

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" /> Employment Monitor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unemployment rates, Non-Farm Payrolls, and wage growth across G8 economies
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Activity className="w-3 h-3 mr-1" /> {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </Badge>
      </div>

      {/* Top Row: NFP & Unemployment Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* US NFP Trend */}
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <h3 className="font-bold text-foreground text-sm">🇺🇸 US Non-Farm Payrolls (K)</h3>
              <p className="text-[10px] text-muted-foreground">
                {latestMonthLabel} report • Source: {jobsData?.nfpSource || 'BLS (cached)'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${latestNfp >= 0 ? 'text-success' : 'text-destructive'}`}>
                {latestNfp >= 0 ? '+' : ''}{latestNfp}K
              </div>
              <div className="text-xs text-muted-foreground">
                prior {previousNfp >= 0 ? '+' : ''}{previousNfp}K • 12-mo avg {avgNfp >= 0 ? '+' : ''}{avgNfp}K
              </div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nfpHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(v: number) => [`${v >= 0 ? '+' : ''}${v}K`, 'NFP']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {nfpHistory.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.value < 0 ? 'hsl(var(--destructive))' : idx === nfpHistory.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                      opacity={idx === nfpHistory.length - 1 || entry.value < 0 ? 1 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Released first Friday of each month, 8:30 AM ET, covering the prior month.
          </p>
        </div>

        {/* Unemployment Comparison */}
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
          <h3 className="font-bold text-foreground text-sm mb-1">Global Unemployment Rates (%)</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Sources: FRED, BLS, Eurostat, ONS, ABS</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" domain={[0, 8]} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(v: number) => [`${v}%`, 'Unemployment']}
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.rate <= 3 ? 'hsl(var(--success))' : entry.rate <= 5 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {entries.map((entry) => {
          const change = entry.unemployment - entry.previous;
          const isRising = change > 0;
          return (
            <div
              key={entry.currency}
              className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{entry.flag}</span>
                  <div>
                    <div className="font-bold text-foreground text-sm">{entry.currency}</div>
                    <div className="text-[10px] text-muted-foreground">{entry.country}</div>
                  </div>
                </div>
                {isRising ? (
                  <TrendingUp className="w-4 h-4 text-destructive" />
                ) : change < 0 ? (
                  <TrendingDown className="w-4 h-4 text-success" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-foreground">{entry.unemployment}%</span>
                <span className={`text-xs font-medium ${isRising ? 'text-destructive' : 'text-success'}`}>
                  {isRising ? '▲' : '▼'} {Math.abs(change).toFixed(1)}pp
                </span>
              </div>

              {entry.wageGrowth && (
                <div className="flex items-center justify-between text-[10px] mt-2">
                  <span className="text-muted-foreground">Wage Growth</span>
                  <span className="font-semibold text-foreground">{entry.wageGrowth}%</span>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground mt-1 text-right">{entry.source}</div>
            </div>
          );
        })}
      </div>

      {/* Why NFP Matters */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm p-5">
        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Why Non-Farm Payrolls (NFP) Is Worth Knowing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">It moves the Dollar instantly.</span> NFP is the single most-watched US data release. A strong print (jobs added above forecast) usually sends USD up within seconds; a weak print sends it down. Spreads widen and volatility spikes at 8:30 AM ET on release day.
          </div>
          <div>
            <span className="font-semibold text-foreground">It drives Fed policy.</span> The Federal Reserve's mandate is maximum employment and stable prices. Consistently strong payrolls give the Fed room to keep rates higher for longer — bullish USD. Weak payrolls raise rate-cut expectations — bearish USD.
          </div>
          <div>
            <span className="font-semibold text-foreground">It sets the tone for every pair.</span> Because USD is one side of most major pairs (EURUSD, USDJPY, GBPUSD), NFP reshapes the entire FX board at once — not just one market.
          </div>
          <div>
            <span className="font-semibold text-foreground">How to use it.</span> Compare the actual number vs. the forecast, watch wage growth for inflation clues, and note revisions to prior months — big revisions can flip the initial market reaction. Many traders wait 15–30 minutes after release for spreads to normalize before entering.
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Source: Bureau of Labor Statistics via FRED • Released the first Friday of each month at 8:30 AM ET
        </p>
      </div>

      {/* Insights */}
      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          💡 Employment Insights for Traders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">🇺🇸 Latest NFP {latestNfp >= 0 ? '+' : ''}{latestNfp}K</span> — {latestNfp >= avgNfp ? 'Above the 12-month trend — labor momentum supports a patient Fed and a firmer USD.' : 'Below the 12-month trend — cooling hiring raises rate-cut expectations, pressuring USD.'}
          </div>
          <div>
            <span className="font-semibold text-foreground">🇯🇵 Wages +5.4%</span> — Japan's strongest wage growth in decades supports BoJ normalization and JPY strength.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇨🇦 6.7% Unemployment</span> — Canada's elevated joblessness keeps the BoC biased toward easing. Bearish CAD.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇬🇧 Wages +4.8%</span> — UK wage stickiness keeps BoE cautious. GBP supported by slow easing pace.
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Source: Bureau of Labor Statistics, FRED, Eurostat, ONS, Statistics Bureau Japan, ABS, StatCan
        </p>
      </div>
    </div>
  );
};

export default JobsRadar;
