import { useLeaderboard } from "@/hooks/useBoostData";
import type { LeaderboardEntry } from "@/types";
import { haptic } from "@/utils/haptic";
import { formatAddress, formatSolAmount } from "@/utils/solana";
import { useEffect, useRef, useState } from "react";

/* ─── Medal / rank styling ──────────────────────────────────────────────── */

const MEDAL: Record<
  number,
  { color: string; bg: string; border: string; glow: string; icon: string }
> = {
  1: {
    color: "#ffd700",
    bg: "rgba(255,215,0,0.12)",
    border: "rgba(255,215,0,0.4)",
    glow: "rgba(255,215,0,0.2)",
    icon: "🥇",
  },
  2: {
    color: "#c0c0c0",
    bg: "rgba(192,192,192,0.1)",
    border: "rgba(192,192,192,0.3)",
    glow: "rgba(192,192,192,0.12)",
    icon: "🥈",
  },
  3: {
    color: "#cd7f32",
    bg: "rgba(205,127,50,0.1)",
    border: "rgba(205,127,50,0.3)",
    glow: "rgba(205,127,50,0.12)",
    icon: "🥉",
  },
};

/* ─── Rank badge ────────────────────────────────────────────────────────── */

function RankBadge({ rank }: { rank: number }) {
  const m = MEDAL[rank];
  if (m) {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
        style={{
          background: m.bg,
          border: `1.5px solid ${m.border}`,
          color: m.color,
          boxShadow: `0 0 12px ${m.glow}`,
        }}
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </div>
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold flex-shrink-0"
      style={{
        background: "rgba(0,255,136,0.06)",
        border: "1.5px solid rgba(0,255,136,0.12)",
        color: "rgba(0,255,136,0.55)",
      }}
    >
      {rank}
    </div>
  );
}

/* ─── Tier pill ─────────────────────────────────────────────────────────── */

function TierPill({ tier }: { tier: string }) {
  return (
    <span
      className="hidden sm:inline-block font-body text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full flex-shrink-0"
      style={{
        background: "rgba(0,255,136,0.08)",
        color: "#00ff88",
        border: "1px solid rgba(0,255,136,0.2)",
      }}
    >
      {tier.replace(" Boost", "").replace(" boost", "")}
    </span>
  );
}

/* ─── Wallet avatar ─────────────────────────────────────────────────────── */

