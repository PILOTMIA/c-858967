DROP FUNCTION IF EXISTS public.consume_analysis_quota(uuid, integer);
CREATE FUNCTION public.consume_analysis_quota(_user_id uuid, _per_minute integer, _per_day integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
  _minute bigint := floor(extract(epoch from now()) / 60);
  _day text := to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD');
  _m integer; _d integer;
BEGIN
  DELETE FROM public.analysis_usage WHERE expires_at < _now_ms;
  -- Lock the daily row first so concurrent calls for one user serialise.
  INSERT INTO public.analysis_usage (id, used, expires_at)
  VALUES (_user_id::text || ':day:' || _day, 0, _now_ms + 2 * 86400000)
  ON CONFLICT (id) DO UPDATE SET used = public.analysis_usage.used
  RETURNING used INTO _d;
  IF _d >= _per_day THEN RETURN 'day'; END IF;
  INSERT INTO public.analysis_usage (id, used, expires_at)
  VALUES (_user_id::text || ':' || _minute::text, 0, (_minute + 2) * 60000)
  ON CONFLICT (id) DO UPDATE SET used = public.analysis_usage.used
  RETURNING used INTO _m;
  IF _m >= _per_minute THEN RETURN 'minute'; END IF;
  UPDATE public.analysis_usage SET used = used + 1 WHERE id IN (_user_id::text || ':day:' || _day, _user_id::text || ':' || _minute::text);
  RETURN 'ok';
END; $$;
REVOKE ALL ON FUNCTION public.consume_analysis_quota(uuid, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_analysis_quota(uuid, integer, integer) TO service_role;
COMMENT ON TABLE public.analysis_usage IS 'Server-only rate-limit state (per-minute and per-UTC-day analysis counters); written only via consume_analysis_quota.';