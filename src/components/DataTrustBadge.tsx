import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { latestReportDate, useLatestCOT } from "@/hooks/useLatestCOT";
import { BadgeCheck, CalendarClock, Database, ShieldCheck } from "lucide-react";

/**
 * Consumer-facing trust signal: explains where the numbers come from,
 * when they were last verified, and how the site keeps them accurate.
 * Tap-friendly (Popover) so it works on mobile and desktop.
 */
const DataTrustBadge = () => {
  const { data } = useLatestCOT();
  const reportDate = latestReportDate(data);
  const markets = data ? Object.keys(data).length : 0;

  const formatted = reportDate
    ? new Date(`${reportDate}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hq-status hq-status-live inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Why you can trust this data"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified against CFTC{formatted ? ` · ${formatted}` : ""}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3 text-sm" align="end">
        <p className="font-semibold text-foreground">Why you can trust these numbers</p>
        <ul className="space-y-2.5 text-muted-foreground">
          <li className="flex gap-2">
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Every figure comes from the official <span className="text-foreground">U.S. CFTC Commitment of Traders</span> report — the same source banks and institutions use. Nothing is estimated or invented.
            </span>
          </li>
          <li className="flex gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              {formatted
                ? `Latest report verified: ${formatted}, covering ${markets} markets. Each number is checked so longs minus shorts equals the net position before it goes live.`
                : "Each number is checked so longs minus shorts equals the net position before it goes live."}
            </span>
          </li>
          <li className="flex gap-2">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              New COT reports publish every Friday and sync automatically each morning. Prices and news refresh every few minutes throughout the day.
            </span>
          </li>
        </ul>
        <p className="border-t border-border pt-2 text-xs text-muted-foreground">
          Source: cftc.gov — Commitment of Traders, weekly report.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default DataTrustBadge;
