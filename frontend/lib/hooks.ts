import useSWR from "swr";
import { Candle, getLatestCandles, getRangeCandles } from "./api";

export function useLatestCandles(symbol: string | null, limit = 200) {
  const key = symbol ? ["latest", symbol, limit] : null;
  const { data, error, isLoading, mutate } = useSWR<Candle[]>(key, {
    fetcher: async ([, s, l]: [string, string, number]) => getLatestCandles(s, l),
    dedupingInterval: 10000,
    revalidateOnFocus: true,
  } as any);
  return { data: data || [], error, isLoading, mutate };
}

type Item = {
  id: string;
  num: string;
  rmi: string;
  value: number;
  change: number;
  pctChange: number;
  avat: number;
  time: string;
  ytd: number;
  ytdCur: number;
};

export function useHydrateSection(items: Item[]) {
  const ids = items.map((i) => i.id).join(",");
  const { data, error, isLoading } = useSWR<Item[]>(
    ids ? ["hydrate-latest", ids] : null,
    async () => {
      const updated = await Promise.all(
        items.map(async (it) => {
          try {
            const latest = await getLatestCandles(it.id, 2);
            const last = latest[latest.length - 1];
            const prev = latest.length > 1 ? latest[latest.length - 2] : last;
            const price = last?.close ?? 0;
            const change = price - (prev?.close ?? price);
            const pctChange = (prev?.close ?? 0) !== 0 ? (change / (prev?.close as number)) * 100 : 0;
            const time = last?.ts ? new Date(last.ts).toLocaleTimeString() : it.time;
            return { ...it, value: price, change, pctChange, time };
          } catch {
            return it;
          }
        })
      );
      return updated;
    },
    { dedupingInterval: 10000, revalidateOnFocus: true }
  );
  return { data: data || items, error, isLoading };
}

export function useRangeCandles(symbol: string | null, from?: Date, to?: Date) {
  const has = symbol && from && to;
  const key = has ? ["range", symbol as string, from!.toISOString(), to!.toISOString()] : null;
  const { data, error, isLoading, mutate } = useSWR<Candle[]>(key, {
    fetcher: async ([, s, f, t]: [string, string, string, string]) =>
      getRangeCandles(s, new Date(f), new Date(t)),
    dedupingInterval: 10000,
    revalidateOnFocus: true,
  } as any);
  return { data: data || [], error, isLoading, mutate };
}
