import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

const CURRENCY_GROUPS = {
  "Majors": ["EUR", "GBP", "JPY", "CHF"],
  "Commodity": ["AUD", "CAD", "NZD"],
  "Metals & Crypto": ["XAU", "BTC"],
  "Index": ["USD"],
};

const COLOR_MAP: Record<string, string> = {
  EUR: "hsl(var(--chart-1))",
  GBP: "hsl(var(--chart-2))",
  JPY: "hsl(var(--chart-3))",
  CHF: "hsl(var(--chart-4))",
  AUD: "hsl(var(--chart-5))",
  CAD: "hsl(142 71% 45%)",
  NZD: "hsl(262 83% 58%)",
  USD: "hsl(38 92% 50%)",
  XAU: "hsl(45 93% 47%)",
  BTC: "hsl(25 95% 53%)",
};

interface HistoryRow {
  currency: string;
  report_date: string;
  long_positions: number;
  short_positions: number;
  net_position: number;
  change_long: number;
  change_short: number;
}

const COTHistoryTrends = () => {
  const [selected, setSelected] = useState<string[]>(["EUR", "JPY", "AUD", "XAU"]);

  const { data: history, dataUpdatedAt } = useQuery({
    queryKey: ["cot-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cot_history")
        .select("currency, report_date, long_positions, short_positions, net_position, change_long, change_short")
        .order("report_date", { ascending: true });
      if (error) throw error;
      return data as HistoryRow[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const toggle = (c: string) => {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  // Build unified timeline data
  const dates = [...new Set(history?.map((r) => r.report_date) ?? [])].sort();
  const lineData = dates.map((d) => {
    const row: Record<string, any> = { date: d, label: new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    selected.forEach((c) => {
      const match = history?.find((r) => r.currency === c && r.report_date === d);
      row[c] = match?.net_position ?? null;
    });
    return row;
  });

  // Latest snapshot for bar comparison
  const latestDate = dates[dates.length - 1];
  const barData = history
    ?.filter((r) => r.report_date === latestDate)
    .map((r) => ({ currency: r.currency, net: r.net_position, long: r.long_positions, short: r.short_positions }))
    .sort((a, b) => b.net - a.net) ?? [];

  const fmt = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg font-bold text-foreground">COT Net Position Trends</CardTitle>
            {dataUpdatedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(dataUpdatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4 mb-4">
            {Object.entries(CURRENCY_GROUPS).map(([group, currencies]) => (
              <div key={group} className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{group}</span>
                <div className="flex gap-1">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggle(c)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                        selected.includes(c)
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-muted/30 text-muted-foreground border border-transparent hover:border-border"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Line Chart */}
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={fmt}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number, name: string) => [fmt(value), name]}
                />
                {selected.map((c) => (
                  <Line
                    key={c}
                    type="monotone"
                    dataKey={c}
                    stroke={COLOR_MAP[c] ?? "hsl(var(--primary))"}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            Source: CFTC Non-Commercial Positions — verified weekly reports
          </p>
        </CardContent>
      </Card>

      {/* Current Snapshot Bar Chart */}
      <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-foreground">
            Current Net Positioning — {latestDate ? new Date(latestDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={fmt}
                />
                <YAxis
                  type="category"
                  dataKey="currency"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 700 }}
                  width={40}
                />
                <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Net Position"]}
                />
                <Bar dataKey="net" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.net >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {barData.slice(0, 3).map((item) => (
              <Badge key={item.currency} className="bg-success/15 text-success border-success/30 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {item.currency} +{fmt(item.net)}
              </Badge>
            ))}
            {barData.slice(-3).map((item) => (
              <Badge key={item.currency} className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
                <TrendingDown className="w-3 h-3 mr-1" />
                {item.currency} {fmt(item.net)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default COTHistoryTrends;
