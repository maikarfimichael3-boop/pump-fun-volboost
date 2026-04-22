import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TierInfo {
    name: string;
    tier: BoostTier;
    solCost: number;
    dollarTarget: bigint;
    estimatedHours: bigint;
}
export interface LeaderboardEntry {
    totalOrders: bigint;
    totalVolume: bigint;
    rank: bigint;
    walletAddress: string;
    displayWallet: string;
}
export interface BoostProgress {
    status: BoostStatus;
    volumeTarget: bigint;
    orderId: string;
    volumeAchieved: bigint;
    timeRemaining: bigint;
    percentComplete: bigint;
}
export interface BoostOrder {
    ca: string;
    id: string;
    status: BoostStatus;
    solAmount: number;
    volumeTarget: bigint;
    createdAt: bigint;
    tier: BoostTier;
    walletAddress: string;
    volumeAchieved: bigint;
    estimatedCompletionTime: bigint;
}
export enum BoostStatus {
    Failed = "Failed",
    Active = "Active",
    Processing = "Processing",
    Completed = "Completed",
    Pending = "Pending"
}
export enum BoostTier {
    Pro = "Pro",
    Elite = "Elite",
    Starter = "Starter",
    Premium = "Premium",
    Advanced = "Advanced",
    Ultra = "Ultra",
    Basic = "Basic",
    Growth = "Growth"
}
export interface backendInterface {
    getActiveBoosts(): Promise<Array<BoostOrder>>;
    getBoostOrder(orderId: string): Promise<BoostOrder | null>;
    getBoostOrdersByWallet(walletAddress: string): Promise<Array<BoostOrder>>;
    getBoostProgress(orderId: string): Promise<BoostProgress | null>;
    getLeaderboard(limit: bigint): Promise<Array<LeaderboardEntry>>;
    getTierInfo(): Promise<Array<TierInfo>>;
    simulateProgressUpdate(): Promise<void>;
    submitBoostOrder(ca: string, tier: string, walletAddress: string): Promise<BoostOrder>;
    updateBoostStatus(orderId: string, status: string): Promise<boolean>;
}
