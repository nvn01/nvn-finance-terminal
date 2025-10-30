import { Candle } from "./api";

export function computeLatestMetrics(latest: Candle[]) {
  const last = latest[latest.length - 1];
  const prev = latest.length > 1 ? latest[latest.length - 2] : last;
  const price = last?.close ?? 0;
  const change = price - (prev?.close ?? price);
  const changePercent = (prev?.close ?? 0) !== 0 ? (change / (prev!.close as number)) * 100 : 0;
  const time = last?.ts ? new Date(last.ts).toLocaleTimeString() : "";
  return { price, change, changePercent, time };
}

export function miniSeriesFromRange(range: Candle[]): number[] {
  return range.map((c) => c.close);
}

export function overviewFrom(symbol: string, name: string, latest: Candle[], range: Candle[]) {
  const { price, change, changePercent } = computeLatestMetrics(latest);
  const closes = miniSeriesFromRange(range);
  const minV = closes.length ? Math.min(...closes) : price;
  const maxV = closes.length ? Math.max(...closes) : price;
  const dayRange = `${minV.toFixed(2)} - ${maxV.toFixed(2)}`;
  const chartData = closes.map((v, idx) => ({ time: String(idx), value: v }));
  return {
    name,
    symbol,
    value: price,
    change,
    changePercent,
    previousClose: price - change,
    dayRange,
    chartData,
  };
}

export function tileFrom(symbol: string, name: string, latest: Candle[], range: Candle[]) {
  const { price, change, changePercent } = computeLatestMetrics(latest);
  const chartData = miniSeriesFromRange(range);
  return { symbol, name, price, change, changePercent, chartData };
}
