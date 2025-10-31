-- 0005_seed_tech_stocks.up.sql
-- Seed major tech stocks and generate ~240m of 1m candles

SET search_path TO market, public;

-- 1) Insert tech stock instruments (update if exists to ensure correct name)
INSERT INTO market.instruments (symbol, name, type, base_asset, quote_asset) VALUES
  -- Tech Giants
  ('AAPL','Apple Inc.','EQ',NULL,NULL),
  ('MSFT','Microsoft Corporation','EQ',NULL,NULL),
  ('GOOGL','Alphabet Inc.','EQ',NULL,NULL),
  ('AMZN','Amazon.com Inc.','EQ',NULL,NULL),
  ('META','Meta Platforms Inc.','EQ',NULL,NULL),
  ('NVDA','NVIDIA Corporation','EQ',NULL,NULL),
  ('TSLA','Tesla Inc.','EQ',NULL,NULL),
  ('NFLX','Netflix Inc.','EQ',NULL,NULL),
  -- Semiconductors
  ('AMD','Advanced Micro Devices','EQ',NULL,NULL),
  ('INTC','Intel Corporation','EQ',NULL,NULL),
  ('AVGO','Broadcom Inc.','EQ',NULL,NULL),
  ('QCOM','Qualcomm Inc.','EQ',NULL,NULL),
  -- Software & Cloud
  ('CRM','Salesforce Inc.','EQ',NULL,NULL),
  ('ORCL','Oracle Corporation','EQ',NULL,NULL),
  ('ADBE','Adobe Inc.','EQ',NULL,NULL),
  ('CSCO','Cisco Systems Inc.','EQ',NULL,NULL),
  -- Payments & Fintech
  ('PYPL','PayPal Holdings Inc.','EQ',NULL,NULL),
  ('SQ','Block Inc.','EQ',NULL,NULL),
  ('V','Visa Inc.','EQ',NULL,NULL),
  ('MA','Mastercard Inc.','EQ',NULL,NULL)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;

-- 2) Seed synthetic candles for last 240 minutes
-- Use realistic stock prices with small changes
WITH data(symbol, value, change) AS (
  VALUES
    -- Tech Giants
    ('AAPL',    178.45,   2.34),
    ('MSFT',    338.11,   4.87),
    ('GOOGL',   142.63,  -1.32),
    ('AMZN',    155.88,   1.45),
    ('META',    298.75,  -5.42),
    ('NVDA',    465.23,  18.76),
    ('TSLA',    248.50,  -8.23),
    ('NFLX',    445.12,   8.93),
    -- Semiconductors
    ('AMD',     112.34,  -2.67),
    ('INTC',     45.78,   1.23),
    ('AVGO',    892.45,  12.34),
    ('QCOM',    145.67,   3.21),
    -- Software & Cloud
    ('CRM',     234.56,   6.78),
    ('ORCL',     89.45,  -1.34),
    ('ADBE',    567.89, -12.45),
    ('CSCO',     52.34,   0.87),
    -- Payments & Fintech
    ('PYPL',     78.90,   2.34),
    ('SQ',       67.45,  -3.21),
    ('V',       245.67,   4.56),
    ('MA',      398.23,   7.89)
)
INSERT INTO market.timeframe_1m (instrument_id, ts, open, high, low, close, volume)
SELECT
  i.id,
  ts,
  open_val AS open,
  high_val AS high,
  low_val AS low,
  close_val AS close,
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
    + (0.002 * d.value * sin(gs.n / 3.0)) AS base_val
) calc ON TRUE
JOIN LATERAL (
  SELECT
    base_val AS open_val,
    base_val * (1.0 + 0.001 * random()) AS high_val,
    base_val * (1.0 - 0.001 * random()) AS low_val,
    base_val + (0.001 * d.value * (random() - 0.5)) AS close_val
) ohlc ON TRUE
ON CONFLICT (instrument_id, ts) DO UPDATE SET
  open = EXCLUDED.open,
  high = EXCLUDED.high,
  low = EXCLUDED.low,
  close = EXCLUDED.close,
  volume = EXCLUDED.volume;
