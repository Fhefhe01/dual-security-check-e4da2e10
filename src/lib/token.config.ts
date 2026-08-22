// Single source of truth for the token contract address.
// Leave empty ("") until the official CA is released — the whole site
// (display text, links, tokenomics) reacts to this one value.
export const CONTRACT_ADDRESS = "";

export const HAS_CA = CONTRACT_ADDRESS.length > 0;

export const CA_DISPLAY = HAS_CA ? CONTRACT_ADDRESS : "Coming Soon";

export const PUMPFUN_URL = HAS_CA ? `https://pump.fun/coin/${CONTRACT_ADDRESS}` : "https://pump.fun";
export const DEXSCREENER_URL = HAS_CA ? `https://dexscreener.com/solana/${CONTRACT_ADDRESS}` : null;
export const SOLSCAN_URL = HAS_CA ? `https://solscan.io/token/${CONTRACT_ADDRESS}` : null;
export const BIRDEYE_URL = HAS_CA ? `https://birdeye.so/token/${CONTRACT_ADDRESS}` : null;
