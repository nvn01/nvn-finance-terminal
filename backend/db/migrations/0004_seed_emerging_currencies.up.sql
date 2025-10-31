-- 0004_seed_emerging_currencies.up.sql
-- Seed missing emerging currencies FX pairs and generate ~240m of 1m candles

SET search_path TO market, public;

-- 1) Insert missing FX instruments
INSERT INTO market.instruments (symbol, name, type, base_asset, quote_asset) VALUES
  -- Emerging currencies
  ('GBPCHF','GBP/CHF','FX','GBP','CHF'),
  ('GBPAUD','GBP/AUD','FX','GBP','AUD'),
  ('EURJPY','EUR/JPY','FX','EUR','JPY'),
  ('EURCHF','EUR/CHF','FX','EUR','CHF'),
  ('AUDUSD','AUD/USD','FX','AUD','USD'),
  ('AUDJPY','AUD/JPY','FX','AUD','JPY')
ON CONFLICT (symbol) DO NOTHING;

-- Note: EURUSD and AAPL already exist from 0001_initial.up.sql but have no timeframe_1m data

-- 2) Seed synthetic candles for last 240 minutes
-- Use realistic FX values with small changes, and equity prices
WITH data(symbol, value, change) AS (
  VALUES
    -- FX pairs
    ('EURUSD',  1.0856,  0.0045),
    ('GBPCHF',  1.1234,  0.0056),
    ('GBPAUD',  1.9456, -0.0123),
    ('EURJPY',  161.45,  0.78),
    ('EURCHF',  0.9567,  0.0034),
    ('AUDUSD',  0.6534, -0.0067),
    ('AUDJPY',  98.23,  -0.45),
    -- Equity
    ('AAPL',    178.45,  2.34)
)
INSERT INTO market.timeframe_1m (instrument_id, ts, open, high, low, close, volume)
SELECT
  i.id,
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
    (d.value - d.change) + (d.change * (239 - gs.n) / 239.0)
    + (0.003 * d.value * sin(gs.n / 7.0)) AS v
) calc ON TRUE
ON CONFLICT (instrument_id, ts) DO UPDATE SET
  open = EXCLUDED.open,
  high = EXCLUDED.high,
  low = EXCLUDED.low,
  close = EXCLUDED.close,
  volume = EXCLUDED.volume;
