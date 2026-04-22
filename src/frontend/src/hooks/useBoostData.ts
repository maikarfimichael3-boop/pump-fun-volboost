import type { BoostProgress, LeaderboardEntry } from "@/types";
import { useQuery } from "@tanstack/react-query";

/* ─── Mock data helpers ─────────────────────────────────────────────────── */

function getMockLeaderboard(limit: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      ca: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      walletAddress: "7xKXtg2CW87d97TXJSDpbD5",
      tier: "Ultra",
      solAmount: 150,
      status: "completed",
      timestamp: Date.now() - 3_600_000,
    },
    {
      rank: 2,
      ca: "6gATz8uFw2ZvCJG6RM7A6hhkfwM51SARSi5TZ2Axpump",
      walletAddress: "6gATz8uFw2ZvCJG6RM7A6hh",
      tier: "Elite",
      solAmount: 80,
      status: "completed",
      timestamp: Date.now() - 7_200_000,
    },
    {
      rank: 3,
      ca: "9xKRXp2BnTVmLcD4eF8aG1hJ3kM7oN5qR6sT0wPcd04",
      walletAddress: "9xKRXp2BnTVmLcD4eF8aG1h",
      tier: "Premium",
      solAmount: 150,
      status: "running",
      timestamp: Date.now() - 1_800_000,
    },
    {
      rank: 4,
      ca: "rGFb4yejWEuMKT2FPjgYpV8vwvvsE8taPcd9k6xpump",
      walletAddress: "rGFb4yejWEuMKT2FPjgYpV8",
      tier: "Pro",
      solAmount: 25,
      status: "completed",
      timestamp: Date.now() - 10_800_000,
    },
    {
      rank: 5,
      ca: "4mFEPwBVJczNrKXtGoLa3sDq1vbH8jYzR2kT5pW9AeB",
      walletAddress: "4mFEPwBVJczNrKXtGoLa3sD",
      tier: "Advanced",
      solAmount: 8,
      status: "running",
      timestamp: Date.now() - 900_000,
    },
    {
      rank: 6,
      ca: "DsoR2GFQjJYWt8cq7MrGKTgr9j25zFGqpgzMqBn2KDQM",
      walletAddress: "DsoR2GFQjJYWt8cq7MrGKTg",
      tier: "Growth",
      solAmount: 5,
      status: "completed",
      timestamp: Date.now() - 14_400_000,
    },
    {
      rank: 7,
      ca: "HNz3qyLdnuVGDH1MxmvkCsWTqX4KVz9WqYr1PXfJHpF",
      walletAddress: "HNz3qyLdnuVGDH1MxmvkCsW",
      tier: "Basic",
      solAmount: 2,
      status: "completed",
      timestamp: Date.now() - 21_600_000,
    },
    {
      rank: 8,
      ca: "AMnRvt7qMoLpZ3cFwYxKnT2jRVzPeGU9aXhBdC6sETka",
      walletAddress: "AMnRvt7qMoLpZ3cFwYxKnT2",
      tier: "Starter",
      solAmount: 1.5,
      status: "completed",
      timestamp: Date.now() - 28_800_000,
    },
    {
      rank: 9,
      ca: "FGkz9nWqU7mTpL4cYvXRd2bsEJ1oAP6hNkCxVreB8MQt",
      walletAddress: "FGkz9nWqU7mTpL4cYvXRd2b",
      tier: "Growth",
      solAmount: 5,
      status: "completed",
      timestamp: Date.now() - 36_000_000,
    },
    {
      rank: 10,
      ca: "KLmxPRvzJ9sWn5dBtyGhEoA3QkU6uCfN4e8HjpYDvIWT",
      walletAddress: "KLmxPRvzJ9sWn5dBtyGhEoA",
      tier: "Basic",
      solAmount: 1.5,
      status: "running",
      timestamp: Date.now() - 43_200_000,
    },
  ];
  return entries.slice(0, limit);
}

function getMockActiveBoosts(): LeaderboardEntry[] {
  const now = Date.now();
  return [
    {
      rank: 1,
      ca: "6gATz8uFw2ZvCJG6RM7A6hhkfwM51SARSi5TZ2Axpump",
      walletAddress: "6gATz8uFw2ZvCJG6RM7A6hh",
      tier: "Elite",
      solAmount: 15,
      status: "running",
      timestamp: now - 1_200_000,
    },
    {
      rank: 2,
      ca: "4mFEPwBVJczNrKXtGoLa3sDq1vbH8jYzR2kT5pW9AeB",
      walletAddress: "4mFEPwBVJczNrKXtGoLa3sD",
      tier: "Advanced",
      solAmount: 8,
      status: "running",
      timestamp: now - 3_600_000,
    },
    {
      rank: 3,
      ca: "KLmxPRvzJ9sWn5dBtyGhEoA3QkU6uCfN4e8HjpYDvIWT",
      walletAddress: "KLmxPRvzJ9sWn5dBtyGhEoA",
      tier: "Basic",
      solAmount: 1.5,
      status: "pending",
      timestamp: now - 300_000,
    },
  ];
}

function getMockProgress(orderId: string): BoostProgress {
  // Deterministic progress based on orderId hash
  const pct = (orderId.charCodeAt(0) % 40) + 40;
  return {
    orderId,
    status: "running",
    percentage: pct,
    volumeAdded: Math.round(pct * 420),
    timeRemaining: Math.round((100 - pct) * 90),
  };
}

/* ─── Exported hooks ────────────────────────────────────────────────────── */

export function useLeaderboard(limit = 20) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard_v2", limit],
    queryFn: async () => {
      await new Promise<void>((r) => setTimeout(r, 400));
      return getMockLeaderboard(limit);
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useActiveBoosts() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["activeBoosts_v2"],
    queryFn: async () => {
      await new Promise<void>((r) => setTimeout(r, 350));
      return getMockActiveBoosts();
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useBoostProgress(orderId: string | null) {
  return useQuery<BoostProgress | null>({
    queryKey: ["boostProgress_v2", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      await new Promise<void>((r) => setTimeout(r, 200));
      return getMockProgress(orderId);
    },
    enabled: !!orderId,
    refetchInterval: orderId ? 5_000 : false,
  });
}
