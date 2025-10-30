-- 0003_seed_more_symbols.up.sql
-- Seed additional FX and Crypto instruments used by the frontend and generate ~240m of 1m candles

SET search_path TO market, public;

-- 1) Insert instruments (FX and Crypto)
INSERT INTO market.instruments (symbol, name, type, base_asset, quote_asset) VALUES
  -- FX majors
  ('XAUUSD','Gold/USD','FX','XAU','USD'),
  ('USDJPY','USD/JPY','FX','USD','JPY'),
  ('USDCHF','USD/CHF','FX','USD','CHF'),
  ('USDCAD','USD/CAD','FX','USD','CAD'),
  ('US30','Dow Futures','INDEX',NULL,NULL),
  ('NZDUSD','NZD/USD','FX','NZD','USD'),
  ('NZDJPY','NZD/JPY','FX','NZD','JPY'),
  ('GBPUSD','GBP/USD','FX','GBP','USD'),
  -- Crypto majors
  ('BTCUSDT','BTC/USDT','CRYPTO','BTC','USDT'),
  ('ETHUSDT','ETH/USDT','CRYPTO','ETH','USDT'),
  ('BNBUSDT','BNB/USDT','CRYPTO','BNB','USDT'),
  ('COMPUSDT','COMP/USDT','CRYPTO','COMP','USDT'),
  ('SUIUSDT','SUI/USDT','CRYPTO','SUI','USDT'),
  ('SOLUSDT','SOL/USDT','CRYPTO','SOL','USDT'),
  -- Crypto altcoins
  ('1000BONKUSDT','1000BONK/USDT','CRYPTO','BONK','USDT'),
  ('1000PEPEUSDT','1000PEPE/USDT','CRYPTO','PEPE','USDT'),
  ('DOGEUSDT','DOGE/USDT','CRYPTO','DOGE','USDT'),
  ('1000SHIBUSDT','1000SHIB/USDT','CRYPTO','SHIB','USDT'),
  ('XRPUSDT','XRP/USDT','CRYPTO','XRP','USDT'),
  ('LTCUSDT','LTC/USDT','CRYPTO','LTC','USDT')
ON CONFLICT (symbol) DO NOTHING;

-- 2) Seed synthetic candles for last 240 minutes
-- Use approx values and small changes to mirror frontend dummy ranges
WITH data(symbol, value, change) AS (
  VALUES
    -- FX
    ('XAUUSD', 2045.50,   12.45),
    ('USDJPY',  149.85,    0.67),
    ('USDCHF',    0.8756,  0.0012),
    ('USDCAD',    1.3456,  0.0023),
    ('US30',  36025.76,  274.24),
    ('NZDUSD',    0.6123, -0.0045),
    ('NZDJPY',   91.75,   -0.34),
    ('GBPUSD',    1.2634, -0.0045),
    -- Crypto majors
    ('BTCUSDT', 43567.89, 1234.56),
    ('ETHUSDT',  2345.67,  -89.45),
    ('BNBUSDT',   234.56,   12.34),
    ('COMPUSDT',   45.67,    2.34),
    ('SUIUSDT',     1.2345,  0.0678),
    ('SOLUSDT',    67.89,    3.45),
    -- Altcoins
    ('1000BONKUSDT', 0.01234, 0.00089),
    ('1000PEPEUSDT', 0.00567,-0.00023),
    ('DOGEUSDT',     0.07890, 0.00340),
    ('1000SHIBUSDT', 0.00890,-0.00045),
    ('XRPUSDT',      0.62340, 0.03450),
    ('LTCUSDT',     72.34,   -2.45)
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
