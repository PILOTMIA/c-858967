import type { ChartDraft } from "@/lib/journal/chart";
import { Badge } from "@/components/ui/badge";

const statusText = { supported: "Supported", developing: "Developing", not_supported: "Not supported", insufficient_context: "Insufficient context" } as const;
const checkText = { met: "Met", pending: "Pending", not_met: "Not met", unclear: "Unclear" } as const;
const checkTone = { met: "text-emerald-600 dark:text-emerald-400", pending: "text-amber-600 dark:text-amber-400", not_met: "text-destructive", unclear: "text-muted-foreground" } as const;

export default function SetupReviewPanel({ draft, isSample }: { draft: ChartDraft; isSample: boolean }) {
  const [primary, ...alternatives] = draft.setupReviews ?? [];
  return (
    <section className="rounded-lg border border-border bg-card p-4 space-y-3" aria-label="Setup review">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">Setup review</h2>
        <Badge variant="outline">{isSample ? "Prepared sample · not live AI" : "AI draft · check before saving"}</Badge>
      </div>
      {!primary ? <p className="text-sm text-foreground">{draft.summary}</p> : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-foreground">{primary.name}</strong>
            <Badge variant="secondary">Inferred setup bias: {primary.direction}</Badge>
            <Badge variant={primary.status === "supported" ? "default" : "outline"}>{statusText[primary.status]}</Badge>
          </div>
          <p className="text-sm text-foreground">{primary.thesis}</p>
          <ul className="space-y-1.5">
            {primary.checks.map((c, i) => (
              <li key={i} className="text-sm"><span className={`font-medium ${checkTone[c.status]}`}>{checkText[c.status]}</span>{c.required && <span className="text-xs text-muted-foreground"> · required</span>} — <span className="text-foreground">{c.criterion}:</span> <span className="text-muted-foreground">{c.evidence}</span></li>
            ))}
          </ul>
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Confirmation</dt><dd className="text-foreground">{primary.confirmation}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Invalidation</dt><dd className="text-foreground">{primary.invalidation}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Takeaway</dt><dd className="text-foreground">{primary.lesson}</dd></div>
          </dl>
          <p className="text-xs text-muted-foreground">The inferred setup bias is a chart interpretation. It is separate from your actual trade direction and labelled levels, and is not a trade signal.</p>
        </div>
      )}
      {(draft.marketContext || alternatives.length > 0 || draft.missing.length > 0) && (
        <details className="text-sm">
          <summary className="cursor-pointer text-primary">More context{alternatives.length ? " and alternative" : ""}</summary>
          <div className="mt-2 space-y-2 text-foreground">
            {draft.marketContext && <p><span className="text-muted-foreground">Structure ({draft.marketContext.structure}): </span>{draft.marketContext.narrative}</p>}
            {draft.marketContext?.levels.map((l, i) => <p key={i}><strong>{l.name}</strong> {l.value} <span className="text-muted-foreground">({l.basis}) — {l.significance}</span></p>)}
            {alternatives.map((a, i) => <p key={i}><strong>Alternative: {a.name}</strong> · {a.direction} · {statusText[a.status]} — {a.thesis}</p>)}
            {draft.missing.length > 0 && <p><span className="text-muted-foreground">Not shown: </span>{draft.missing.join("; ")}</p>}
          </div>
        </details>
      )}
    </section>
  );
}
