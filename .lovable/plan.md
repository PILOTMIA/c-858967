# Plan: Data → APIs → Visual Refresh

## Phase 1 — COT Data Refresh (from uploaded PDFs)

Parse the two attached PDFs and update the COT dataset.

1. `Traders in Financial Futures – Futures Only Positions as of June 16, 2026`
   - Extract dealer / asset-manager / leveraged-money / non-reportable positions for all 6 currencies (EUR, GBP, JPY, CHF, CAD, AUD, NZD, MXN) + DXY + BTC.
   - Insert one row per instrument into `public.cot_history` (report_date = 2026-06-16) via a migration-safe `supabase--insert`.
   - Update the in-memory `COTDataContext` fallback to mirror 06/16 figures so the UI matches when the DB query is cold.

2. `NEW YORK MERCANTILE EXCHANGE` (NYMEX metals/energy)
   - Extract Gold, Silver, Copper, Crude Oil (WTI), Natural Gas managed-money + commercial positions.
   - Replace the hardcoded `src/components/COTCommodityData.tsx` block with the new figures and stamp `reportDate = 2026-06-16`.

3. Re-run `cot-data-health` edge function to confirm freshness banner clears.

## Phase 2 — API / Feed Audit

For each edge function, verify it still works and modernize the call:

- `forex-prices` — confirm provider still returns 200; add 60s in-memory cache + retry with exponential backoff; expose `lastUpdated`.
- `fred-proxy` / `macro-data` — refresh series IDs; ensure FRED_API_KEY present; add 12-hour cache.
- `market-news` — switch to a single reliable free source (e.g., GDELT or Yahoo Finance RSS) and drop any dead endpoints.
- `cot-history-sync` — run once to backfill anything between 06/02 and 06/16; verify cron is daily 2 PM + 3 PM MST.
- `cftc-cot` — sanity-test against current CFTC endpoint.
- Add a single `useFeedHealth` hook that surfaces stale-feed warnings across `MarketAnalysis`, `COTAnalysis`, `Metals`, `EconomicRadar`.

Validation: call each function with `supabase--curl_edge_functions` and confirm 200 + non-empty payload. Log results for the user.

## Phase 3 — Visual Refresh

Goal: modernize the look while keeping the existing Apple-inspired dark aesthetic and all functionality intact.

Concrete moves (no token color drift):
- Tighten container widths to `max-w-7xl` with consistent `px-6 lg:px-8` page padding.
- Standardize card chrome: `rounded-2xl`, subtle `border-border/40`, `bg-card/60 backdrop-blur-xl`, soft ambient shadow `shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.15)]`.
- Replace per-page ad-hoc headers with a shared `<PageHeader />` (eyebrow + title + subtitle + optional actions).
- Bump heading scale to Outfit 600/700 with `tracking-tight`, body text Inter 15px.
- Add Framer Motion `fade-in` + small `y` translate on first-mount sections; stagger children.
- Refresh chart styling: thinner gridlines (`hsl(var(--border)/0.4)`), rounded bar caps, consistent legend chips.
- Add a subtle ambient glow background to the app shell (`fixed inset-0 -z-10` radial gradient using primary).
- Polish nav: pill-style active state, hover underline removed in favor of background tint.

No design-direction prototypes needed — this is a refinement on the existing locked aesthetic from project memory (Apple-like minimal, Outfit/SF Pro, no emojis, dark-mode parity).

## Out of scope

- New features, route additions, or business-logic changes.
- Schema changes beyond inserting 06/16 COT rows.
- Replacing chart libraries.

## Order of execution

1. Parse both PDFs and write the data updates + migration insert.
2. Hit every edge function with curl, fix what's broken, add caching where missing.
3. Land the shared `PageHeader`, card chrome utility classes, and motion wrappers, then sweep pages.

Want me to proceed?
