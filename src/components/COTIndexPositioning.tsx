import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus, Gauge } from "lucide-react";

interface Row {
  currency: string;
  report_date: string;
  net_position: number;
}

/**
 * Indices derived from the COT positioning we already track.
 * DXY maps directly to the ICE Dollar Index basket (USD contract).
 * JPN225 and DAX are proxies: index performance is historically tied to
 * the weakness of the home currency (exporter-heavy indices).
 */
const INDEX_DEFS = [
  {
    code: "DXY",
    name: "US Dollar Index",
    driver: "USD",
    sign: 1,
    accent: "38 92% 50%",
    note: "Direct — CFTC ICE USD Index net positioning",
  },
  {
    code: "JPN225",
    name: "Nikkei 225 (proxy)",
    driver: "JPY",
    sign: -1,
    accent: "0 84% 60%",
    note: "Inverse of yen positioning — weak JPY supports Japanese exporters",
  },
  {
    code: "DAX",
    name: "DAX 40 (proxy)",
    driver: "EUR",
    sign: -1,
    accent: "199 89% 55%",
    note: "Inverse of euro positioning — weak EUR supports German exporters",
  },
] as const;

const fmt = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return Math.round(v).toString();
};

const COTIndexPositioning = () => {
  const { data: history } = useQuery({
    queryKey: ["cot-history-indices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cot_history")
        .select("currency, report_date, net_position")
        .in("currency", ["USD", "JPY", "EUR"])
        .order("report_date", { ascending: true });
      if (error) throw error;
      return data as Row[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const indices = useMemo(() => {
    if (!history?.length) return [];
    return INDEX_DEFS.map((def) => {
      const rows = history.filter((r) => r.currency === def.driver);
      const series = rows.map((r) => ({
        date: r.report_date,
        label: new Date(r.report_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: r.net_position * def.sign,
      }));
      const last = series[series.length - 1];
      const prev = series[series.length - 2];
      const peak = Math.max(...series.map((s) => Math.abs(s.value)), 1);
      const score = last ? Math.round((last.value / peak) * 100) : 0;
      const change = last && prev ? last.value - prev.value : 0;
      return { ...def, series: series.slice(-16), value: last?.value ?? 0, score, change, reportDate: last?.date };
    });
  }, [history]);

  if (!indices.length) return null;

  return (
    <Card className="border-border/30 bg-card/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            Index Positioning — DXY · JPN225 · DAX
          </CardTitle>
          {indices[0]?.reportDate && (
            <Badge variant="outline" className="text-[10px] text-foreground/80 border-border/60">
              CFTC {new Date(indices[0].reportDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {indices.map((idx) => {
          const bullish = idx.score > 8;
          const bearish = idx.score < -8;
          const Icon = bullish ? TrendingUp : bearish ? TrendingDown : Minus;
          const toneClass = bullish ? "text-success" : bearish ? "text-destructive" : "text-foreground/70";
          return (
            <div
              key={idx.code}
              className="relative overflow-hidden rounded-xl border border-border/50 bg-background/40 p-4"
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{ background: `radial-gradient(circle at 15% 0%, hsl(${idx.accent} / 0.35), transparent 60%)` }}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold text-foreground tracking-tight">{idx.code}</div>
                    <div className="text-[11px] text-foreground/60">{idx.name}</div>
                  </div>
                  <Badge
                    className={`text-[10px] border ${
                      bullish
                        ? "bg-success/15 text-success border-success/30"
                        : bearish
                        ? "bg-destructive/15 text-destructive border-destructive/30"
                        : "bg-muted/40 text-foreground/70 border-border/60"
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {bullish ? "Bullish" : bearish ? "Bearish" : "Neutral"}
                  </Badge>
                </div>

                <div className="mt-3 flex items-end gap-3">
                  <div className={`text-2xl font-bold font-mono ${toneClass}`}>
                    {idx.score > 0 ? "+" : ""}
                    {idx.score}
                  </div>
                  <div className="text-[11px] text-foreground/60 pb-1">
                    bias score · net {idx.value >= 0 ? "+" : ""}
                    {fmt(idx.value)}
                  </div>
                </div>
                <div className={`text-[11px] font-mono ${idx.change >= 0 ? "text-success" : "text-destructive"}`}>
                  {idx.change >= 0 ? "▲" : "▼"} {fmt(Math.abs(idx.change))} week over week
                </div>

                <div className="h-16 mt-2 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={idx.series}>
                      <defs>
                        <linearGradient id={`grad-${idx.code}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={`hsl(${idx.accent})`} stopOpacity={0.6} />
                          <stop offset="100%" stopColor={`hsl(${idx.accent})`} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <YAxis hide domain={["dataMin", "dataMax"]} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          color: "hsl(var(--foreground))",
                          fontSize: 11,
                        }}
                        formatter={(v: number) => [fmt(v), "Net bias"]}
                        labelFormatter={(_l, p: any) => p?.[0]?.payload?.label ?? ""}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={`hsl(${idx.accent})`}
                        strokeWidth={2}
                        fill={`url(#grad-${idx.code})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[10px] text-foreground/55 mt-1 leading-snug">{idx.note}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default COTIndexPositioning;
