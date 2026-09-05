const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FRED series IDs for each currency's country
const FRED_SERIES: Record<string, { gdp: string; cpi: string; unemployment: string; interestRate: string }> = {
  USD: { gdp: 'A191RL1Q225SBEA', cpi: 'CPIAUCSL', unemployment: 'UNRATE', interestRate: 'FEDFUNDS' },
  EUR: { gdp: 'CLVMNACSCAB1GQEA19', cpi: 'EA19CPALTT01GYM', unemployment: 'LRHUTTTTEZM156S', interestRate: 'ECBDFR' },
  GBP: { gdp: 'CLVMNACSCAB1GQUK', cpi: 'GBRCPIALLMINMEI', unemployment: 'LMUNRRTTGBM156S', interestRate: 'IUDSOIA' },
  JPY: { gdp: 'JPNRGDPEXP', cpi: 'JPNCPIALLMINMEI', unemployment: 'LMUNRRTTJPM156S', interestRate: 'IRSTCB01JPM156N' },
  CHF: { gdp: 'CLVMNACSCAB1GQCH', cpi: 'CHECPIALLMINMEI', unemployment: 'LMUNRRTTCHM156S', interestRate: 'IRSTCB01CHM156N' },
  AUD: { gdp: 'CLVMNACSCAB1GQAU', cpi: 'AUSCPIALLQINMEI', unemployment: 'LMUNRRTTAUM156S', interestRate: 'IRSTCB01AUM156N' },
  CAD: { gdp: 'NAEXKP01CAQ189S', cpi: 'CANCPIALLMINMEI', unemployment: 'LMUNRRTTCAM156S', interestRate: 'IRSTCB01CAM156N' },
  NZD: { gdp: 'NAEXKP01NZQ189S', cpi: 'NZLCPIALLQINMEI', unemployment: 'LMUNRRTTNZM156S', interestRate: 'IRSTCB01NZM156N' },
  MXN: { gdp: 'NAEXKP01MXQ189S', cpi: 'MEXCPIALLMINMEI', unemployment: 'LMUNRRTTMXM156S', interestRate: 'IRSTCB01MXM156N' },
};

// US 10-Year Treasury Note FRED series
const US10Y_SERIES = 'DGS10';

// Fallback data
const FALLBACK: Record<string, { gdp: number; cpi: number; unemployment: number; interestRate: number }> = {
  USD: { gdp: 2.4, cpi: 2.8, unemployment: 4.1, interestRate: 4.50 },
  EUR: { gdp: 0.9, cpi: 2.4, unemployment: 6.4, interestRate: 3.65 },
  GBP: { gdp: 1.1, cpi: 2.8, unemployment: 4.4, interestRate: 4.50 },
  JPY: { gdp: 1.2, cpi: 3.2, unemployment: 2.5, interestRate: 0.50 },
  CHF: { gdp: 1.5, cpi: 1.1, unemployment: 2.3, interestRate: 1.50 },
  AUD: { gdp: 2.6, cpi: 3.7, unemployment: 4.1, interestRate: 4.10 },
  CAD: { gdp: 1.8, cpi: 2.7, unemployment: 6.7, interestRate: 2.75 },
  NZD: { gdp: 1.5, cpi: 3.1, unemployment: 5.4, interestRate: 2.25 },
  MXN: { gdp: 3.1, cpi: 4.2, unemployment: 2.8, interestRate: 9.50 },
};

const US10Y_FALLBACK = { yield: 4.32, previousYield: 4.40, source: 'fallback' as const };

