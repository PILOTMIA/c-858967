import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wheat, Sparkles } from "lucide-react";

// Managed Money (speculator) positions from CFTC Disaggregated COT — August 11, 2026
// vs. August 4, 2026 (change in Managed Money net = change_long - change_short)
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
  { commodity: "Corn", exchange: "CBOT", long: 312829, short: 186954, changeLong: 3112, changeShort: 22058, unit: "5,000 bu", note: "Shorts rebuilt +22.1k against modest long adds — net-long trimmed to +125.9k" },
  { commodity: "Wheat SRW", exchange: "CBOT", long: 78009, short: 111409, changeLong: -2028, changeShort: 6502, unit: "5,000 bu", note: "Longs liquidating while shorts pile in — net-short widens to -33.4k" },
  { commodity: "Wheat HRW", exchange: "CBOT", long: 63122, short: 37516, changeLong: -3834, changeShort: 2056, unit: "5,000 bu", note: "Bullish conviction fading — net-long down to +25.6k" },
  { commodity: "Lean Hogs", exchange: "CME", long: 59057, short: 83420, changeLong: 2714, changeShort: 7898, unit: "40,000 lbs", note: "Both sides adding, shorts faster — net-short deepens to -24.4k" },
  { commodity: "Live Cattle", exchange: "CME", long: 82466, short: 16517, changeLong: -772, changeShort: -1755, unit: "40,000 lbs", note: "Shorts covering faster than longs exit — net-long holds near +66.0k" },
  { commodity: "Feeder Cattle", exchange: "CME", long: 17685, short: 6783, changeLong: -249, changeShort: -751, unit: "50,000 lbs", note: "Short covering lifts net-long to +10.9k — feeder complex firming" },
  { commodity: "Soybeans", exchange: "CBOT", long: 169712, short: 60603, changeLong: -9787, changeShort: 13628, unit: "5,000 bu", note: "Heaviest bullish unwind in the complex — net-long cut -23.4k to +109.1k" },
  { commodity: "Soybean Oil", exchange: "CBOT", long: 110018, short: 30734, changeLong: 3908, changeShort: 3657, unit: "60,000 lbs", note: "Two-way flow, net-long steady at +79.3k" },
  { commodity: "Soybean Meal", exchange: "CBOT", long: 122391, short: 48701, changeLong: -4038, changeShort: 102, unit: "100 short tons", note: "Longs trimming — net-long eases to +73.7k" },
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
          <div>Report: <span className="text-foreground font-medium">Aug 11, 2026</span></div>
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
