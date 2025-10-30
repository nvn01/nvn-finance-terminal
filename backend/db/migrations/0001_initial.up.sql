-- 0001_initial.up.sql

-- Use dedicated schema to avoid collisions
CREATE SCHEMA IF NOT EXISTS market;
SET search_path TO market, public;

-- (Exchanges removed as per requirements)

-- 2) Instruments
CREATE TABLE IF NOT EXISTS market.instruments (
  id              bigserial PRIMARY KEY,
  symbol          text NOT NULL UNIQUE,
  name            text,
  type            text NOT NULL CHECK (type IN ('EQ','FX','CRYPTO','INDEX')),
  base_asset      text,
  quote_asset     text
);

-- 3) 1-minute timeframe data (single table, no partitioning)
CREATE TABLE IF NOT EXISTS market.timeframe_1m (
  instrument_id   bigint NOT NULL REFERENCES market.instruments(id) ON DELETE CASCADE,
  ts              timestamptz NOT NULL,
  open            double precision NOT NULL,
  high            double precision NOT NULL,
  low             double precision NOT NULL,
  close           double precision NOT NULL,
  volume          double precision NOT NULL,
  PRIMARY KEY (instrument_id, ts)
);

-- (No expression index needed; symbol itself is UNIQUE)

-- (Partitioning removed)

-- Indexes
CREATE INDEX IF NOT EXISTS idx_timeframe_1m_instr_ts_desc
  ON market.timeframe_1m (instrument_id, ts DESC);

-- 4) Signals table
CREATE TABLE IF NOT EXISTS market.signals (
  id                bigserial PRIMARY KEY,
  instrument_id     bigint NOT NULL REFERENCES market.instruments(id) ON DELETE CASCADE,
  action            text NOT NULL CHECK (action IN ('buy','sell','wait')),
  take_profit       double precision,
  stop_loss         double precision,
  confidence        double precision,
  pnl               double precision,
  chart_screenshot  text,
  reason            text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Seed data (minimal)
INSERT INTO market.instruments (symbol, name, type, base_asset, quote_asset) VALUES
  ('BTCUSDT', 'BTC/USDT', 'CRYPTO', 'BTC', 'USDT'),
  ('ETHUSDT', 'ETH/USDT', 'CRYPTO', 'ETH', 'USDT'),
  ('EURUSD',  'EUR/USD',  'FX',     'EUR', 'USD'),
  ('AAPL',    'Apple Inc','EQ',     NULL,  NULL),
  ('XAUUSD',  'Gold/USD', 'INDEX',  'XAU', 'USD')
ON CONFLICT (symbol) DO NOTHING;

-- timeframe points (5 rows total)
INSERT INTO market.timeframe_1m (instrument_id, ts, open, high, low, close, volume)
SELECT i.id, now() - (interval '1 minute' * x.shift),
       100.0 + x.shift, 101.0 + x.shift, 99.5 + x.shift, 100.5 + x.shift, 10.0 + x.shift
FROM (VALUES (0),(1),(2),(3),(4)) AS x(shift)
JOIN market.instruments i ON i.symbol = 'BTCUSDT'
ON CONFLICT DO NOTHING;

-- signals (5 rows)
INSERT INTO market.signals (instrument_id, action, take_profit, stop_loss, confidence, pnl, chart_screenshot, reason)
SELECT i.id, s.action, s.tp, s.sl, s.conf, s.pnl, s.img, s.reason
FROM market.instruments i
CROSS JOIN (
  VALUES
    ('buy',  105.0::double precision,  95.0::double precision, 0.80::double precision, NULL::double precision,  'https://example.com/img1.png', 'Breakout'),
    ('sell',  98.0::double precision, 105.0::double precision, 0.60::double precision, NULL::double precision,  'https://example.com/img2.png', 'Rejection'),
    ('wait', NULL::double precision,  NULL::double precision,  0.50::double precision, NULL::double precision,  NULL,                        'No setup'),
    ('buy',  110.0::double precision, 100.0::double precision, 0.70::double precision, NULL::double precision,  'https://example.com/img3.png', 'Trend follow'),
    ('sell',  95.0::double precision, 102.0::double precision, 0.65::double precision, NULL::double precision,  'https://example.com/img4.png', 'Mean reversion')
) AS s(action, tp, sl, conf, pnl, img, reason)
WHERE i.symbol = 'BTCUSDT'
ON CONFLICT DO NOTHING;
