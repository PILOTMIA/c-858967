CREATE TABLE IF NOT EXISTS public.news_sentiment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  articles INTEGER NOT NULL DEFAULT 0,
  bullish INTEGER NOT NULL DEFAULT 0,
  bearish INTEGER NOT NULL DEFAULT 0,
  neutral INTEGER NOT NULL DEFAULT 0,
  score NUMERIC NOT NULL DEFAULT 0,
  overall TEXT NOT NULL DEFAULT 'NEUTRAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date)
);

GRANT SELECT ON public.news_sentiment_history TO anon;
GRANT SELECT ON public.news_sentiment_history TO authenticated;
GRANT ALL ON public.news_sentiment_history TO service_role;

ALTER TABLE public.news_sentiment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "News sentiment history is publicly readable" ON public.news_sentiment_history;
CREATE POLICY "News sentiment history is publicly readable"
ON public.news_sentiment_history FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS news_sentiment_history_date_idx ON public.news_sentiment_history (snapshot_date DESC);