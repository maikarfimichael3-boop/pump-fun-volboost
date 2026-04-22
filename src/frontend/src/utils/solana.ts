/* ─── Solana utility functions ──────────────────────────────────────────── */

const BASE58_CHARS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const TX_HASH_CHARS = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;

export function isValidSolanaAddress(address: string): boolean {
  return BASE58_CHARS.test(address.trim());
}

export function isValidTxHash(hash: string): boolean {
  return TX_HASH_CHARS.test(hash.trim());
}

export function formatAddress(
  address: string,
  prefixLen = 6,
  suffixLen = 4,
): string {
  if (!address || address.length <= prefixLen + suffixLen + 3) return address;
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

export function formatSolAmount(amount: number): string {
  if (amount < 0.01) return `${amount} SOL`;
  if (amount < 1) return `${amount.toFixed(2)} SOL`;
  if (amount < 1000)
    return `${amount % 1 === 0 ? amount : amount.toFixed(1)} SOL`;
  return `${(amount / 1000).toFixed(1)}K SOL`;
}

export function formatUsdAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(usd >= 10_000 ? 0 : 1)}K`;
  return `$${usd.toLocaleString()}`;
}

export function generateOrderId(): string {
  return Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  )
    .join("")
    .toUpperCase();
}

/* ─── Token Metadata ────────────────────────────────────────────────────── */

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  decimals: number;
  source: "pumpfun" | "jupiter" | "dexscreener" | null;
  isPumpFunToken: boolean;
  marketCap?: number;
  usdMarketCap?: number;
}

/* ─── Pump.fun API lookup ────────────────────────────────────────────────── */

interface PumpFunCoin {
  mint: string;
  name: string;
  symbol: string;
  image_uri?: string;
  market_cap?: number;
  usd_market_cap?: number;
  bonding_curve?: string;
}

async function lookupPumpFun(ca: string): Promise<TokenMetadata | null> {
  try {
    const res = await fetch(`https://frontend-api.pump.fun/coins/${ca}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PumpFunCoin;
    if (!data?.mint) return null;
    return {
      address: data.mint,
      name: data.name || "Unknown",
      symbol: data.symbol || "???",
      logoURI: data.image_uri,
      decimals: 6,
      source: "pumpfun",
      isPumpFunToken: true,
      marketCap: data.market_cap,
      usdMarketCap: data.usd_market_cap,
    };
  } catch {
    return null;
  }
}

/* ─── Jupiter per-token API lookup ──────────────────────────────────────── */

interface JupiterTokenV1 {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  decimals: number;
}

async function lookupJupiter(ca: string): Promise<TokenMetadata | null> {
  try {
    const res = await fetch(`https://api.jup.ag/tokens/v1/${ca}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as JupiterTokenV1;
    if (!data?.address) return null;
    return {
      address: data.address,
      name: data.name || "Unknown",
      symbol: data.symbol || "???",
      logoURI: data.logoURI,
      decimals: data.decimals ?? 6,
      source: "jupiter",
      isPumpFunToken: false,
    };
  } catch {
    return null;
  }
}

/* ─── DexScreener API lookup ─────────────────────────────────────────────── */

interface DexScreenerPair {
  baseToken?: { address: string; name: string; symbol: string };
  info?: { imageUrl?: string };
}

interface DexScreenerResponse {
  pairs?: DexScreenerPair[];
}

async function lookupDexScreener(ca: string): Promise<TokenMetadata | null> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${ca}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as DexScreenerResponse;
    const pair = data?.pairs?.[0];
    if (!pair?.baseToken) return null;
    return {
      address: pair.baseToken.address,
      name: pair.baseToken.name || "Unknown",
      symbol: pair.baseToken.symbol || "???",
      logoURI: pair.info?.imageUrl,
      decimals: 6,
      source: "dexscreener",
      isPumpFunToken: false,
    };
  } catch {
    return null;
  }
}

/* ─── Multi-source token lookup ─────────────────────────────────────────── */

export async function lookupTokenByCA(
  ca: string,
): Promise<TokenMetadata | null> {
  const addr = ca.trim();
  if (!isValidSolanaAddress(addr)) return null;

  // Try sources in priority order — stop at first hit
  const pumpResult = await lookupPumpFun(addr);
  if (pumpResult) return pumpResult;

  const jupResult = await lookupJupiter(addr);
  if (jupResult) return jupResult;

  const dexResult = await lookupDexScreener(addr);
  return dexResult;
}

/* ─── Solana RPC TX verification ────────────────────────────────────────── */

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

export type TxVerifyResult =
  | { status: "confirmed"; slot: number }
  | { status: "not_found" }
  | { status: "rpc_error"; message: string };

export async function verifyTxOnChain(txHash: string): Promise<TxVerifyResult> {
  try {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [txHash, { encoding: "json", maxSupportedTransactionVersion: 0 }],
    };
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      return { status: "rpc_error", message: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as {
      result: { slot: number } | null;
      error?: { message: string };
    };
    if (json.error) {
      return { status: "rpc_error", message: json.error.message };
    }
    if (!json.result) {
      return { status: "not_found" };
    }
    return { status: "confirmed", slot: json.result.slot };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { status: "rpc_error", message: msg };
  }
}
