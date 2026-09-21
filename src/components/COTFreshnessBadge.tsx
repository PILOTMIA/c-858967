import { Badge } from "@/components/ui/badge";
import { latestReportDate, useLatestCOT } from "@/hooks/useLatestCOT";
import { Radio } from "lucide-react";

const COTFreshnessBadge = ({ compact = false }: { compact?: boolean }) => {
  const { data, isFetching } = useLatestCOT();
  const reportDate = latestReportDate(data);
  const age = reportDate ? Math.floor((Date.now() - new Date(`${reportDate}T00:00:00Z`).getTime()) / 86_400_000) : null;
  const fresh = age !== null && age <= 10;

  return (
    <Badge variant="outline" className={`hq-status ${fresh ? "hq-status-live" : "hq-status-risk"}`}>
      <Radio className={`h-3 w-3 ${isFetching ? "animate-pulse" : ""}`} />
      {compact ? (reportDate ?? "No COT data") : `${fresh ? "Verified" : "Check feed"} · ${reportDate ?? "unavailable"}`}
    </Badge>
  );
};

export default COTFreshnessBadge;