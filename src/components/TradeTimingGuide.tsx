import { useEffect, useState } from "react";
import { CalendarClock, ShieldAlert } from "lucide-react";
import { useLatestCOT } from "@/hooks/useLatestCOT";
import { useSpotMomentum } from "@/hooks/useSpotMomentum";
import { useMarketRhythm } from "@/hooks/useMarketRhythm";
import { alignedWeekday, timingAssessment } from "@/lib/tradeTiming";
import { Badge } from "@/components/ui/badge";

export default function TradeTimingGuide({ base, quote, direction }: { base: string; quote: string; direction: "LONG" | "SHORT" | "WAIT" }) {
  const { data: cot } = useLatestCOT();
  const { data: spot } = useSpotMomentum();
  const rhythm = useMarketRhythm();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(timer); }, []);
  const row = rhythm.data?.find(r => r.ok && r.pair === `${base}${quote}`);
  const isForex = !["XAU", "BTC", "USDINDEX"].includes(base) && base !== quote;
  const dates = base === quote ? [cot?.[base]?.reportDate ?? ""] : [cot?.[base]?.reportDate ?? "", cot?.[quote]?.reportDate ?? ""];
  const assessment = timingAssessment({ direction, reportDates: dates, priceDate: isForex ? spot?.to : row?.asOf, now, isForex });
  const day = alignedWeekday(row?.dayOfWeek ?? [], direction);
  const session = [base, quote].some(c => ["EUR", "GBP", "CHF", "CAD", "USD", "MXN"].includes(c))
    ? "London / New York overlap" : "Tokyo / Sydney sessions";

  return <div className="mt-3 space-y-3 border-t border-border/60 pt-3 text-xs" aria-label={`Entry timing for ${base}${quote}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 font-semibold text-foreground"><CalendarClock className="h-4 w-4 text-primary" /> Entry timing</span>
      <Badge variant="outline" className={assessment.status === "WAIT" ? "text-warning border-warning/40" : "text-primary border-primary/40"}>{assessment.status}</Badge>
    </div>
    <p className="leading-relaxed text-foreground">{assessment.reason}</p>
    <dl className="grid gap-2 sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Historical day tendency</dt><dd className="mt-1 text-foreground">{day ? `${day.day} · ${day.avgPct > 0 ? "+" : ""}${day.avgPct.toFixed(2)}% average · ${day.samples} observations · ${direction === "LONG" ? day.upRate : 100 - day.upRate}% in this direction` : "No supported day advantage"}</dd></div>
      <div><dt className="text-muted-foreground">Session to review</dt><dd className="mt-1 text-foreground">{isForex ? session : "Check this instrument’s exchange hours"} · liquidity context, not a tested timing edge</dd></div>
    </dl>
    <p className="flex items-start gap-1.5 leading-relaxed text-warning"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Avoid chasing an extended move, entering before a major release, or trading with wide spreads. Resume only after spreads settle and a fresh candle confirms; do not average into a failed setup.</p>
    <p className="text-muted-foreground">Daily evidence: {isForex ? `ECB reference rates through ${spot?.to ?? "unavailable"}` : `Yahoo daily close through ${row?.asOf ?? "unavailable"}`}. No intraday entry has been verified. Historical tendencies are not guarantees.</p>
  </div>;
}