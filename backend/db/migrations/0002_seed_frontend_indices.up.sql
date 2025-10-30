-- 0002_seed_frontend_indices.up.sql
-- Seed instruments and synthetic candles to mirror current frontend dummy data.
-- Generates ~240 minutes of 1m candles per symbol so charts and lists are populated.

SET search_path TO market, public;

-- 1) Instruments (indices and labels used in frontend)
INSERT INTO market.instruments (symbol, name, type, base_asset, quote_asset) VALUES
  -- Americas (marketData.ts)
  ('DOW JONES',       'DOW JONES',       'INDEX', NULL, NULL),
  ('S&P 500',         'S&P 500',         'INDEX', NULL, NULL),
  ('NASDAQ',          'NASDAQ',          'INDEX', NULL, NULL),
  ('S&P/TSX Comp',    'S&P/TSX Comp',    'INDEX', NULL, NULL),
  ('S&P/BMV IPC',     'S&P/BMV IPC',     'INDEX', NULL, NULL),
  ('IBOVESPA',        'IBOVESPA',        'INDEX', NULL, NULL),
  -- EMEA
  ('Euro Stoxx 50',   'Euro Stoxx 50',   'INDEX', NULL, NULL),
  ('FTSE 100',        'FTSE 100',        'INDEX', NULL, NULL),
  ('CAC 40',          'CAC 40',          'INDEX', NULL, NULL),
  ('DAX',             'DAX',             'INDEX', NULL, NULL),
  ('IBEX 35',         'IBEX 35',         'INDEX', NULL, NULL),
  ('FTSE MIB',        'FTSE MIB',        'INDEX', NULL, NULL),
  ('OMX STKH30',      'OMX STKH30',      'INDEX', NULL, NULL),
  ('SWISS MKT',       'SWISS MKT',       'INDEX', NULL, NULL),
  -- Asia Pacific
  ('NIKKEI',          'NIKKEI',          'INDEX', NULL, NULL),
  ('HANG SENG',       'HANG SENG',       'INDEX', NULL, NULL),
  ('CSI 300',         'CSI 300',         'INDEX', NULL, NULL),
  ('S&P/ASX 200',     'S&P/ASX 200',     'INDEX', NULL, NULL),
  -- Market Overview (page.tsx) tickers
  ('SPX',             'S&P 500',         'INDEX', NULL, NULL),
  ('IXIC',            'NASDAQ',          'INDEX', NULL, NULL),
  ('DJI',             'DOW JONES',       'INDEX', NULL, NULL),
  ('UKX',             'FTSE 100',        'INDEX', NULL, NULL),
  ('N225',            'NIKKEI 225',      'INDEX', NULL, NULL)
ON CONFLICT (symbol) DO NOTHING;

-- 2) Seed synthetic candles for the above so API endpoints return meaningful data
-- Strategy: last 240 minutes, linear path from (value-change) up to (value) with a tiny sinusoidal wiggle.
-- OHLC = same value (no real high/low), volume small. Idempotent upsert.

WITH data(symbol, value, change) AS (
  VALUES
    -- Americas
    ('DOW JONES',     28115.17,  121.84),
    ('S&P 500',        3415.16,   31.62),
    ('NASDAQ',        11234.07,  177.42),
    ('S&P/TSX Comp',  16496.38,  136.25),
    ('S&P/BMV IPC',   36800.14,  -81.85),
    ('IBOVESPA',     100469.81,  195.29),
    -- EMEA
    ('Euro Stoxx 50',  3332.26,   15.47),
    ('FTSE 100',       6105.54,   79.29),
    ('CAC 40',         5067.93,   16.05),
    ('DAX',           13217.67,   24.01),
    ('IBEX 35',        7036.00,   84.90),
    ('FTSE MIB',      19956.95,  163.15),
    ('OMX STKH30',     1818.80,   16.11),
    ('SWISS MKT',     10520.00,   62.57),
    -- Asia Pacific
    ('NIKKEI',        23454.89, -104.41),
    ('HANG SENG',     24732.76,   92.48),
    ('CSI 300',        4688.48,   37.43),
    ('S&P/ASX 200',    5894.83,   -4.70),
    -- Market Overview
    ('SPX',            4733.77,   36.73),
    ('IXIC',          15659.41,  119.84),
    ('DJI',           36025.76,  274.24),
    ('UKX',            7373.34,   31.68),
    ('N225',          28798.37,  236.16)
)
INSERT INTO market.timeframe_1m (instrument_id, ts, open, high, low, close, volume)
SELECT
  i.id AS instrument_id,
  ts,
  v AS open,
  v AS high,
  v AS low,
  v AS close,
  10.0 + (gs.n % 10) AS volume
FROM data d
JOIN market.instruments i ON i.symbol = d.symbol
JOIN LATERAL (
  SELECT
    generate_series(0, 239) AS n,
    now() - (generate_series(0, 239) || ' minute')::interval AS ts
) AS gs ON TRUE
JOIN LATERAL (
  SELECT
    -- Linear interpolation from (value-change) at oldest to (value) at now()
    (d.value - d.change) + (d.change * (239 - gs.n) / 239.0)
    + (0.003 * d.value * sin(gs.n / 7.0)) AS v
) calc ON TRUE
ON CONFLICT (instrument_id, ts) DO UPDATE SET
  open = EXCLUDED.open,
  high = EXCLUDED.high,
  low = EXCLUDED.low,
  close = EXCLUDED.close,
  volume = EXCLUDED.volume;

-- 3) Index to speed up signals listing by instrument and recency
CREATE INDEX IF NOT EXISTS idx_signals_instr_created_desc
  ON market.signals (instrument_id, created_at DESC);
