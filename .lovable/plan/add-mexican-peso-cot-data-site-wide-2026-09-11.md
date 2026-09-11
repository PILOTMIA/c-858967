# Add Mexican Peso COT Data Site-Wide

## Goal
Import the supplied Mexican Peso COT history and make MXN visible and current everywhere COT data drives analysis.

## Changes
- Store all visible MXN weekly rows from January 26 through August 31, 2026 in the central COT history, preserving long, short, weekly changes, percentages, net positions, and the supplied report dates.
- Remove the current MXN exclusion from the week-over-week COT summary.
- Add USDMXN to Trade This, Not That and Smart Money Edge so peso positioning is evaluated against live USD/MXN movement.
- Replace older hardcoded MXN values in pair analysis, positioning, and strength views with the latest centrally stored MXN record.
- Ensure the Weekly Playbook and existing peso-aware price/history views refresh from the same latest record.

## Accuracy and validation
- Treat the screenshot as the supplied source and label imported rows accordingly.
- Validate each row before import: `net position = long − short`, dates are unique, and numeric fields are finite.
- Verify the latest row resolves to August 31, 2026: long 174,649; short 81,402; net 93,247; weekly net change +10,865.
- Run focused checks and inspect COT Analysis and Weekly Playbook to confirm MXN and USDMXN appear without errors.

## Technical details
- Use an additive data import into the existing COT history; no schema change is needed.
- Keep plain pair names such as `USDMXN`, matching the site convention.
- Invalidate the shared COT queries after upload/import so every dependent view receives the same report.
