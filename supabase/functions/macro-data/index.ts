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

async function fetchFredSeries(seriesId: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const val = data?.observations?.[0]?.value;
    if (!val || val === '.') return null;
    return parseFloat(val);
  } catch {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const currencies = url.searchParams.get('currencies')?.split(',') || ['USD', 'EUR', 'GBP', 'JPY'];

  const apiKey = Deno.env.get('FRED_API_KEY');
  if (!apiKey) {
    console.warn('FRED_API_KEY not set, returning fallback data');
    const result: Record<string, any> = {};
    for (const c of currencies) {
      result[c] = { ...FALLBACK[c], source: 'fallback' };
    }
    return new Response(JSON.stringify({ data: result, source: 'fallback' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const result: Record<string, any> = {};

  await Promise.all(currencies.map(async (currency) => {
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

  return new Response(JSON.stringify({ data: result, timestamp: Date.now() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
