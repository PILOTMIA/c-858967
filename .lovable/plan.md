# Weekly Playbook and Daily COT Refresh

## Goal
Create one clear Weekly Playbook page that combines the strongest COT squeeze opportunities, current sentiment scores, and upcoming economic reports. Keep every COT panel synchronized from the same stored feed automatically each morning.

## Implementation
- Rework the existing Weekly Playbook into three scannable sections: ranked COT squeezes, sentiment alignment, and the upcoming high-impact calendar.
- Reuse the shared latest-COT query and live spot-momentum logic so recommendations do not drift between pages.
- Show source dates and freshness states, and avoid presenting a trade when required data is stale or conflicting.
- Set the shared COT query to refresh on a daily morning cadence while retaining focus/reconnect refresh.
- Schedule the existing COT history synchronization once each morning and ensure the stored feed remains the source for all panels.
- Validate desktop and mobile layouts, TypeScript, and the live data response.

## Technical details
- Prefer existing hooks, calendar utilities, and sentiment APIs over parallel data implementations.
- The scheduled sync will run once daily at a fixed UTC time corresponding to morning in Phoenix; CFTC itself publishes weekly, while daily checks make new reports appear without uploads.
- All recommendation labels remain decision support, not individualized financial advice.
