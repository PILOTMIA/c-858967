import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, AlertOctagon, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface InstrumentHealth {
  currency: string;
  latest_report: string | null;
  age_days: number | null;
  status: "fresh" | "stale" | "critical" | "missing";
  rows_total: number;
  field_issues: string[];
}

interface HealthReport {
  generated_at: string;
  overall: "healthy" | "warning" | "critical";
  fresh: number;
  stale: number;
  critical: number;
  missing: number;
  instruments: InstrumentHealth[];
  next_cron_runs_utc: string[];
}

const callFn = async (path: string, method: "GET" | "POST" = "GET") => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`${path} failed (${res.status})`);
  return res.json();
};

const COTDataHealthBanner = () => {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data, isLoading, refetch } = useQuery<HealthReport>({
    queryKey: ["cot-data-health"],
    queryFn: () => callFn("cot-data-health"),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 15,
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await callFn("cot-history-sync", "POST");
      toast.success(`Synced — ${r.inserted ?? 0} rows verified, ${r.rejected ?? 0} rejected`);
      await Promise.all([
        refetch(),
        qc.invalidateQueries({ queryKey: ["cot-wow"] }),
        qc.invalidateQueries({ queryKey: ["cot-history-recos"] }),
        qc.invalidateQueries({ queryKey: ["cot-history"] }),
      ]);
    } catch (e: any) {
      toast.error(`Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (isLoading || !data) return null;

  const tone =
    data.overall === "critical"
      ? { bg: "from-destructive/15 to-destructive/[0.04]", border: "border-destructive/40", text: "text-destructive", Icon: AlertOctagon, label: "Action Needed" }
      : data.overall === "warning"
      ? { bg: "from-warning/15 to-warning/[0.04]", border: "border-warning/40", text: "text-warning", Icon: AlertTriangle, label: "Stale Feed" }
      : { bg: "from-success/15 to-success/[0.04]", border: "border-success/40", text: "text-success", Icon: CheckCircle2, label: "All Feeds Verified" };

  const flagged = data.instruments.filter((i) => i.status !== "fresh");
  const totalIssues = data.instruments.reduce((s, i) => s + i.field_issues.length, 0);

  return (
    <Card className={`relative overflow-hidden border ${tone.border} bg-gradient-to-br ${tone.bg} backdrop-blur-sm p-5`}>
      <div className="flex items-start gap-4 flex-wrap">
        <div className={`p-2.5 rounded-xl bg-background/40 border border-border/30 ${tone.text}`}>
          <tone.Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display-hero text-lg font-bold text-foreground">Data Integrity</h3>
            <Badge variant="outline" className={`text-[10px] border-border/50 ${tone.text}`}>
              <ShieldCheck className="w-3 h-3 mr-1" />
              {tone.label}
            </Badge>
          </div>
          <p className="text-xs text-foreground/75 mt-1">
            {data.fresh}/{data.instruments.length} feeds fresh • {totalIssues} field {totalIssues === 1 ? "issue" : "issues"} •
            Auto-syncs {data.next_cron_runs_utc.join(" + ")} • Last checked {new Date(data.generated_at).toLocaleTimeString()}
          </p>

          {flagged.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {flagged.map((i) => (
                <Badge
                  key={i.currency}
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    i.status === "critical" || i.status === "missing"
                      ? "border-destructive/40 text-destructive"
                      : "border-warning/40 text-warning"
                  }`}
                  title={i.field_issues.join("; ") || `${i.age_days ?? "?"} days old`}
                >
                  {i.currency} • {i.status}{i.age_days != null ? ` ${i.age_days}d` : ""}
                </Badge>
              ))}
            </div>
          )}

          {totalIssues > 0 && (
            <details className="mt-2 text-[11px] text-foreground/70">
              <summary className="cursor-pointer hover:text-foreground">View field-integrity issues</summary>
              <ul className="mt-1 ml-4 list-disc space-y-0.5">
                {data.instruments
                  .filter((i) => i.field_issues.length)
                  .flatMap((i) => i.field_issues.map((e, k) => <li key={`${i.currency}-${k}`}>{i.currency}: {e}</li>))}
              </ul>
            </details>
          )}
        </div>

        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync now"}
        </Button>
      </div>
    </Card>
  );
};

export default COTDataHealthBanner;
