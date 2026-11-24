CREATE TABLE public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  record jsonb NOT NULL,
  image_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived boolean NOT NULL DEFAULT false
);
CREATE INDEX trades_owner_created_idx ON public.trades (owner_id, created_at DESC);
GRANT SELECT ON public.trades TO authenticated;
GRANT UPDATE (archived) ON public.trades TO authenticated;
GRANT ALL ON public.trades TO service_role;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own trades" ON public.trades FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners archive own trades" ON public.trades FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.analysis_usage (
  id text PRIMARY KEY,
  used integer NOT NULL DEFAULT 0,
  expires_at bigint NOT NULL
);
GRANT ALL ON public.analysis_usage TO service_role;
ALTER TABLE public.analysis_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_analysis_quota(_user_id uuid, _limit integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _window bigint := floor(extract(epoch from now()) / 60);
  _key text := _user_id::text || ':' || _window::text;
  _used integer;
BEGIN
  DELETE FROM public.analysis_usage WHERE expires_at < (extract(epoch from now()) * 1000)::bigint;
  INSERT INTO public.analysis_usage (id, used, expires_at)
  VALUES (_key, 1, ((_window + 2) * 60000))
  ON CONFLICT (id) DO UPDATE SET used = public.analysis_usage.used + 1
  RETURNING used INTO _used;
  RETURN _used <= _limit;
END; $$;
REVOKE ALL ON FUNCTION public.consume_analysis_quota(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_analysis_quota(uuid, integer) TO service_role;

CREATE POLICY "Owners read own chart images" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'chart-images' AND (storage.foldername(name))[1] = auth.uid()::text);