async function fetchFredSeries(seriesId: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.warn(`FRED ${seriesId} HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const val = data?.observations?.[0]?.value;
    if (!val || val === '.') return null;
    return parseFloat(val);
  } catch (e) {
    console.warn(`FRED ${seriesId} error: ${(e as Error)?.message}`);
    return null;
  }
}

// For CPI, FRED gives index level. We need YoY % change.
async function fetchCpiYoY(seriesId: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=13&units=pc1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const val = data?.observations?.[0]?.value;
    if (!val || val === '.') return null;
    return parseFloat(parseFloat(val).toFixed(1));
  } catch {
    return null;
  }
}

// Fetch last 2 observations for US10Y to compute weekly change
async function fetchUS10Y(apiKey: string): Promise<{ yield: number; previousYield: number; source: 'fred' | 'fallback' }> {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${US10Y_SERIES}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return US10Y_FALLBACK;
    const data = await res.json();
    const observations = data?.observations?.filter((o: any) => o.value && o.value !== '.');
    if (!observations || observations.length < 2) return US10Y_FALLBACK;
    return {
      yield: parseFloat(observations[0].value),
      previousYield: parseFloat(observations[1].value),
      source: 'fred',
    };
  } catch {
    return US10Y_FALLBACK;
  }
}

// US Non-Farm Payrolls from BLS Public API (series CES0000000001, total nonfarm employment, thousands).
// No API key required. Released first Friday of each month at 8:30 AM ET.
async function fetchNFP(): Promise<{
  history: { month: string; year: number; value: number }[];
  latest: number;
  latestMonth: string;
  previous: number;
  source: 'bls' | 'fred';
  releaseNote: string;
} | null> {
  const parse = (rows: { year: number; month: number; label: string; level: number }[]) => {
    rows.sort((a, b) => a.year - b.year || a.month - b.month);
    const history: { month: string; year: number; value: number }[] = [];
    for (let i = 1; i < rows.length; i++) {
      history.push({ month: rows[i].label, year: rows[i].year, value: Math.round(rows[i].level - rows[i - 1].level) });
    }
    return history.slice(-12);
  };

  // Primary: BLS
  try {
    const now = new Date().getUTCFullYear();
    const res = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesid: ['CES0000000001'], startyear: String(now - 2), endyear: String(now) }),
      signal: AbortSignal.timeout(9000),
    });
    if (res.ok) {
      const json = await res.json();
      const series = json?.Results?.series?.[0]?.data || [];
      const rows = series
        .filter((d: any) => /^M(0[1-9]|1[0-2])$/.test(d.period))
        .map((d: any) => ({
          year: Number(d.year),
          month: Number(d.period.slice(1)),
          label: String(d.periodName).slice(0, 3),
          level: parseFloat(d.value),
        }))
        .filter((r: any) => Number.isFinite(r.level));
      const history = parse(rows);
      if (history.length >= 2) {
        return {
          history,
          latest: history[history.length - 1].value,
          latestMonth: `${history[history.length - 1].month} ${history[history.length - 1].year}`,
          previous: history[history.length - 2].value,
          source: 'bls',
          releaseNote: 'Bureau of Labor Statistics — Current Employment Statistics (CES0000000001)',
        };
      }
    } else {
      console.warn('BLS NFP request failed', res.status);
    }
  } catch (e) {
    console.warn('BLS NFP error', String(e));
  }

  // Fallback: FRED PAYEMS (needs key)
  const apiKey = Deno.env.get('FRED_API_KEY');
  if (!apiKey) return null;
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=PAYEMS&api_key=${apiKey}&file_type=json&sort_order=desc&limit=14`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const rows = (data?.observations || [])
      .filter((o: any) => o.value && o.value !== '.')
      .map((o: any) => {
        const d = new Date(o.date + 'T00:00:00Z');
        return {
          year: d.getUTCFullYear(),
          month: d.getUTCMonth() + 1,
          label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
          level: parseFloat(o.value),
        };
      });
    const history = parse(rows);
    if (history.length < 2) return null;
    return {
      history,
      latest: history[history.length - 1].value,
      latestMonth: `${history[history.length - 1].month} ${history[history.length - 1].year}`,
      previous: history[history.length - 2].value,
      source: 'fred',
      releaseNote: 'FRED (PAYEMS) — St. Louis Fed mirror of BLS data',
    };
  } catch {
    return null;
  }
}


