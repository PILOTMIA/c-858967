import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, BookOpen, Download, ImagePlus, Loader2, Lock, RotateCcw, ScanLine, Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import SetupReviewPanel from "@/components/journal/SetupReviewPanel";
import { plannedR, riskError, SAMPLE_DRAFT, tradeInputSchema, type ChartDraft, type TradeInput } from "@/lib/journal/chart";
import { SETUP_FOCUS, REVIEW_DEFINITIONS, type ReviewParameters } from "@/lib/journal/setups";
import { filterTrades, journalCsv, normaliseTrade, type JournalFilter, type JournalTrade, type TradeRow } from "@/lib/journal/records";

type FormValues = { symbol: string; timeframe: string; direction: TradeInput["direction"]; entry: string; stopLoss: string; takeProfit: string; setup: string; session: TradeInput["session"]; stage: TradeInput["stage"]; tradeDate: string; notes: string; outcome: TradeInput["outcome"] };
const emptyForm = (): FormValues => ({ symbol: "", timeframe: "", direction: "unknown", entry: "", stopLoss: "", takeProfit: "", setup: "", session: "Unknown", stage: "planned", tradeDate: "", notes: "", outcome: "not_recorded" });
const asNumber = (s: string) => (s.trim() === "" ? null : Number(s));
const price = (n: number | null) => (n == null ? "—" : String(n));
const outcomeLabels = { not_recorded: "Not recorded", win: "Win", loss: "Loss", breakeven: "Breakeven" } as const;
const stageLabels = { planned: "Planned", open: "Open", closed: "Closed" } as const;
const selectCls = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";
const FN_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

async function callFunction(name: string, body: FormData, extra: Record<string, string> = {}) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${FN_URL}/${name}`, { method: "POST", body, headers: { ...extra, Authorization: `Bearer ${data.session?.access_token ?? ""}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, data: json };
}

