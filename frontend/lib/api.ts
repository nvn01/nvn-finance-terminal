export type Candle = {
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Signal = {
  id: number;
  symbol: string;
  action: "buy" | "sell" | "wait";
  take_profit?: number | null;
  stop_loss?: number | null;
  confidence?: number | null;
  pnl?: number | null;
  chart_screenshot?: string | null;
  reason?: string | null;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const __ttlMs = 10000;
const __cache = new Map<string, { t: number; d: any }>();
const __inflight = new Map<string, Promise<any>>();

function __key(path: string) {
  return path;
}

async function __cached<T>(path: string, fetcher: () => Promise<T>): Promise<T> {
  const k = __key(path);
  const now = Date.now();
  const hit = __cache.get(k);
  if (hit && now < hit.t) return hit.d as T;
  const fly = __inflight.get(k);
  if (fly) return (await fly) as T;
  const p = (async () => {
    const v = await fetcher();
    __cache.set(k, { t: now + __ttlMs, d: v });
    __inflight.delete(k);
    return v;
  })();
  __inflight.set(k, p);
  return (await p) as T;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let details = "";
    try {
      const body = await res.json();
      details = body?.details || body?.error || res.statusText;
    } catch (_) {
      details = res.statusText;
    }
    throw new Error(`HTTP ${res.status}: ${details}`);
  }
  return res.json();
}

export async function getLatestCandles(symbol: string, limit = 200): Promise<Candle[]> {
  const q = new URLSearchParams({ symbol, limit: String(limit) });
  const path = `/candles/latest?${q.toString()}`;
  return __cached<Candle[]>(path, () => http<Candle[]>(path));
}

export async function getRangeCandles(symbol: string, from: Date, to: Date): Promise<Candle[]> {
  const q = new URLSearchParams({
    symbol,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const path = `/candles/range?${q.toString()}`;
  return __cached<Candle[]>(path, () => http<Candle[]>(path));
}

export async function getSignals(symbol: string, limit = 50): Promise<Signal[]> {
  const q = new URLSearchParams({ symbol, limit: String(limit) });
  return http<Signal[]>(`/signals?${q.toString()}`);
}

export async function createSignal(payload: Omit<Signal, "id" | "created_at"> & { symbol: string }): Promise<Signal> {
  return http<Signal>(`/signals`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