// ---------------------------------------------------------------------------
// US inflation from the BLS Public API (same source family as NFP, no API key).
// CPI (CUUR0000SA0), Core CPI (CUUR0000SA0L1E), PPI final demand (WPUFD4),
// Export Price Index (EIUIQ). Year-over-year percentages computed from levels.
// ---------------------------------------------------------------------------
const BLS_INFLATION_SERIES: Record<string, string> = {
  cpi: 'CUUR0000SA0',
  coreCPI: 'CUUR0000SA0L1E',
  ppi: 'WPUFD4',
  exportPriceIndex: 'EIUIQ',
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type InflationIndicator = {
  current: number;
  previous: number | null;
  latestPeriod: string;
  history: { date: string; value: number }[];
  source: 'bls';
};

async function fetchInflation(): Promise<Record<string, InflationIndicator> | null> {
  try {
    const year = new Date().getUTCFullYear();
    const res = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: Object.values(BLS_INFLATION_SERIES),
        startyear: String(year - 3),
        endyear: String(year),
      }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) {
      console.warn('BLS inflation request failed', res.status);
      return null;
    }
    const json = await res.json();
    const seriesList = json?.Results?.series || [];
    const byId: Record<string, { year: number; month: number; level: number }[]> = {};
    for (const s of seriesList) {
      byId[s.seriesID] = (s.data || [])
        .filter((d: any) => /^M(0[1-9]|1[0-2])$/.test(d.period) && d.value && d.value !== '.')
        .map((d: any) => ({ year: Number(d.year), month: Number(d.period.slice(1)), level: parseFloat(d.value) }))
        .filter((r: any) => Number.isFinite(r.level))
        .sort((a: any, b: any) => a.year - b.year || a.month - b.month);
    }

    const out: Record<string, InflationIndicator> = {};
    for (const [key, seriesId] of Object.entries(BLS_INFLATION_SERIES)) {
      const rows = byId[seriesId];
      if (!rows || rows.length < 14) continue;
      const yoy: { date: string; value: number }[] = [];
      for (let i = 12; i < rows.length; i++) {
        const base = rows[i - 12].level;
        if (!base) continue;
        yoy.push({
          date: `${MONTHS_SHORT[rows[i].month - 1]} ${String(rows[i].year).slice(2)}`,
          value: parseFloat((((rows[i].level - base) / base) * 100).toFixed(2)),
        });
      }
      if (yoy.length < 2) continue;
      const last = rows[rows.length - 1];
      out[key] = {
        current: parseFloat(yoy[yoy.length - 1].value.toFixed(1)),
        previous: parseFloat(yoy[yoy.length - 2].value.toFixed(1)),
        latestPeriod: `${MONTHS_SHORT[last.month - 1]} ${last.year}`,
        history: yoy.slice(-24),
        source: 'bls',
      };
    }
    return Object.keys(out).length ? out : null;
  } catch (e) {
    console.warn('BLS inflation error', String(e));
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const currencies = url.searchParams.get('currencies')?.split(',') || ['USD', 'EUR', 'GBP', 'JPY'];
  const includeUS10Y = url.searchParams.get('us10y') === 'true';
  const includeNFP = url.searchParams.get('nfp') === 'true';
  const includeInflation = url.searchParams.get('inflation') === 'true';

  const apiKey = Deno.env.get('FRED_API_KEY');
  if (!apiKey) {
    console.warn('FRED_API_KEY not set, returning fallback macro data (NFP still live via BLS)');
    const result: Record<string, any> = {};
    for (const c of currencies) {
      result[c] = { ...FALLBACK[c], source: 'fallback' };
    }
    const response: any = { data: result, source: 'fallback', timestamp: Date.now() };
    if (includeUS10Y) response.us10y = US10Y_FALLBACK;
    if (includeNFP) response.nfp = await fetchNFP();
    if (includeInflation) response.inflation = await fetchInflation();
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }


  const result: Record<string, any> = {};

  const macroPromise = Promise.all(currencies.map(async (currency) => {
    const series = FRED_SERIES[currency];
    if (!series) {
      result[currency] = { ...FALLBACK[currency], source: 'fallback' };
      return;
    }

    const [gdp, cpi, unemployment, interestRate] = await Promise.all([
      fetchFredSeries(series.gdp, apiKey),
      fetchCpiYoY(series.cpi, apiKey),
      fetchFredSeries(series.unemployment, apiKey),
      fetchFredSeries(series.interestRate, apiKey),
    ]);

    const fb = FALLBACK[currency];
    result[currency] = {
      gdp: gdp !== null ? parseFloat(gdp.toFixed(1)) : fb.gdp,
      cpi: cpi !== null ? cpi : fb.cpi,
      unemployment: unemployment !== null ? parseFloat(unemployment.toFixed(1)) : fb.unemployment,
      interestRate: interestRate !== null ? parseFloat(interestRate.toFixed(2)) : fb.interestRate,
      source: gdp !== null ? 'fred' : 'fallback',
    };
  }));

  const us10yPromise = includeUS10Y ? fetchUS10Y(apiKey) : Promise.resolve(null);
  const nfpPromise = includeNFP ? fetchNFP() : Promise.resolve(null);
  const inflationPromise = includeInflation ? fetchInflation() : Promise.resolve(null);

  const [, us10yData, nfpData, inflationData] = await Promise.all([macroPromise, us10yPromise, nfpPromise, inflationPromise]);

  const response: any = { data: result, timestamp: Date.now() };
  if (us10yData) response.us10y = us10yData;
  if (nfpData) response.nfp = nfpData;
  if (inflationData) response.inflation = inflationData;

  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
