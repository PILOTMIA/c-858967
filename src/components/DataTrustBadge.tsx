import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { latestReportDate, useLatestCOT } from "@/hooks/useLatestCOT";
import { BadgeCheck, CalendarClock, Database, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Consumer-facing trust signal: explains where the numbers come from,
 * when they were last verified, and how the site keeps them accurate.
 * Tap-friendly (Popover) so it works on mobile and desktop.
 */
const DataTrustBadge = () => {
  const { data } = useLatestCOT();
  const reportDate = latestReportDate(data);
  const markets = data ? Object.keys(data).length : 0;
  const currentMarkets = Object.values(data ?? {}).filter(p => p.reportDate === reportDate);
  const matched = currentMarkets.filter(p => p.source.includes("verified_upload")).length;
  const valid = currentMarkets.filter(p => Number.isInteger(p.long) && Number.isInteger(p.short) && p.long >= 0 && p.short >= 0 && p.long - p.short === p.net).length;

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
        <Button
          variant="outline"
          type="button"
          className="hq-status hq-status-live inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Why you can trust this data"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {matched === markets && markets > 0 ? "Report matched" : "CFTC source"}{formatted ? ` · ${formatted}` : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3 text-sm" align="end">
        <p className="font-semibold text-foreground">Why you can trust these numbers</p>
        <ul className="space-y-2.5 text-muted-foreground">
          <li className="flex gap-2">
            <Database className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Position counts are from <a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFTC futures-only reports</a>. Financial markets use Leveraged Funds; commodities use Managed Money. These are not all institutions or live spot-market volume.
            </span>
          </li>
          <li className="flex gap-2">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              {formatted
                ? `${formatted}: ${currentMarkets.length} of ${markets} markets on this report date; ${matched} marked as matched to uploaded reports. ${valid} pass longs-minus-shorts checks. Older markets are not included in this date’s verification.`
                : "Each number is checked so longs minus shorts equals the net position before it goes live."}
            </span>
          </li>
          <li className="flex gap-2">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              COT usually publishes Friday with Tuesday’s positions. It is delayed weekly evidence. Refreshing a page does not make prices live; check each feed’s own timestamp.
            </span>
          </li>
        </ul>
        <p className="border-t border-border pt-2 text-xs text-muted-foreground">
          COT counts are evidence. Scores, squeeze labels, seasonality and timing guidance are derived analysis, not CFTC forecasts or guaranteed trade outcomes.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default DataTrustBadge;
