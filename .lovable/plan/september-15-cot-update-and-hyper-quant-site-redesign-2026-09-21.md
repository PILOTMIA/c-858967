# September 15 COT Update and Hyper-Quant Site Redesign

## Goal
Update every COT-driven experience from the uploaded September 15, 2026 reports, then apply the selected Hyper-Quant Tactical Dashboard direction across the full public site. The redesigned experience will give equal weight to what changed and what traders should focus on next.

## Data accuracy foundation
- Import verified September 15 positioning for currencies, USD, MXN, Bitcoin, Gold, Silver, Copper, Platinum, WTI, Natural Gas, agriculture, indices, and VIX into the existing COT history.
- Validate report dates, long/short fields, weekly changes, finite values, and `net = long − short` before writing.
- Cross-check uploaded values against the official CFTC feed and preserve the report category used for each market.
- Expand the automatic history sync and health checks to cover the complete tracked universe, not only major currencies.
- Remove stale September 1 and older fallback values from live surfaces; unavailable data will display a clear unavailable/stale state rather than invented guidance.

## Shared intelligence system
- Create shared COT history and freshness hooks so COT Analysis, Weekly Playbook, Sentiment Matrix, Currency Flow, Metals, agriculture, scorecards, and charts resolve the same stored report.
- Standardize report-date badges, week-over-week change indicators, conviction labels, price/COT conflict warnings, and source attribution.
- Add report-to-report comparison and market-group filters for currencies, metals, energy, agriculture, indices, crypto, and volatility.
- Preserve live-price confirmation so recommendations do not treat delayed COT positioning as unconditional direction.

## Hyper-Quant visual system
- Apply the selected tactical dashboard direction: near-black surfaces, mint live-data accents, red risk states, crisp typography, monospaced numerical values, thin borders, and compact geometry.
- Keep Outfit as the brand-facing type and use the existing mono family for market figures; preserve light/dark accessibility through semantic tokens.
- Replace decorative card stacks with clear status rails, ranked action boards, evidence panels, and consistent drill-down affordances.
- Use restrained status pulses, number transitions, and panel reveals with reduced-motion support.

## Page and feature updates
- **Dashboard:** lead with market regime, highest-conviction setups, largest weekly shifts, stale-feed warnings, and next major reports.
- **COT Analysis:** add a command header, asset-group filters, sortable weekly movers, clear long/short composition, conflict badges, historical drill-downs, and source/freshness status.
- **Weekly Playbook:** strengthen the ranked action board with trade/avoid/squeeze sections, score breakdowns, report changes, event risk, and expandable evidence.
- **Sentiment Matrix:** consume the shared COT feed, add report date and weekly-flow context, and expose divergence details without duplicating data logic.
- **Currency Flow:** synchronize globe frames with the same history, add freshness and prior-week comparison, and improve node/arc drill-down clarity.
- **Metals and commodities:** replace hardcoded Gold, Silver, Copper, Platinum, WTI, Natural Gas, and agriculture values with live stored history and consistent market cards.
- **Market Analysis, Economic Radar, Calendar, News, VIX, Central Banking, Tools, Education, Community, Profile, and auth:** adopt the same status hierarchy, panel geometry, typography, controls, spacing, and mobile behavior without changing their established business logic.
- **Navigation:** make current data health and the main action destinations easier to identify while keeping the existing information architecture.

## Validation
- Run focused COT invariant and edge-function tests, then deploy and invoke updated functions.
- Verify the stored September 15 snapshot and compare key values against the official source.
- Check TypeScript and the repository test command.
- Use browser checks on desktop and mobile for the Dashboard, COT Analysis, Weekly Playbook, Sentiment Matrix, Currency Flow, Metals, Economic Radar, and navigation.
- Confirm no stale dates, hardcoded live positioning, broken layouts, overlapping text, console errors, or contradictory trade labels remain.

## Delivery order
1. Import and validate the new report.
2. Consolidate the shared data layer and eliminate stale values.
3. Build shared tactical UI primitives.
4. Redesign the main decision pages, then propagate the system across remaining pages.
5. Validate data, behavior, and responsive presentation end to end.