function WalletAvatar({ address }: { address: string }) {
  const seed = address.charCodeAt(0) % 6;
  const colors = [
    "#ab9ff2",
    "#00ff88",
    "#ffd700",
    "#ff9944",
    "#66ccff",
    "#ff66aa",
  ];
  const bg = colors[seed];
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0"
      style={{
        background: `${bg}22`,
        border: `1px solid ${bg}44`,
        color: bg,
      }}
      aria-hidden
    >
      {address.slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ─── Single leaderboard row ────────────────────────────────────────────── */

interface RowProps {
  entry: LeaderboardEntry;
  index: number;
  visible: boolean;
}

function LeaderboardRow({ entry, index, visible }: RowProps) {
  const isTop3 = entry.rank <= 3;
  const medal = MEDAL[entry.rank];
  const volumeLabel = `$${(entry.solAmount * 22_000).toLocaleString()}`;
  const ordersLabel = `${entry.rank + 1} order${entry.rank + 1 !== 1 ? "s" : ""}`;

  return (
    <button
      type="button"
      className="w-full text-left flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-b group"
      style={{
        borderColor: "rgba(255,255,255,0.04)",
        background:
          isTop3 && medal
            ? `linear-gradient(90deg, ${medal.bg} 0%, transparent 50%)`
            : "transparent",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-16px)",
        transition: `opacity 0.4s ease ${index * 45}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 45}ms, background 0.2s ease`,
      }}
      onClick={() => haptic("tap")}
      data-ocid={`leaderboard.item.${index + 1}`}
      aria-label={`Rank ${entry.rank}: ${formatAddress(entry.walletAddress)} — ${volumeLabel}`}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Wallet info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <WalletAvatar address={entry.walletAddress} />
          <code
            className="font-mono text-xs truncate"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {formatAddress(entry.walletAddress, 7, 5)}
          </code>
        </div>
        <div
          className="font-body text-[10px] pl-9"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {ordersLabel} ·{" "}
          {new Date(entry.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Tier */}
      <TierPill tier={entry.tier} />

      {/* Volume */}
      <div className="flex-shrink-0 text-right min-w-[90px]">
        <div
          className="font-mono text-sm font-bold"
          style={{ color: isTop3 && medal ? medal.color : "#00ff88" }}
        >
          {isTop3 ? volumeLabel : formatSolAmount(entry.solAmount)}
        </div>
        <div
          className="font-body text-[10px]"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          {isTop3 ? formatSolAmount(entry.solAmount) : volumeLabel}
        </div>
      </div>
    </button>
  );
}

/* ─── Row skeleton ──────────────────────────────────────────────────────── */

function RowSkeleton({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 border-b"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
      data-ocid={`leaderboard.skeleton.${index + 1}`}
    >
      <div
        className="w-9 h-9 rounded-full animate-pulse flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div className="flex-1 space-y-2">
        <div
          className="h-3 rounded animate-pulse"
          style={{
            background: "rgba(255,255,255,0.07)",
            width: `${60 + ((index * 7) % 30)}%`,
          }}
        />
        <div
          className="h-2.5 w-20 rounded animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>
      <div
        className="h-5 w-14 rounded-full animate-pulse flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div className="space-y-1.5 text-right flex-shrink-0">
        <div
          className="h-4 w-16 rounded animate-pulse ml-auto"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <div
          className="h-2.5 w-10 rounded animate-pulse ml-auto"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>
    </div>
  );
}

/* ─── Top 3 podium cards ────────────────────────────────────────────────── */

function PodiumCard({
  entry,
  visible,
}: {
  entry: LeaderboardEntry;
  visible: boolean;
}) {
  const m = MEDAL[entry.rank];
  if (!m) return null;
  const podiumOrder = [1, 0, 2]; // center is rank 1

  return (
    <div
      className="flex-1 rounded-2xl border p-4 text-center flex flex-col items-center gap-2"
      style={{
        backgroundColor: "#0f0f0f",
        borderColor: m.border,
        boxShadow: `0 0 24px ${m.glow}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${podiumOrder.indexOf(entry.rank - 1) * 120}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${podiumOrder.indexOf(entry.rank - 1) * 120}ms`,
      }}
    >
      <div className="text-2xl" role="img" aria-label={`Rank ${entry.rank}`}>
        {m.icon}
      </div>
      <div
        className="font-display text-base font-bold"
        style={{ color: m.color }}
      >
        #{entry.rank}
      </div>
      <code
        className="font-mono text-[11px] truncate max-w-full"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {formatAddress(entry.walletAddress, 5, 4)}
      </code>
      <div className="font-mono text-sm font-bold" style={{ color: m.color }}>
        {formatSolAmount(entry.solAmount)}
      </div>
    </div>
  );
}

/* ─── Leaderboard component ─────────────────────────────────────────────── */

export function Leaderboard({ walletAddress }: { walletAddress?: string }) {
  const { data: entries, isLoading } = useLeaderboard(20);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rows = entries ?? [];
  const top3 = rows.filter((e) => e.rank <= 3);
  const rest = rows.filter((e) => e.rank > 3);

  // Find current user's rank
  const myEntry = walletAddress
    ? rows.find((e) => e.walletAddress === walletAddress)
    : null;

  return (
    <section
      id="leaderboard"
      ref={sectionRef}
      className="py-16 px-4"
      style={{ backgroundColor: "#060606" }}
      data-ocid="leaderboard.section"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p
              className="font-body text-[10px] font-bold tracking-[0.3em] uppercase mb-1"
              style={{ color: "rgba(0,255,136,0.55)" }}
            >
              All Time
            </p>
            <h2 className="font-display text-xl font-bold text-white tracking-wide">
              LEADERBOARD
            </h2>
          </div>
          <span className="badge-capsule-active text-[10px] tracking-widest ml-2">
            TOP BOOSTERS
          </span>
          <span
            className="font-mono text-[10px] ml-auto"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Updates every 30s
          </span>
        </div>

        {/* ── Top 3 Podium ── */}
        {!isLoading && top3.length > 0 && (
          <div className="flex gap-3 sm:gap-4" data-ocid="leaderboard.podium">
            {/* Reorder for visual podium: 2nd, 1st, 3rd */}
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry) => (
              <PodiumCard key={entry.rank} entry={entry} visible={visible} />
            ))}
          </div>
        )}

        {/* ── Full table ── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: "#0f0f0f",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          {/* Table header */}
          <div
            className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b"
            style={{
              backgroundColor: "#111111",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <span
              className="w-9 font-body text-[10px] font-bold tracking-widest flex-shrink-0"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              #
            </span>
            <span
              className="flex-1 font-body text-[10px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              WALLET
            </span>
            <span
              className="hidden sm:block font-body text-[10px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              TIER
            </span>
            <span
              className="font-body text-[10px] font-bold tracking-widest text-right min-w-[90px]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              VOLUME
            </span>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div data-ocid="leaderboard.loading_state">
              {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((key, i) => (
                <RowSkeleton key={key} index={i} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div
              className="px-5 py-16 text-center"
              data-ocid="leaderboard.empty_state"
            >
              <div className="text-3xl mb-3" role="img" aria-label="Trophy">
                🏆
              </div>
              <p className="font-display text-sm font-bold text-white mb-1">
                No boosts yet
              </p>
              <p
                className="font-body text-xs"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                Be the first to claim the #1 spot.
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 in table */}
              {top3.map((entry, i) => (
                <LeaderboardRow
                  key={`top-${entry.rank}`}
                  entry={entry}
                  index={i}
                  visible={visible}
                />
              ))}
              {/* Rest */}
              {rest.map((entry, i) => (
                <LeaderboardRow
                  key={`rest-${entry.rank}`}
                  entry={entry}
                  index={i + 3}
                  visible={visible}
                />
              ))}
            </>
          )}
        </div>

        {/* ── Your stats card ── */}
        <div
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: "#0f0f0f",
            borderColor: myEntry
              ? "rgba(0,255,136,0.25)"
              : "rgba(255,255,255,0.06)",
          }}
          data-ocid="leaderboard.your_stats"
        >
          {myEntry ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p
                  className="font-body text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: "rgba(0,255,136,0.55)" }}
                >
                  Your Rank
                </p>
                <p className="font-display text-lg font-bold text-white">
                  #{myEntry.rank}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="font-body text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Total Boosted
                </p>
                <p
                  className="font-mono text-lg font-bold"
                  style={{ color: "#00ff88" }}
                >
                  {formatSolAmount(myEntry.solAmount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="Person">
                👻
              </span>
              <div>
                <p className="font-display text-sm font-bold text-white mb-0.5">
                  Connect wallet to see your rank
                </p>
                <p
                  className="font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Your boosts will appear here automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer note ── */}
        <p
          className="font-body text-[10px] text-center"
          style={{ color: "rgba(255,255,255,0.15)" }}
        >
          Rankings based on total SOL volume boosted · Top 20 shown
        </p>
      </div>
    </section>
  );
}
