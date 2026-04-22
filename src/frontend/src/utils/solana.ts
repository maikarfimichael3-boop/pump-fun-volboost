/* ─── Solana utility functions ──────────────────────────────────────────── */

const BASE58_CHARS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolanaAddress(address: string): boolean {
  return BASE58_CHARS.test(address.trim());
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
