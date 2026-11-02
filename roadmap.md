## Ticker and API refresh
- [x] Update the top ticker with source observation timestamps; verify all 17 instruments return API prices.
- [x] Invoke price, news, rhythm, VIX, COT, health, and BLS macro feeds; add mounted-query refreshes at Arizona checkpoints.
- [ ] Restore FRED-backed macro feeds: blocked by invalid saved FRED key; secure replacement was declined. Existing macro fallback displays are not verified current data.
- [x] Remove synthetic forex history and gold comparison history, test freshness rules, and verify ticker refresh and narrow-screen fit.

## October 27 COT update
- [x] Reconcile all six supplied reports; all 28 tracked markets already matched, now protected as verified uploads.
- [x] Improve COT freshness labels, tooltip contrast, and chart spacing without changing trade rules.
- [x] Test all stored positions and weekly changes; verify populated October 27 COT and Playbook views.

## Compounding planner
- [x] Simplify lot sizing, hide technical broker settings by default, and verify calculations remain unchanged.
- [x] Add stop-based lot sizing and per-session lots using verified currency conversions and broker contract settings.
- [x] Test sizing and verify the populated lot-sizing flow and exports.
- [x] Move the planner to its own navigable page and confirm existing production analytics provides page-path breakdowns; new-page traffic will appear after publication and visits.
- [x] Add adjustable session-based projection, risk amounts, chart, and downloadable session sheet to Trading Tools.
- [x] Test the supplied example and verify calculator interactions and dark-mode readability.

## Bitcoin ending-diagonal scenario
- [x] Add the nearer-term pullback diagram and confirmation sequence, preserving the distinction from the later pullback.
- [x] Test new supplied levels and verify the pullback chart opens.
- [x] Add an original two-week Bitcoin diagram, attributed thesis, three-stage path and invalidation.
- [x] Test supplied levels and verify chart enlargement and preview rendering.

## USDCHF conditional chart setup
- [x] Replace the uploaded public-facing chart with an original, clearly labelled scenario diagram and verify it opens.
- [x] Add the supplied chart and plain-language entry, invalidation, targets, and wait conditions to the Playbook.
- [x] Verify the chart opens and scenario levels remain attributed rather than live signals (local browser used uploaded bytes because hosted asset serving is unavailable on localhost).

## October 13 COT and entry timing
- [x] Reconcile uploaded October 13 reports and persist matching positions and weekly changes.
- [x] Unify trade direction and present conditional timing, wait reasons, and honest source confidence.
- [x] Test decision rules and verify populated pages and preview status.

## Weekly Playbook and automatic COT refresh
- [x] Build a unified Weekly Playbook with top COT squeezes, sentiment, and upcoming reports.
- [x] Make all COT panels refresh from the shared database feed every morning.
- [x] Schedule the upstream COT synchronization and verify both UI and data flow.

## September 15 COT update and full-site redesign
- [x] Import and validate the September 15 financial, metals, energy, agriculture, index, and volatility positioning.
- [x] Replace stale and duplicated COT data paths with the shared stored feed.
- [x] Build the Hyper-Quant tactical design system and shared freshness, change, conviction, and conflict controls.
- [x] Redesign all primary trading and research pages with consistent responsive information hierarchy.
- [x] Verify trade guidance, history, charts, mobile layouts, edge functions, and data-health states.
