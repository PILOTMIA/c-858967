
CREATE TABLE public.cot_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency text NOT NULL,
  report_date date NOT NULL,
  long_positions bigint NOT NULL DEFAULT 0,
  short_positions bigint NOT NULL DEFAULT 0,
  net_position bigint NOT NULL DEFAULT 0,
  change_long bigint DEFAULT 0,
  change_short bigint DEFAULT 0,
  pct_long numeric(5,1) DEFAULT 0,
  pct_short numeric(5,1) DEFAULT 0,
  source text DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(currency, report_date)
);

ALTER TABLE public.cot_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read COT history"
  ON public.cot_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert COT history"
  ON public.cot_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_cot_history_currency_date ON public.cot_history (currency, report_date DESC);
