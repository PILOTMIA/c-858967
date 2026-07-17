import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wheat, Sparkles } from "lucide-react";

// Managed Money (speculator) positions from CFTC Disaggregated COT — July 07, 2026
// vs. June 30, 2026 (change in Managed Money net = change_long - change_short)
type AgRow = {
  commodity: string;
  exchange: string;
  long: number;
  short: number;
  changeLong: number;
  changeShort: number;
  unit: string;
  note: string;
};

const AG_DATA: AgRow[] = [
  { commodity: "Corn", exchange: "CBOT", long: 287447, short: 302446, changeLong: -5844, changeShort: -57841, unit: "5,000 bu", note: "Shorts covering aggressively — bias flipping less bearish" },
  { commodity: "Wheat SRW", exchange: "CBOT", long: 73719, short: 134151, changeLong: 4617, changeShort: -2512, unit: "5,000 bu", note: "Still net-short but funds trimming bearish bets" },
  { commodity: "Wheat HRW", exchange: "CBOT", long: 63305, short: 54576, changeLong: 3735, changeShort: -32, unit: "5,000 bu", note: "Barely net-long — first bullish tilt in weeks" },
  { commodity: "Live Cattle", exchange: "CME", long: 124854, short: 9946, changeLong: -3759, changeShort: 773, unit: "40,000 lbs", note: "Extreme long positioning — crowded trade risk" },
  { commodity: "Feeder Cattle", exchange: "CME", long: 21549, short: 6983, changeLong: -1475, changeShort: -434, unit: "50,000 lbs", note: "Longs reducing exposure — momentum cooling" },
  { commodity: "Lean Hogs", exchange: "CME", long: 54564, short: 94954, changeLong: 2928, changeShort: 4907, unit: "40,000 lbs", note: "Net short deepening — supply pressure" },
];

const AgricultureCOT = () => {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/60 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)]">
      {/* Ambient glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 border border-primary/20">
            <Wheat className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                Agriculture COT — Managed Money
              </h2>
              <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 gap-1">
                <Sparkles className="w-3 h-3" /> New
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Food is everything. Grains and livestock feed the inflation story that drives yields, the dollar, and gold.
              Speculator positioning here often leads CPI prints by weeks.
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground shrink-0">
          <div>Report: <span className="text-foreground font-medium">Jul 07, 2026</span></div>
          <div>Source: CFTC Disaggregated</div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AG_DATA.map((row) => {
          const net = row.long - row.short;
          const netChange = row.changeLong - row.changeShort;
          const bullish = net > 0;
          const flowBullish = netChange > 0;
          const total = row.long + row.short;
          const longPct = total > 0 ? (row.long / total) * 100 : 50;

          return (
            <div
              key={row.commodity}
              className="group rounded-xl border border-border/50 bg-background/40 hover:bg-background/60 hover:border-primary/40 transition-all p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">{row.commodity}</div>
                  <div className="text-[11px] text-muted-foreground">{row.exchange} · {row.unit}</div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${bullish ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-red-500/40 text-red-400 bg-red-500/10"}`}
                >
                  {bullish ? "NET LONG" : "NET SHORT"}
                </Badge>
              </div>

              <div>
                <div className={`text-2xl font-bold tracking-tight ${bullish ? "text-emerald-400" : "text-red-400"}`}>
                  {net > 0 ? "+" : ""}{net.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs mt-0.5">
                  {flowBullish ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className={flowBullish ? "text-emerald-400" : "text-red-400"}>
                    {netChange > 0 ? "+" : ""}{netChange.toLocaleString()} WoW
                  </span>
                </div>
              </div>

              {/* Long vs Short bar */}
              <div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                  <div className="h-full bg-emerald-500/70" style={{ width: `${longPct}%` }} />
                  <div className="h-full bg-red-500/70" style={{ width: `${100 - longPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>L {row.long.toLocaleString()}</span>
                  <span>S {row.short.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                {row.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="text-xs font-semibold text-foreground mb-1">Why agriculture matters to FX & Gold</div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Rising grain and livestock prices feed directly into food CPI — the most visible component of headline inflation.
          When speculators pile into long grains + long cattle, expect stickier CPI, hawkish Fed repricing, and headwinds for gold.
          Falling ag positioning has the opposite effect: disinflation tailwind, dovish tilt, gold support.
        </p>
      </div>
    </Card>
  );
};

export default AgricultureCOT;
