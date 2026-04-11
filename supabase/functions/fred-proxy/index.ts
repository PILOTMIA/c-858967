const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const seriesIds = url.searchParams.get('series')?.split(',') || [];
  const limit = url.searchParams.get('limit') || '24';
  const units = url.searchParams.get('units') || 'lin';

  const apiKey = Deno.env.get('FRED_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'FRED_API_KEY not configured', data: {} }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (seriesIds.length === 0) {
    return new Response(JSON.stringify({ error: 'No series IDs provided' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const results: Record<string, any> = {};

  await Promise.all(seriesIds.map(async (seriesId) => {
    try {
      let fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=${limit}&sort_order=desc`;
      if (units && units !== 'lin') fredUrl += `&units=${units}`;
      console.log(`Fetching FRED: ${seriesId}, key length: ${apiKey.length}`);
      const res = await fetch(fredUrl, { signal: AbortSignal.timeout(10000) });
      console.log(`FRED ${seriesId} response: ${res.status}`);
      if (!res.ok) {
        const body = await res.text();
        console.error(`FRED ${seriesId} error: ${body}`);
        results[seriesId] = { error: `HTTP ${res.status}`, observations: [] };
        return;
      }
      const data = await res.json();
      results[seriesId] = {
        observations: (data.observations || []).filter((o: any) => o.value && o.value !== '.'),
        source: 'fred',
      };
    } catch (e) {
      console.error(`Error fetching ${seriesId}:`, e);
      results[seriesId] = { error: 'fetch failed', observations: [] };
    }
  }));

  return new Response(JSON.stringify({ data: results, timestamp: Date.now() }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
