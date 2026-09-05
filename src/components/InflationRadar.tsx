import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PROJECT = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

interface Point {
  date: string;
  value: number;
}

interface IndicatorData {
  current: number;
  previous: number | null;
  latestPeriod: string;
  history: Point[];
  source: string;
}

type InflationKey = 'cpi' | 'coreCPI' | 'ppi' | 'exportPriceIndex';

export type InflationPayload = Partial<Record<InflationKey, IndicatorData>> & { fetchedAt: number };

/** Next BLS CPI release: roughly the 10th-13th business day of the following month. */
const nextCpiRelease = () => {
  const now = new Date();
  const candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 12));
  const rel = candidate.getTime() > now.getTime()
    ? candidate
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 12));
  return rel.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

export const fetchInflation = async (): Promise<InflationPayload> => {
  const res = await fetch(
    `https://${PROJECT}.supabase.co/functions/v1/macro-data?currencies=USD&inflation=true`,
    {
      cache: 'no-store',
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    }
  );
  if (!res.ok) throw new Error(`Inflation feed returned ${res.status}`);
  const json = await res.json();
  const raw = json?.inflation ?? {};
  const out: InflationPayload = { fetchedAt: Date.now() };
  (['cpi', 'coreCPI', 'ppi', 'exportPriceIndex'] as InflationKey[]).forEach((key) => {
    const d = raw[key];
    if (!d || !Number.isFinite(Number(d.current))) return;
    out[key] = {
      current: Number(d.current),
      previous: Number.isFinite(Number(d.previous)) ? Number(d.previous) : null,
      latestPeriod: d.latestPeriod ?? '',
      history: Array.isArray(d.history) ? d.history : [],
      source: d.source === 'bls' ? 'BLS live' : String(d.source ?? 'unknown'),
    };
  });
  return out;
};

export const useInflation = () =>
  useQuery({
    queryKey: ['inflationLive'],
    queryFn: fetchInflation,
    refetchInterval: 30 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });

const InflationRadar = () => {
  const { data, isLoading, isFetching, error, refetch } = useInflation();

  const trendOf = (d: IndicatorData) => {
    if (d.previous === null) return { label: 'No prior reading available', dir: 'flat' as const };
    const diff = d.current - d.previous;
    if (diff > 0.1) return { label: `Accelerating — up ${diff.toFixed(1)}pp vs prior month`, dir: 'up' as const };
    if (diff < -0.1) return { label: `Cooling — down ${Math.abs(diff).toFixed(1)}pp vs prior month`, dir: 'down' as const };
    return { label: 'Broadly stable versus the prior month', dir: 'flat' as const };
  };

  const icon = (dir: 'up' | 'down' | 'flat') =>
    dir === 'up' ? <TrendingUp className="w-4 h-4 text-destructive" />
      : dir === 'down' ? <TrendingDown className="w-4 h-4 text-success" />
      : <Minus className="w-4 h-4 text-muted-foreground" />;

  const renderCard = (title: string, description: string, d?: IndicatorData) => {
    if (!d) {
      return (
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-2">
            This reading is unavailable from the official feed right now — nothing shown rather than an out-of-date number.
          </p>
        </div>
      );
    }
    const t = trendOf(d);
    return (
      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground">{title}</h3>
            <Badge variant="outline" className="text-[10px]">{d.source}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="px-4 sm:px-5 pb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Latest reading (year over year) · {d.latestPeriod}</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{d.current.toFixed(1)}%</p>
            </div>
            {icon(t.dir)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-[10px] text-muted-foreground">Prior month</p>
              <p className="text-base font-bold text-foreground tabular-nums">
                {d.previous === null ? '—' : `${d.previous.toFixed(1)}%`}
              </p>
            </div>
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-[10px] text-muted-foreground">Change</p>
              <p className={`text-base font-bold tabular-nums ${t.dir === 'up' ? 'text-destructive' : t.dir === 'down' ? 'text-success' : 'text-muted-foreground'}`}>
                {d.previous === null ? '—' : `${d.current - d.previous >= 0 ? '+' : ''}${(d.current - d.previous).toFixed(1)}pp`}
              </p>
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-xl">
            <p className={`text-xs font-medium ${t.dir === 'up' ? 'text-destructive' : t.dir === 'down' ? 'text-success' : 'text-muted-foreground'}`}>
              {t.label}
            </p>
          </div>

          <div className="border border-border/30 rounded-xl p-3 flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Next scheduled release: <span className="text-foreground font-semibold">{nextCpiRelease()}</span></p>
          </div>

          {d.history.length > 1 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} interval="preserveStartEnd" />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                  <ReferenceLine y={2} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(v: number) => [`${v.toFixed(2)}%`, title]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 2.5 }}
                    name={title}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-3 sm:p-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="h-96 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Inflation Monitor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            US price data pulled live from the Bureau of Labor Statistics — the same official source as the payrolls report.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-[10px] text-muted-foreground">
              Updated {new Date(data.fetchedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-[11px] text-foreground hover:border-primary/50 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive">
          The official inflation feed is unreachable right now. Try refreshing in a moment.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {renderCard("Consumer Price Index (CPI)", "Average change in prices paid by urban consumers", data?.cpi)}
        {renderCard("Core CPI", "CPI excluding volatile food and energy prices", data?.coreCPI)}
        {renderCard("Producer Price Index (PPI)", "Final demand prices received by domestic producers", data?.ppi)}
        {renderCard("Export Price Index", "Change in prices of goods exported from the US", data?.exportPriceIndex)}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Source: US Bureau of Labor Statistics public data API • Refreshes every 30 minutes • Dashed line marks the Fed's 2% target
      </p>
    </div>
  );
};

export default InflationRadar;