async function hasImageSignature(file: File) {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const s = (a: number, z: number) => String.fromCharCode(...b.slice(a, z));
  return (b[0] === 0x89 && s(1, 4) === "PNG") || (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || (s(0, 4) === "RIFF" && s(8, 12) === "WEBP");
}

export default function Journal() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [view, setView] = useState<"review" | "journal">("review");
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [draft, setDraft] = useState<ChartDraft | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [verified, setVerified] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState<"analyse" | "save" | "sample" | null>(null);
  const [error, setError] = useState("");
  const [providerDetails, setProviderDetails] = useState<{ code?: string; providerDetails?: string; requestId?: string } | null>(null);
  const [focus, setFocus] = useState<ReviewParameters["focus"]>("auto");
  const [context, setContext] = useState("");
  const [rules, setRules] = useState("");
  const [trades, setTrades] = useState<JournalTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [journalError, setJournalError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<JournalFilter>("all");
  const [archived, setArchived] = useState(false);
  const [selected, setSelected] = useState<JournalTrade | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [archiveBusy, setArchiveBusy] = useState(false);
  // The user's Anthropic key lives only in this component's memory: never persisted, cleared on reload.
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user.id ?? null));
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => () => { if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  const loadJournal = useCallback(async () => {
    setLoading(true); setJournalError("");
    const { data, error } = await supabase.from("trades").select("id, created_at, archived, record, image_key").order("created_at", { ascending: false }).limit(500);
    if (error) setJournalError("Could not load your journal."); else setTrades((data as TradeRow[]).map(normaliseTrade));
    setLoading(false);
  }, []);
  useEffect(() => { if (userId) void loadJournal(); else setTrades([]); }, [userId, loadJournal]);

  useEffect(() => {
    setSelectedImage("");
    if (!selected?.imageKey) return;
    let cancelled = false;
    supabase.storage.from("chart-images").createSignedUrl(selected.imageKey, 300).then(({ data }) => { if (!cancelled && data) setSelectedImage(data.signedUrl); });
    return () => { cancelled = true; };
  }, [selected?.id, selected?.imageKey]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) { setForm(f => ({ ...f, [key]: value })); setVerified(false); setError(""); }
  function settingsChanged() { setDraft(null); setVerified(false); setError(""); }
  function reset() { setFile(null); setImageUrl(""); setImageKey(null); setIsSample(false); setDraft(null); setForm(emptyForm()); setVerified(false); setError(""); setProviderDetails(null); }

  async function pickFile(next: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(next.type)) { setError("Choose a PNG, JPG or WebP screenshot."); return false; }
    if (next.size > 5 * 1024 * 1024) { setError("Choose an image smaller than 5 MB."); return false; }
    if (!(await hasImageSignature(next))) { setError("This file is not a valid PNG, JPG or WebP image."); return false; }
    reset(); setFile(next); setImageUrl(URL.createObjectURL(next)); return true;
  }
  function applyDraft(d: ChartDraft) {
    setDraft(d); setVerified(false);
    setForm(f => ({ ...f, symbol: d.symbol || "", timeframe: d.timeframe || "", direction: d.direction || "unknown", entry: d.entry == null ? "" : String(d.entry), stopLoss: d.stopLoss == null ? "" : String(d.stopLoss), takeProfit: d.takeProfit == null ? "" : String(d.takeProfit), setup: d.setup || "" }));
  }
  async function loadSample() {
    setBusy("sample");
    try {
      const res = await fetch("/sample-chart.png"); if (!res.ok) throw new Error();
      const f = new File([await res.blob()], "prepared-sample-chart.png", { type: "image/png" });
      if (await pickFile(f)) { setIsSample(true); setFocus("auto"); setContext("Prepared sample chart"); setRules(""); applyDraft(SAMPLE_DRAFT); setForm(v => ({ ...v, session: "London" })); toast("Prepared sample loaded. These are example details, not a live AI reading."); }
    } catch { setError("The sample chart could not be loaded."); }
    setBusy(null);
  }
  async function analyse() {
    if (!file || busy || !apiKey) return;
    setBusy("analyse"); setError(""); setProviderDetails(null);
    const body = new FormData(); body.append("image", file); body.append("focus", focus); body.append("context", context); body.append("rules", rules);
    const { ok, data } = await callFunction("analyse-chart", body, { "x-claude-key": apiKey }).catch(() => ({ ok: false, data: { error: "Could not reach the analysis service." } }));
    setBusy(null);
    if (!ok) { setError(data.error || "The chart could not be read."); setProviderDetails(data); return; }
    if (!data.draft?.isTradingChart) { setError(data.draft?.summary || "Try a screenshot with a financial price chart."); return; }
    setIsSample(false); applyDraft(data.draft); setImageKey(data.imageKey);
    toast("Setup assessment ready. Check the evidence and trade details before saving.");
  }
  function recordInput(): TradeInput | null {
    const parsed = tradeInputSchema.safeParse({ ...form, entry: asNumber(form.entry), stopLoss: asNumber(form.stopLoss), takeProfit: asNumber(form.takeProfit), verified, isSample, analysis: draft });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(issue?.path[0] === "verified" ? "Tick the confirmation box before saving." : ["entry", "stopLoss", "takeProfit"].includes(String(issue?.path[0])) ? "Prices must be positive numbers, or left blank if not shown." : issue?.message || "Please check the trade details.");
      return null;
    }
    const risk = riskError(parsed.data); if (risk) { setError(risk); return null; }
    return parsed.data;
  }
  function requestSave() { if (recordInput()) setConfirmOpen(true); }
  async function save() {
    const record = recordInput(); if (!record || !file) return;
    setConfirmOpen(false); setBusy("save"); setError("");
    const body = new FormData(); body.append("record", JSON.stringify(record));
    if (imageKey) body.append("imageKey", imageKey); else body.append("image", file);
    const { ok, data } = await callFunction("save-trade", body).catch(() => ({ ok: false, data: { error: "Could not reach the journal." } }));
    setBusy(null);
    if (!ok) { setError(data.error || "Could not save your review."); return; }
    const trade = normaliseTrade(data.trade);
    setTrades(t => [trade, ...t]); reset(); setView("journal"); setArchived(false); setSelected(trade);
    toast("Review saved to your private journal.");
  }
  async function toggleArchive(t: JournalTrade) {
    setArchiveBusy(true);
    const { error } = await supabase.from("trades").update({ archived: !t.archived }).eq("id", t.id);
    setArchiveBusy(false);
    if (error) { toast.error("Could not update the review."); return; }
    const updated = { ...t, archived: !t.archived };
    setTrades(prev => prev.map(r => (r.id === t.id ? updated : r))); setSelected(updated);
    toast(updated.archived ? "Review archived. You can restore it any time." : "Review restored.");
  }
  const filtered = useMemo(() => filterTrades(trades, { archived, filter, search }), [trades, archived, filter, search]);
  function exportCsv() {
    const url = URL.createObjectURL(new Blob([journalCsv(filtered)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "trading-journal.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const rr = plannedR({ direction: form.direction, entry: asNumber(form.entry), stopLoss: asNumber(form.stopLoss), takeProfit: asNumber(form.takeProfit) });

  if (userId === undefined) return <main className="container mx-auto px-4 py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></main>;
  if (!userId) return (
    <main className="container mx-auto max-w-lg px-4 py-16 text-center space-y-4">
      <Lock className="mx-auto h-8 w-8 text-primary" />
      <h1 className="text-2xl font-semibold text-foreground">Trading Journal</h1>
      <p className="text-muted-foreground">Sign in to review charts and keep a private journal. Your trades and chart images are visible only to you.</p>
      <Button asChild><Link to="/auth">Sign in</Link></Button>
    </main>
  );

  const activeCount = trades.filter(t => !t.archived).length;
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">Educational trading journal</p>
          <h1 className="text-3xl font-semibold text-foreground">Trading Journal</h1>
          <p className="text-muted-foreground">Capture the setup. Check the details. Keep the lesson. Not a signal service.</p>
        </div>
        <div className="flex gap-2" role="tablist">
          <Button variant={view === "review" ? "default" : "outline"} onClick={() => setView("review")}><ScanLine className="mr-2 h-4 w-4" />Chart review</Button>
          <Button variant={view === "journal" ? "default" : "outline"} onClick={() => setView("journal")}><BookOpen className="mr-2 h-4 w-4" />My journal ({activeCount})</Button>
        </div>
      </header>

      {view === "review" ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-foreground">Your chart {isSample && <Badge variant="outline" className="ml-2">Prepared sample</Badge>}</h2>
                {file && <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} disabled={!!busy}>Replace</Button>}
              </div>
              <div className="rounded-md border border-border p-3 space-y-2 text-sm">
                <p className="font-medium text-foreground">Use my own key <span className="text-xs font-normal text-muted-foreground">(optional, for AI review)</span></p>
                {apiKey ? (
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-foreground">Key added for this tab.</span><Button size="sm" variant="outline" onClick={() => setApiKey("")}>Remove key</Button></div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input type="password" autoComplete="off" spellCheck={false} aria-label="Anthropic API key" placeholder="Paste your Anthropic API key" value={keyInput} maxLength={1000} onChange={e => setKeyInput(e.target.value)} />
                    <Button variant="outline" onClick={() => { const k = keyInput.trim(); if (k.length < 15 || /\s/.test(k)) { toast.error("Paste a valid Anthropic API key."); return; } setApiKey(k); setKeyInput(""); }}>Use for this tab</Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Your key stays in this tab and is only sent to Anthropic to run your review. Anthropic bills your account.</p>
                {!apiKey && <p className="text-xs text-muted-foreground">Without a key, AI review is off. Get one from the <a className="text-primary underline" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">Anthropic console</a>, try the prepared sample, or fill in the trade details yourself (manual entry).</p>}
              </div>
              <label className="block text-sm text-foreground">Review focus
                <select className={selectCls} value={focus} onChange={e => { setFocus(e.target.value as ReviewParameters["focus"]); settingsChanged(); }} disabled={!!busy}>
                  {SETUP_FOCUS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </label>
              <details className="text-sm">
                <summary className="cursor-pointer text-primary">Add chart context and your rules (optional)</summary>
                <div className="mt-2 space-y-2">
                  <Textarea value={context} maxLength={1200} rows={2} placeholder="e.g. M15, London session; the shaded range is Asia." onChange={e => { setContext(e.target.value); settingsChanged(); }} aria-label="Chart context" />
                  <Textarea value={rules} maxLength={2400} rows={3} placeholder="e.g. Require a sweep of the Asia low, then an M15 close above the prior swing." onChange={e => { setRules(e.target.value); settingsChanged(); }} aria-label="Your setup rules" />
                  <p className="text-xs text-muted-foreground">These guide the assessment; they are not proof a condition is visible.</p>
                </div>
              </details>
              <details className="text-sm">
                <summary className="cursor-pointer text-primary">Review definitions</summary>
                <div className="mt-2 space-y-2">{REVIEW_DEFINITIONS.map(d => <p key={d.title}><strong className="text-foreground">{d.title}: </strong><span className="text-muted-foreground">{d.text}</span></p>)}</div>
              </details>
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => { const f = e.target.files?.[0]; if (f) void pickFile(f); e.target.value = ""; }} data-testid="chart-input" />
              {!file ? (
                <div className="rounded-md border border-dashed border-border p-8 text-center space-y-3" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void pickFile(f); }}>
                  <p className="text-foreground">Drop a chart screenshot here, or choose one.</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WebP · up to 5 MB</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => inputRef.current?.click()}><ImagePlus className="mr-2 h-4 w-4" />Upload a chart</Button>
                    <Button variant="outline" onClick={loadSample} disabled={!!busy}><Sparkles className="mr-2 h-4 w-4" />Try the prepared sample</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <img src={imageUrl} alt={isSample ? "Prepared illustrative GBP/USD 15-minute sample chart" : "Your uploaded chart"} className="w-full rounded-md border border-border" />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{isSample ? "Prepared example · no live market data" : `${file.name} · ${(file.size / 1024).toFixed(0)} KB · sent for AI analysis only when you choose`}</span>
                    {!isSample && <Button onClick={analyse} disabled={!!busy || !apiKey} title={apiKey ? undefined : "Add your own Anthropic key to run an AI review"}>{busy === "analyse" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{busy === "analyse" ? "Reading chart…" : draft ? "Reassess setup" : "Analyse setup"}</Button>}
                  </div>
                </div>
              )}
            </div>
            {draft && <SetupReviewPanel draft={draft} isSample={isSample} />}
            {draft && (
              <details className="rounded-lg border border-border bg-card p-4 text-sm">
                <summary className="cursor-pointer font-medium text-foreground">{isSample ? "Original example draft" : "Original AI draft"}</summary>
                <p className="mt-2 text-foreground">{draft.summary}</p>
                {draft.observations.map((o, i) => <p key={i} className="mt-1"><Badge variant="outline" className="mr-2">{o.kind === "visible" ? "Visible" : o.kind === "interpretation" ? "Interpretation" : "Not shown"}</Badge><span className="text-muted-foreground">{o.text}</span></p>)}
              </details>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-4 space-y-4" aria-labelledby="details-heading">
            <h2 id="details-heading" className="font-semibold text-foreground">Trade details <span className="text-xs font-normal text-muted-foreground">Editable</span></h2>
            <p className="text-sm text-muted-foreground">{draft ? "Check the draft and correct anything that needs it." : "Manual entry: upload your chart, then fill these in yourself. AI review is optional."}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-foreground">Pair or market<Input value={form.symbol} onChange={e => update("symbol", e.target.value)} placeholder="e.g. GBPUSD" maxLength={30} /></label>
              <label className="text-sm text-foreground">Timeframe<Input value={form.timeframe} onChange={e => update("timeframe", e.target.value)} placeholder="e.g. 15m" maxLength={30} /></label>
            </div>
            <fieldset className="text-sm text-foreground"><legend>Your trade direction</legend>
              <div className="mt-1 grid grid-cols-3 gap-2">{(["long", "short", "unknown"] as const).map(v => <Button key={v} type="button" variant={form.direction === v ? "default" : "outline"} aria-pressed={form.direction === v} onClick={() => update("direction", v)}>{v === "unknown" ? "Not shown" : v === "long" ? "Long" : "Short"}</Button>)}</div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-3">
              {([["entry", "Entry price"], ["stopLoss", "Stop loss"], ["takeProfit", "Take profit"]] as const).map(([k, label]) => (
                <label key={k} className="text-sm text-foreground">{label}<Input type="number" min="0" step="any" inputMode="decimal" value={form[k]} onChange={e => update(k, e.target.value)} placeholder="Not shown" /></label>
              ))}
            </div>
            <p className="text-sm text-foreground">Planned risk / reward: <strong>{rr == null ? "—" : `1 : ${rr.toFixed(2)}`}</strong> <span className="text-xs text-muted-foreground">Based on your levels; does not confirm a fill or result.</span></p>
            <label className="block text-sm text-foreground">Setup<Input value={form.setup} onChange={e => update("setup", e.target.value)} maxLength={100} placeholder="e.g. Asian range sweep" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-foreground">Session<select className={selectCls} value={form.session} onChange={e => update("session", e.target.value as FormValues["session"])}>{["Unknown", "Asia", "London", "New York", "Other"].map(s => <option key={s}>{s}</option>)}</select></label>
              <label className="text-sm text-foreground">Trade stage<select className={selectCls} value={form.stage} onChange={e => update("stage", e.target.value as FormValues["stage"])}>{Object.entries(stageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            </div>
            <label className="block text-sm text-foreground">Outcome (your own record)<select className={selectCls} value={form.outcome} onChange={e => update("outcome", e.target.value as FormValues["outcome"])}>{Object.entries(outcomeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            <label className="block text-sm text-foreground">Trade date (optional)<Input type="date" value={form.tradeDate} onChange={e => update("tradeDate", e.target.value)} /></label>
            <label className="block text-sm text-foreground">Your review note (optional)<Textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3} maxLength={5000} placeholder="Why this setup? What will you check next time?" /></label>
            {error && <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-foreground">
              {error}
              {providerDetails?.code === "billing" && <a className="ml-1 text-primary underline" href="https://platform.claude.com/settings/billing" target="_blank" rel="noopener noreferrer">Open Claude Billing</a>}
              {providerDetails?.providerDetails && <details className="mt-1"><summary className="cursor-pointer text-xs">Technical details</summary><p className="text-xs">{providerDetails.providerDetails}</p>{providerDetails.requestId && <small>Reference: {providerDetails.requestId}</small>}</details>}
            </div>}
            <label className="flex items-start gap-2 text-sm text-foreground"><input type="checkbox" className="mt-1" checked={verified} onChange={e => setVerified(e.target.checked)} disabled={!file || !!busy} />I’ve checked these details against my chart.</label>
            <Button className="w-full" onClick={requestSave} disabled={!file || !verified || !!busy}>{busy === "save" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}{busy === "save" ? "Saving…" : "Save to journal"}</Button>
            <p className="text-center text-xs text-muted-foreground"><Lock className="mr-1 inline h-3 w-3" />Saved only after you confirm. Private to your account.</p>
          </section>
        </div>
      ) : (
        <section className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2"><Button size="sm" variant={!archived ? "default" : "outline"} onClick={() => setArchived(false)}>Active</Button><Button size="sm" variant={archived ? "default" : "outline"} onClick={() => setArchived(true)}>Archived</Button></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" aria-label="Search journal" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews…" /></div>
              <select aria-label="Filter reviews" className={selectCls + " sm:w-48"} value={filter} onChange={e => setFilter(e.target.value as JournalFilter)}>
                <option value="all">All reviews</option><option value="planned">Planned · real</option><option value="open">Open · real</option><option value="closed">Closed · real</option><option value="sample">Samples only</option>
              </select>
              <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}><Download className="mr-2 h-4 w-4" />CSV</Button>
            </div>
          </div>
          {loading ? <p className="py-10 text-center text-muted-foreground">Opening your journal…</p>
            : journalError ? <div className="py-10 text-center space-y-2"><p className="text-foreground">{journalError}</p><Button variant="outline" onClick={loadJournal}>Try again</Button></div>
            : !filtered.length ? <p className="py-10 text-center text-muted-foreground">{search || filter !== "all" ? "No matching reviews. Try another search or clear your filters." : archived ? "No archived reviews." : "Save a checked chart review and it will appear here."}</p>
            : <ul className="divide-y divide-border">{filtered.map(t => (
                <li key={t.id}><button className="flex w-full flex-col gap-1 py-3 text-left sm:flex-row sm:items-center sm:justify-between" onClick={() => setSelected(t)}>
                  <span><strong className="text-foreground">{t.symbol}</strong>{t.isSample && <Badge variant="outline" className="ml-2">Sample</Badge>}<span className="block text-sm text-muted-foreground">{t.setup || "No setup recorded"} · {t.timeframe || "—"}</span></span>
                  <span className="flex flex-wrap gap-2 text-sm text-muted-foreground"><span>{t.direction === "unknown" ? "Not shown" : t.direction === "long" ? "Long" : "Short"}</span><Badge variant="secondary">{stageLabels[t.stage]}</Badge><span className="font-mono">{t.plannedR == null ? "—" : `1 : ${t.plannedR.toFixed(2)}`}</span><span>{new Date(t.createdAt).toLocaleDateString()}</span></span>
                </button></li>))}</ul>}
          <p className="text-xs text-muted-foreground">Plans and chart reviews are kept separate from verified trading performance.</p>
        </section>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save this review?</DialogTitle></DialogHeader>
          <p className="text-sm text-foreground">{form.symbol} · {form.timeframe} · {form.direction === "unknown" ? "direction not shown" : form.direction} · entry {form.entry || "—"}, stop {form.stopLoss || "—"}, target {form.takeProfit || "—"}</p>
          <p className="text-sm text-muted-foreground">The trade details and chart image will be saved to your private journal. Planned levels do not record a fill or result.</p>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmOpen(false)}>Go back</Button><Button onClick={save}>Confirm and save</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selected && <>
            <DialogHeader><DialogTitle>{selected.symbol} · {selected.timeframe || "—"}</DialogTitle></DialogHeader>
            <div className="flex flex-wrap gap-2"><Badge>Confirmed by you</Badge>{selected.isSample && <Badge variant="outline">Sample chart · illustrative data</Badge>}{selected.archived && <Badge variant="secondary">Archived</Badge>}</div>
            {selected.imageKey ? (selectedImage ? <img src={selectedImage} alt={`Saved ${selected.symbol} chart`} className="w-full rounded-md border border-border" /> : <p className="text-sm text-muted-foreground">Loading private chart…</p>) : <p className="text-sm text-muted-foreground">No chart image stored.</p>}
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {([["Direction", selected.direction === "unknown" ? "Not shown" : selected.direction], ["Entry", price(selected.entry)], ["Stop loss", price(selected.stopLoss)], ["Target", price(selected.takeProfit)], ["Planned R:R", selected.plannedR == null ? "—" : `1 : ${selected.plannedR.toFixed(2)}`], ["Stage", stageLabels[selected.stage]], ["Setup", selected.setup || "Not recorded"], ["Session", selected.session], ["Trade date", selected.tradeDate || "Not recorded"], ["Outcome", outcomeLabels[selected.outcome]]] as const).map(([l, v]) => <div key={l}><dt className="text-xs text-muted-foreground">{l}</dt><dd className="text-foreground">{v}</dd></div>)}
            </dl>
            {selected.notes && <div><h3 className="text-sm font-medium text-foreground">Your review note</h3><p className="whitespace-pre-wrap text-sm text-foreground">{selected.notes}</p></div>}
            {selected.analysis && <SetupReviewPanel draft={selected.analysis} isSample={selected.isSample} />}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-muted-foreground">Recorded {new Date(selected.createdAt).toLocaleString()}</span>
              <Button variant="outline" onClick={() => toggleArchive(selected)} disabled={archiveBusy}>{selected.archived ? <RotateCcw className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}{selected.archived ? "Restore review" : "Archive review"}</Button>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </main>
  );
}
