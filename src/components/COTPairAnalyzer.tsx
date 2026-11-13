import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { latestReportDate, useLatestCOT } from "@/hooks/useLatestCOT";

interface CurrencyPositioning {
  netPosition: number;
  long: number;
  short: number;
  sentiment: string;
  weeklyChange: number;
}


// Historical net positions are loaded live from cot_history (see useHistoricalNet below)


const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'MXN'];

const COTPairAnalyzer = () => {
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [quoteCurrency, setQuoteCurrency] = useState('JPY');
  const { data: latestCot } = useLatestCOT();
  const reportDate = latestReportDate(latestCot);
  const positions = useMemo(() => {
    const merged: Record<string, CurrencyPositioning> = {};
    for (const [currency, row] of Object.entries(latestCot ?? {})) {
      merged[currency] = {
        netPosition: row.net,
        long: row.long,
        short: row.short,
        weeklyChange: row.weekly,
        sentiment: row.net > 0 ? 'BULLISH' : row.net < 0 ? 'BEARISH' : 'NEUTRAL',
      };
    }
    return merged;
  }, [latestCot]);

  // Live historical net positions from cot_history (last ~10 reports)
  const { data: historicalNet = {} } = useQuery({
    queryKey: ['cot-pair-analyzer-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('cot_history')
        .select('currency, report_date, net_position')
        .order('report_date', { ascending: false })
        .limit(300);
      const dates = [...new Set((data ?? []).map((r) => r.report_date))].sort().slice(-10);
      const map: Record<string, { date: string; value: number }[]> = {};
      dates.forEach((d) => {
        (data ?? [])
          .filter((r) => r.report_date === d)
          .forEach((r) => {
            const label = new Date(r.report_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            (map[r.currency] ??= []).push({ date: label, value: r.net_position });
          });
      });
      return map;
    },
    staleTime: 1000 * 60 * 30,
  });


  const analysis = useMemo(() => {
    const base = positions[baseCurrency];
    const quote = positions[quoteCurrency];
    if (!base || !quote) return null;

    const maxPos = 100000;
    const baseScore = (base.netPosition / maxPos) * 100;
    const quoteScore = (quote.netPosition / maxPos) * 100;

    const pairScore = baseScore - quoteScore;
    const clampedScore = Math.max(-100, Math.min(100, pairScore));

    const bullPercent = Math.round(50 + clampedScore / 2);
    const bearPercent = 100 - bullPercent;

    const bullContracts = base.long + quote.short;
    const bearContracts = base.short + quote.long;

    let verdict: 'STRONG BULLISH' | 'BULLISH' | 'SLIGHTLY BULLISH' | 'NEUTRAL' | 'SLIGHTLY BEARISH' | 'BEARISH' | 'STRONG BEARISH';
    if (clampedScore > 60) verdict = 'STRONG BULLISH';
    else if (clampedScore > 30) verdict = 'BULLISH';
    else if (clampedScore > 10) verdict = 'SLIGHTLY BULLISH';
    else if (clampedScore > -10) verdict = 'NEUTRAL';
    else if (clampedScore > -30) verdict = 'SLIGHTLY BEARISH';
    else if (clampedScore > -60) verdict = 'BEARISH';
    else verdict = 'STRONG BEARISH';

    const isBullish = clampedScore > 0;

    return {
      pair: `${baseCurrency}${quoteCurrency}`,
      pairScore: clampedScore,
      bullPercent,
      bearPercent,
      bullContracts,
      bearContracts,
      verdict,
      isBullish,
      base: { ...base, currency: baseCurrency },
      quote: { ...quote, currency: quoteCurrency },
    };
  }, [baseCurrency, quoteCurrency, positions]);

  const formatContracts = (n: number) => {
    if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict.includes('STRONG BULLISH')) return 'text-success';
    if (verdict.includes('BULLISH')) return 'text-success';
    if (verdict.includes('STRONG BEARISH')) return 'text-destructive';
    if (verdict.includes('BEARISH')) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getVerdictBg = (verdict: string) => {
    if (verdict.includes('BULLISH')) return 'bg-success/10 border-success/20';
    if (verdict.includes('BEARISH')) return 'bg-destructive/10 border-destructive/20';
    return 'bg-muted/10 border-muted/20';
  };

  // Historical positioning chart data
  const historicalChartData = useMemo(() => {
    const baseHist = historicalNet[baseCurrency];
    const quoteHist = historicalNet[quoteCurrency];
    if (!baseHist?.length || !quoteHist?.length) return null;
    const quoteByDate = new Map(quoteHist.map((q) => [q.date, q.value]));
    return baseHist
      .filter((item) => quoteByDate.has(item.date))
      .map((item) => ({
        date: item.date,
        [baseCurrency]: item.value,
        [quoteCurrency]: quoteByDate.get(item.date) ?? 0,
      }));
  }, [baseCurrency, quoteCurrency, historicalNet]);

  // Generate concise Smart Money Insight (≤150 words)
  const smartMoneyInsight = useMemo(() => {
    if (!analysis) return null;

    const base = analysis.base;
    const quote = analysis.quote;
    const baseName = base.currency;
    const quoteName = quote.currency;

    const baseDir = base.netPosition > 0 ? 'long' : 'short';
    const quoteDir = quote.netPosition > 0 ? 'long' : 'short';

    const favoredCurrency = analysis.isBullish ? baseName : quoteName;
    const direction = analysis.isBullish ? 'bullish' : 'bearish';

    const baseFlow = base.weeklyChange > 0 ? `+${formatContracts(base.weeklyChange)}` : formatContracts(base.weeklyChange);
    const quoteFlow = quote.weeklyChange > 0 ? `+${formatContracts(quote.weeklyChange)}` : formatContracts(quote.weeklyChange);

    return { baseName, quoteName, baseDir, quoteDir, baseFlow, quoteFlow, favoredCurrency, direction, baseNet: formatContracts(Math.abs(base.netPosition)), quoteNet: formatContracts(Math.abs(quote.netPosition)) };
  }, [analysis]);

  return (
    <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2 font-display-hero text-xl">
          <Zap className="w-5 h-5 text-primary" />
          COT Pair Analyzer
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Compare institutional positioning between any two currencies using the latest stored CFTC report{reportDate ? ` (${reportDate})` : ''}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">Base Currency</label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="bg-background/50 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== quoteCurrency).map(c => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ArrowRight className="w-5 h-5 text-muted-foreground mt-4 hidden sm:block" />
          
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block font-medium">Quote Currency</label>
            <Select value={quoteCurrency} onValueChange={setQuoteCurrency}>
              <SelectTrigger className="bg-background/50 border-border/30 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {analysis && smartMoneyInsight && (
          <>
            {/* Verdict */}
            <div className={`rounded-xl p-5 border ${getVerdictBg(analysis.verdict)} text-center`}>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Institutional Verdict</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-display-hero font-bold text-foreground">
                  {baseCurrency}{quoteCurrency}
                </span>
              </div>
              <div className={`text-2xl font-bold mt-2 ${getVerdictColor(analysis.verdict)}`}>
                {analysis.verdict}
              </div>
            </div>

            {/* Bull/Bear Meter */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-success font-medium">
                  <TrendingUp className="w-4 h-4" /> Bulls {analysis.bullPercent}%
                </span>
                <span className="flex items-center gap-1 text-destructive font-medium">
                  Bears {analysis.bearPercent}% <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="relative h-3 bg-destructive/20 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.bullPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatContracts(analysis.bullContracts)} contracts</span>
                <span>{formatContracts(analysis.bearContracts)} contracts</span>
              </div>
            </div>

            {/* Individual Currency Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[analysis.base, analysis.quote].map((curr) => (
                <div key={curr.currency} className="rounded-xl bg-muted/20 p-4 border border-border/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground flex items-center gap-2">
                      {curr.currency}
                    </span>
                    <Badge variant="secondary" className={`text-xs ${
                      curr.sentiment === 'BULLISH' ? 'bg-success/20 text-success' :
                      curr.sentiment === 'BEARISH' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted/30 text-muted-foreground'
                    }`}>
                      {curr.sentiment}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Position</span>
                      <span className={`font-mono font-bold ${curr.netPosition > 0 ? 'text-success' : 'text-destructive'}`}>
                        {curr.netPosition > 0 ? '+' : ''}{curr.netPosition.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weekly Δ</span>
                      <span className={`font-mono text-xs ${curr.weeklyChange > 0 ? 'text-success' : 'text-destructive'}`}>
                        {curr.weeklyChange > 0 ? '+' : ''}{curr.weeklyChange.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Long / Short</span>
                      <span className="font-mono text-foreground">
                        {formatContracts(curr.long)} / {formatContracts(curr.short)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Historical Positioning Chart */}
            {historicalChartData && baseCurrency !== 'USD' && quoteCurrency !== 'USD' && (
              <div className="rounded-xl bg-muted/10 p-5 border border-border/20">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Positioning Over Time (Net Contracts)
                </h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={historicalChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Line type="monotone" dataKey={baseCurrency} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }} />
                    <Line type="monotone" dataKey={quoteCurrency} stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-5))' }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                   Stored speculative net positions • historical rows may use different trader categories and are not directly comparable{reportDate ? ` • Latest ${reportDate}` : ''}
                </p>
              </div>
            )}

             <p className="text-xs text-muted-foreground">This comparison uses the stored speculative category only. Dealer and asset-manager breakdowns are not available in this feed.</p>

            {/* Smart Money Insight — concise, ≤150 words */}
            <div className="rounded-xl bg-primary/5 p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">Smart Money Insight</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Speculative traders are <strong className={smartMoneyInsight.baseDir === 'long' ? 'text-success' : 'text-destructive'}>net {smartMoneyInsight.baseDir} {smartMoneyInsight.baseName}</strong> ({smartMoneyInsight.baseNet} contracts) and <strong className={smartMoneyInsight.quoteDir === 'long' ? 'text-success' : 'text-destructive'}>net {smartMoneyInsight.quoteDir} {smartMoneyInsight.quoteName}</strong> ({smartMoneyInsight.quoteNet} contracts).
                
                Weekly flow: {smartMoneyInsight.baseName} {smartMoneyInsight.baseFlow}, {smartMoneyInsight.quoteName} {smartMoneyInsight.quoteFlow}.
                
                The net differential is <strong className={analysis.isBullish ? 'text-success' : 'text-destructive'}>{smartMoneyInsight.direction}</strong> for {analysis.pair}, favoring <strong className="text-foreground">{smartMoneyInsight.favoredCurrency}</strong>.
                
                {' '}Positioning is a weekly snapshot, not a price forecast; check current prices before acting.
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Data: latest stored CFTC Financial Traders Report{reportDate ? ` • Positions as of ${reportDate}` : ''}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default COTPairAnalyzer;
