import type { BoostProgress, LeaderboardEntry } from "@/types";
import { verifyTxOnChain } from "@/utils/solana";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ─── Backend boost hooks ────────────────────────────────────────────────── */

export function useLeaderboard(limit = 10) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", limit],
    queryFn: async () => getMockLeaderboard().slice(0, limit),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useBoostProgress(orderId: string | null) {
  return useQuery<BoostProgress | null>({
    queryKey: ["progress", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return getMockProgress(orderId);
    },
    enabled: !!orderId,
    refetchInterval: orderId ? 5_000 : false,
  });
}

export function useActiveBoosts() {
  return useQuery({
    queryKey: ["activeBoosts"],
    queryFn: async () => [],
    refetchInterval: 15_000,
  });
}

export function useSubmitOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ca,
      tier,
      solAmount,
      walletAddress,
    }: {
      ca: string;
      tier: string;
      solAmount: number;
      walletAddress: string;
    }) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 1600));
      return {
        orderId: Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        )
          .join("")
          .toUpperCase(),
        ca,
        tier,
        solAmount,
        walletAddress,
        status: "running",
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leaderboard"] });
      void qc.invalidateQueries({ queryKey: ["activeBoosts"] });
    },
  });
}

/* ─── TX Hash on-chain verification ─────────────────────────────────────── */

export type TxVerifyOutcome =
  | { kind: "confirmed"; slot: number }
  | { kind: "not_found" }
  | { kind: "rpc_error"; message: string };

export function useVerifyTxOnChain() {
  return useMutation<TxVerifyOutcome, Error, { txHash: string }>({
    mutationFn: async ({ txHash }) => {
      const result = await verifyTxOnChain(txHash.trim());
      if (result.status === "confirmed") {
        return { kind: "confirmed", slot: result.slot };
      }
      if (result.status === "not_found") {
        return { kind: "not_found" };
      }
      return { kind: "rpc_error", message: result.message };
    },
  });
}

export function useSubmitTxHash() {
  return useMutation({
    mutationFn: async ({
      orderId,
      txHash,
    }: {
      orderId: string;
      txHash: string;
    }) => {
      // Simulated order record update — real verification is via useVerifyTxOnChain
      await new Promise<void>((resolve) => setTimeout(resolve, 400));
      return { orderId, txHash, status: "pending_verification" };
    },
  });
}

export function useVerifyBoost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      return { orderId, status: "running", verified: true };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leaderboard"] });
      void qc.invalidateQueries({ queryKey: ["activeBoosts"] });
    },
  });
}

/* ─── Mock fallback data ─────────────────────────────────────────────────── */

function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    {
      rank: 1,
      ca: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      walletAddress: "7xKXX...u9f2",
      tier: "Pro Boost",
      solAmount: 7,
      status: "completed",
      timestamp: Date.now() - 3600_000,
    },
    {
      rank: 2,
      ca: "6gATz8uFw2ZvCJG6RM7A6hhkfwM51SARSi5TZ2Axpump",
      walletAddress: "6gATX...pump",
      tier: "Advanced Boost",
      solAmount: 12,
      status: "running",
      timestamp: Date.now() - 1800_000,
    },
    {
      rank: 3,
      ca: "9xKRXp2BnTVmLcD4eF8aG1hJ3kM7oN5qR6sT0wPcd04",
      walletAddress: "9xKRX...cd04",
      tier: "Elite Boost",
      solAmount: 25,
      status: "completed",
      timestamp: Date.now() - 7200_000,
    },
    {
      rank: 4,
      ca: "rGFb4yejWEuMKT2FPjgYpV8vwvvsE8taPcd9k6xpump",
      walletAddress: "rGFbX...pump",
      tier: "Standard Boost",
      solAmount: 2.5,
      status: "completed",
      timestamp: Date.now() - 10800_000,
    },
    {
      rank: 5,
      ca: "4mFEPwBVJczNrKXtGoLa3sDq1vbH8jYzR2kT5pW9AeB",
      walletAddress: "4mFEX...AeB",
      tier: "Basic Boost",
      solAmount: 1.5,
      status: "running",
      timestamp: Date.now() - 900_000,
    },
  ];
}

function getMockProgress(orderId: string): BoostProgress {
  return {
    orderId,
    status: "running",
    percentage: 68,
    volumeAdded: 17_000,
    timeRemaining: 1800,
  };
}
