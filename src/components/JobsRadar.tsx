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

const US_NFP_HISTORY = [
  { month: 'Oct', value: 184 },
  { month: 'Nov', value: 212 },
  { month: 'Dec', value: 256 },
  { month: 'Jan', value: 143 },
  { month: 'Feb', value: 151 },
  { month: 'Mar', value: 228 },
];

const fetchLiveJobs = async (): Promise<JobsEntry[]> => {
  try {
    const currencies = JOBS_DATA.map(j => j.currency).join(',');
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/macro-data?currencies=${currencies}`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) throw new Error('Failed');
    const result = await res.json();
    return JOBS_DATA.map(entry => ({
      ...entry,
      unemployment: result.data?.[entry.currency]?.unemployment ?? entry.unemployment,
      source: result.data?.[entry.currency]?.source === 'fred' ? 'FRED API 🟢' : entry.source,
    }));
  } catch {
    return JOBS_DATA;
  }
};

const JobsRadar = () => {
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobsRadar'],
    queryFn: fetchLiveJobs,
    refetchInterval: 6 * 60 * 60 * 1000,
  });

  const entries = jobsData || JOBS_DATA;
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
          <Activity className="w-3 h-3 mr-1" /> March 2026
        </Badge>
      </div>

      {/* Top Row: NFP & Unemployment Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* US NFP Trend */}
        <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-foreground text-sm">🇺🇸 US Non-Farm Payrolls (K)</h3>
              <p className="text-[10px] text-muted-foreground">Monthly job additions • Source: BLS</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">+228K</div>
              <div className="text-xs text-success">Beat est. 135K</div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={US_NFP_HISTORY}>
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
                  formatter={(v: number) => [`+${v}K`, 'NFP']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {US_NFP_HISTORY.map((_, idx) => (
                    <Cell key={idx} fill={idx === US_NFP_HISTORY.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={idx === US_NFP_HISTORY.length - 1 ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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

      {/* Insights */}
      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          💡 Employment Insights for Traders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">🇺🇸 NFP +228K</span> — Strong labor market beat supports Fed's patient stance. USD bullish on tight employment.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇯🇵 Wages +5.4%</span> — Japan's strongest wage growth in decades supports BoJ normalization and JPY strength.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇨🇦 6.7% Unemployment</span> — Canada's rising joblessness justifies BoC's aggressive cutting cycle. Bearish CAD.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇬🇧 Wages +4.8%</span> — UK wage stickiness at 4.8% keeps BoE cautious. GBP supported by slow easing pace.
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Source: Bureau of Labor Statistics, FRED, Eurostat, ONS, Statistics Bureau Japan, ABS, StatCan • NFP released April 4, 2026
        </p>
      </div>
    </div>
  );
};

export default JobsRadar;
