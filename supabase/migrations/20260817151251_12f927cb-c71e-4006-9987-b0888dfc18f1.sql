select cron.schedule(
  'all-feeds-refresh-30min',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/market-news?limit=30',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  select net.http_post(
    url := 'https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/cot-data-health',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  select net.http_post(
    url := 'https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/cftc-cot?currencies=EUR,GBP,JPY,CHF,AUD,CAD,NZD,MXN,USD,XAU,BTC',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  select net.http_post(
    url := 'https://xkgsugennbdatwmetnxx.supabase.co/functions/v1/macro-data',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);