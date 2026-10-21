// Author-supplied scenario, not a quote feed or automatically confirmed signal.
export const usdchfEditorialSetup = {
  pair: "USDCHF",
  timeframe: "Daily",
  rejectionLevel: 0.8400,
  // Oct 21 update: rising daily channel, latest swing trendline broken near 0.8300,
  // first projected leg toward channel support near 0.8040.
  trendlineBreakLevel: 0.8300,
  channelSupport: 0.8040,
  channelRange: [0.7600, 0.8500],
  updatedOn: "2026-10-21",
  targets: [0.7900, 0.7600, 0.7400],
  attribution: "Men In Action LLC",
  receivedOn: "2026-10-19",
  confirmation: "UNVERIFIED",
} as const;

export const bitcoinEditorialSetup = {
  pair: "BTCUSD",
  timeframe: "2 weeks",
  firstObjective: 130000,
  finalTargetRange: [150000, 200000],
  invalidationLevel: 57750,
  pullbackLevel: null,
  attribution: "Men In Action LLC",
  receivedOn: "2026-10-19",
  confirmation: "UNVERIFIED",
} as const;

export const bitcoinPullbackSetup = {
  pair: "BTCUSD",
  timeframe: "2 days",
  fibonacciRange: [50, 61.8],
  retracementZone: [68000, 71000],
  objective: 130000,
  invalidationLevel: 57750,
  requiredConfirmations: ["BULLISH_REJECTION", "DESCENDING_TRENDLINE_BREAK"],
  confirmation: "UNVERIFIED",
} as const;