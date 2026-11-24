ALTER TABLE public.trades ALTER COLUMN image_key SET NOT NULL;
ALTER TABLE public.trades ADD CONSTRAINT trades_record_is_object CHECK (jsonb_typeof(record) = 'object');

CREATE OR REPLACE FUNCTION public.validate_trade_row()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.image_key IS NULL OR split_part(NEW.image_key, '/', 1) <> NEW.owner_id::text OR NEW.image_key LIKE '%..%' THEN
    RAISE EXCEPTION 'Chart image must be stored in the owner''s private folder';
  END IF;
  IF COALESCE(NEW.record ->> 'verified', '') <> 'true' THEN
    RAISE EXCEPTION 'Trade details must be confirmed before saving';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trades_validate BEFORE INSERT OR UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.validate_trade_row();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
CREATE POLICY "Owners insert own trades" ON public.trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete own trades" ON public.trades FOR DELETE TO authenticated USING (auth.uid() = owner_id);

REVOKE ALL ON public.analysis_usage FROM anon, authenticated;
COMMENT ON TABLE public.analysis_usage IS 'Server-only rate-limit state (8 analyses per user per 60-second window); written only via consume_analysis_quota.';