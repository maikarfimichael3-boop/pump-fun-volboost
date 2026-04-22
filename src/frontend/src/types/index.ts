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

export type WizardStep = 1 | 2 | 3 | 4;

export interface BoostSession {
  ca: string;
  packageId: string;
  walletPublicKey?: string;
  orderId: string;
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
