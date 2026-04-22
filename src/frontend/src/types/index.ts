/* ─── Shared TypeScript types for Pump.Fun VolBoost ─────────────────────── */

export interface VolumePackage {
  id: string;
  name: string;
  targetVolume: number;
  targetVolumeFmt: string;
  solCost: number;
  solCostFmt: string;
  usdCost: string;
  badge: string | null;
  description: string;
  popular?: boolean;
}

/** 1=CA input, 2=Package, 3=Payment review, 4=TX Hash, 5=Boost confirmed */
export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface BoostSession {
  ca: string;
  packageId: string;
  walletPublicKey?: string;
  orderId: string;
  txHash?: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  ca: string;
  walletAddress: string;
  tier: string;
  solAmount: number;
  status: string;
  timestamp: number;
}

export interface BoostProgress {
  orderId: string;
  status: string;
  percentage: number;
  volumeAdded: number;
  timeRemaining: number;
}

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
