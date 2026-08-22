import { createServerFn } from "@tanstack/react-start";
import { CONTRACT_ADDRESS, HAS_CA } from "./token.config";


export type TokenStats = {
  name: string;
  symbol: string;
  totalSupply: number;
  priceUsd: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange24h: number | null;
  bondingProgress: number | null;
  complete: boolean;
  inCurve: number | null;
  circulating: number | null;
  updatedAt: number;
};

export const getTokenStats = createServerFn({ method: "GET" }).handler(async (): Promise<TokenStats> => {
  const mint = CONTRACT_ADDRESS;

  if (!HAS_CA) {
    return {
      name: "KOPI",
      symbol: "KOPI",
      totalSupply: 1_000_000_000,
      priceUsd: null,
      marketCapUsd: null,
      liquidityUsd: null,
      volume24hUsd: null,
      priceChange24h: null,
      bondingProgress: null,
      complete: false,
      inCurve: null,
      circulating: null,
      updatedAt: Date.now(),
    };
  }


  const [pumpRes, dexRes] = await Promise.allSettled([
    fetch(`https://frontend-api-v3.pump.fun/coins/${mint}`, {
      headers: { accept: "application/json" },
    }).then((r) => (r.ok ? r.json() : null)),
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`).then((r) => (r.ok ? r.json() : null)),
  ]);

  const pump: any = pumpRes.status === "fulfilled" ? pumpRes.value : null;
  const dex: any = dexRes.status === "fulfilled" ? dexRes.value : null;
  const pair: any = dex?.pairs?.[0] ?? null;

  const decimals = pump?.base_decimals ?? 6;
  const totalSupply = pump?.total_supply ? Number(pump.total_supply) / 10 ** decimals : 1_000_000_000;

  const initialCurveTokens = 793_100_000_000_000;
  const realTokenReserves = pump?.real_token_reserves != null ? Number(pump.real_token_reserves) : null;
  const inCurve = realTokenReserves != null ? realTokenReserves / 10 ** decimals : null;
  const bondingProgress =
    pump?.complete === true
      ? 100
      : realTokenReserves != null
        ? Math.max(0, Math.min(100, ((initialCurveTokens - realTokenReserves) / initialCurveTokens) * 100))
        : null;

  return {
    name: pump?.name ?? pair?.baseToken?.name ?? "Unknown",
    symbol: pump?.symbol ?? pair?.baseToken?.symbol ?? "—",
    totalSupply,
    priceUsd: pair?.priceUsd ? Number(pair.priceUsd) : null,
    marketCapUsd: pair?.marketCap != null ? Number(pair.marketCap) : null,
    liquidityUsd: pair?.liquidity?.usd != null ? Number(pair.liquidity.usd) : null,
    volume24hUsd: pair?.volume?.h24 != null ? Number(pair.volume.h24) : null,
    priceChange24h: pair?.priceChange?.h24 != null ? Number(pair.priceChange.h24) : null,
    bondingProgress,
    complete: Boolean(pump?.complete),
    inCurve,
    circulating: inCurve != null ? totalSupply - inCurve : null,
    updatedAt: Date.now(),
  };
});
