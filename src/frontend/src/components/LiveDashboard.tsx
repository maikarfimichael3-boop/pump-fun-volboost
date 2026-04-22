import { useActiveBoosts } from "@/hooks/useBoostData";
import type { LeaderboardEntry } from "@/types";
import { haptic } from "@/utils/haptic";
import { formatAddress, formatSolAmount } from "@/utils/solana";
import { useEffect, useRef, useState } from "react";

/* ─── Tier → target volume map ──────────────────────────────────────────── */

const TIER_TARGETS: Record<string, number> = {
  Starter: 1_000,
  Basic: 5_000,
  Growth: 10_000,
  Pro: 25_000,
  Advanced: 50_000,
  Elite: 100_000,
  Ultra: 500_000,
  Premium: 2_000_000,
};

/* ─── Animated counter ──────────────────────────────────────────────────── */

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = ref.current;
    ref.current = value;
    const start = performance.now();
    const dur = 1200;

    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - (1 - t) ** 3;
      setDisplayed(from + (value - from) * eased);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  const fmt =
    decimals > 0
      ? displayed.toFixed(decimals)
      : Math.round(displayed).toLocaleString();
  return (
    <span>
      {prefix}
      {fmt}
      {suffix}
    </span>
  );
}

/* ─── Status badge ──────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "rgba(255,200,0,0.12)", color: "#ffc800", label: "PENDING" },
    running: { bg: "rgba(0,255,136,0.12)", color: "#00ff88", label: "ACTIVE" },
    completed: {
      bg: "rgba(120,120,255,0.12)",
      color: "#a0a0ff",
      label: "COMPLETE",
    },
    failed: { bg: "rgba(255,80,80,0.12)", color: "#ff5555", label: "FAILED" },
  };
  const cfg = map[status] ?? map.pending;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[10px] font-bold tracking-wider flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0${status === "running" ? " pulse-dot" : ""}`}
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

/* ─── Progress bar ──────────────────────────────────────────────────────── */

function ProgressBar({
  pct,
  active,
}: {
  pct: number;
  active: boolean;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: "#1a1a1a" }}
      aria-label={`Volume progress: ${pct}%`}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: active
            ? "linear-gradient(90deg, #00ff88 0%, #00cc6a 100%)"
            : "rgba(0,255,136,0.4)",
          boxShadow: active ? "0 0 10px rgba(0,255,136,0.5)" : "none",
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

/* ─── Derive progress from timestamp + tier duration ───────────────────── */

function computeProgress(entry: LeaderboardEntry): {
  pct: number;
  volumeAchieved: number;
  targetVolume: number;
  hoursRemaining: string;
} {
  const DURATIONS: Record<string, number> = {
    Starter: 2,
    Basic: 6,
    Growth: 12,
    Pro: 24,
    Advanced: 36,
    Elite: 48,
    Ultra: 72,
    Premium: 96,
  };

  const tierKey = entry.tier.replace(" Boost", "").replace(" boost", "");
  const durationHrs = DURATIONS[tierKey] ?? 12;
  const durationMs = durationHrs * 3_600_000;
  const elapsed = Date.now() - entry.timestamp;
  const pct = Math.min(Math.round((elapsed / durationMs) * 100), 99);
  const targetVolume = TIER_TARGETS[tierKey] ?? 10_000;
  const volumeAchieved = Math.round((pct / 100) * targetVolume);
  const msLeft = Math.max(0, durationMs - elapsed);
  const hrsLeft = Math.floor(msLeft / 3_600_000);
  const minsLeft = Math.floor((msLeft % 3_600_000) / 60_000);
  const hoursRemaining =
    hrsLeft > 0
      ? `~${hrsLeft}h ${minsLeft}m remaining`
      : `~${minsLeft}m remaining`;

  return { pct, volumeAchieved, targetVolume, hoursRemaining };
}

/* ─── Boost card ────────────────────────────────────────────────────────── */

function BoostCard({
  entry,
  index,
}: {
  entry: LeaderboardEntry;
  index: number;
}) {
  const isActive = entry.status === "running";
  const { pct, volumeAchieved, targetVolume, hoursRemaining } =
    computeProgress(entry);

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300${isActive ? " card-interactive" : ""}`}
      style={{
        backgroundColor: "#0f0f0f",
        borderColor: isActive
          ? "rgba(0,255,136,0.22)"
          : "rgba(255,255,255,0.07)",
        boxShadow: isActive ? "0 0 24px rgba(0,255,136,0.06)" : "none",
      }}
      data-ocid={`dashboard.boost_card.${index + 1}`}
    >
      {/* Top row: CA + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <code
            className="font-mono text-xs block truncate mb-2"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {formatAddress(entry.ca, 10, 6)}
          </code>
          <span
            className="inline-block font-body text-[10px] px-2.5 py-0.5 rounded-full font-bold"
            style={{
              background: "rgba(0,255,136,0.1)",
              color: "#00ff88",
              border: "1px solid rgba(0,255,136,0.25)",
            }}
          >
            {entry.tier}
          </span>
        </div>
        <div className="flex-shrink-0 text-right space-y-1">
          <StatusBadge status={entry.status} />
          <div
            className="font-mono text-sm font-bold"
            style={{ color: "#00ff88" }}
          >
            {formatSolAmount(entry.solAmount)}
          </div>
        </div>
      </div>

      {/* Volume progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span
            className="font-mono text-[11px]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            $
            <AnimatedNumber value={volumeAchieved} /> / $
            {targetVolume.toLocaleString()}
          </span>
          <span
            className="font-mono text-[11px] font-bold"
            style={{ color: "#00ff88" }}
          >
            {pct}%
          </span>
        </div>
        <ProgressBar pct={pct} active={isActive} />
      </div>

      {/* Time remaining */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[10px]"
          style={{ color: "rgba(255,255,255,0.25)" }}
          aria-hidden
        >
          ⏱
        </span>
        <span
          className="font-body text-[10px]"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {entry.status === "completed" ? "Boost complete" : hoursRemaining}
        </span>
      </div>
    </div>
  );
}

/* ─── Skeleton card ─────────────────────────────────────────────────────── */

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{
        backgroundColor: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.05)",
      }}
      data-ocid={`dashboard.skeleton.${index + 1}`}
    >
      <div className="flex justify-between">
        <div className="space-y-2">
          <div
            className="h-3 w-40 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <div
            className="h-4 w-24 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        </div>
        <div className="space-y-2 text-right">
          <div
            className="h-5 w-18 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <div
            className="h-4 w-14 rounded animate-pulse ml-auto"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div
            className="h-2.5 w-28 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <div
            className="h-2.5 w-8 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        </div>
        <div
          className="h-2 w-full rounded-full animate-pulse"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      </div>
    </div>
  );
}

/* ─── Stats summary row ─────────────────────────────────────────────────── */

function StatsRow({ boosts }: { boosts: LeaderboardEntry[] }) {
  const active = boosts.filter((b) => b.status === "running").length;
  const totalSol = boosts.reduce((s, b) => s + b.solAmount, 0);
  const avgPct = boosts.length
    ? Math.round(
        boosts.reduce((s, b) => s + computeProgress(b).pct, 0) / boosts.length,
      )
    : 0;

  const stats = [
    { label: "Active Boosts", value: active, suffix: "", prefix: "" },
    { label: "Total SOL Paid", value: totalSol, suffix: " SOL", prefix: "" },
    { label: "Avg Completion", value: avgPct, suffix: "%", prefix: "" },
  ];

  return (
    <div
      className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border"
      style={{
        borderColor: "rgba(0,255,136,0.1)",
        background: "rgba(0,255,136,0.06)",
      }}
      data-ocid="dashboard.stats_row"
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="flex flex-col items-center justify-center gap-1 py-5 px-3"
          style={{ background: "#0a0a0a" }}
          data-ocid={`dashboard.stat.${i + 1}`}
        >
          <span
            className="font-display text-2xl font-bold"
            style={{ color: "#00ff88" }}
          >
            <AnimatedNumber
              value={s.value}
              suffix={s.suffix}
              prefix={s.prefix}
            />
          </span>
          <span
            className="font-body text-[10px] tracking-wider uppercase text-center"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── LiveDashboard component ───────────────────────────────────────────── */

export function LiveDashboard({ walletAddress }: { walletAddress?: string }) {
  const { data: boosts, isLoading, refetch, isFetching } = useActiveBoosts();
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      void refetch();
      setLastRefresh(Date.now());
    }, 30_000);
    return () => clearInterval(interval);
  }, [refetch]);

  const allBoosts = boosts ?? [];
  const myBoosts = walletAddress
    ? allBoosts.filter((b) => b.walletAddress === walletAddress)
    : allBoosts;

  const timeSince = Math.floor((Date.now() - lastRefresh) / 1000);

  return (
    <section
      id="dashboard"
      className="py-16 px-4"
      style={{ backgroundColor: "#080808" }}
      data-ocid="dashboard.section"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="pulse-dot w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#00ff88" }}
            aria-hidden
          />
          <h2 className="font-display text-xl font-bold text-white tracking-wide">
            LIVE DASHBOARD
          </h2>
          <span
            className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(0,255,136,0.12)",
              color: "#00ff88",
              border: "1px solid rgba(0,255,136,0.25)",
            }}
          >
            LIVE
          </span>
          <span
            className="font-mono text-[10px] ml-auto"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Refreshed {timeSince}s ago
          </span>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-[11px] font-bold transition-spring"
            style={{
              background: "rgba(0,255,136,0.08)",
              color: "#00ff88",
              border: "1px solid rgba(0,255,136,0.2)",
            }}
            onClick={() => {
              haptic("tap");
              void refetch();
              setLastRefresh(Date.now());
            }}
            aria-label="Refresh dashboard"
            data-ocid="dashboard.refresh_button"
          >
            <span
              className={isFetching ? "spinner inline-block" : "inline-block"}
              style={{ fontSize: 12 }}
              aria-hidden
            >
              ↻
            </span>
            REFRESH
          </button>
        </div>

        {/* ── Boost cards ── */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="dashboard.loading_state"
          >
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : myBoosts.length === 0 ? (
          <div
            className="rounded-2xl border py-14 px-6 text-center"
            style={{
              backgroundColor: "#0f0f0f",
              borderColor: "rgba(255,255,255,0.06)",
            }}
            data-ocid="dashboard.empty_state"
          >
            <div className="text-4xl mb-4" role="img" aria-label="Rocket">
              🚀
            </div>
            <p className="font-display text-base font-bold text-white mb-2">
              No Active Boosts
            </p>
            <p
              className="font-body text-xs max-w-xs mx-auto"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Start your first boost above to see live progress here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBoosts.map((entry, i) => (
              <BoostCard
                key={`${entry.ca}-${entry.timestamp}`}
                entry={entry}
                index={i}
              />
            ))}
          </div>
        )}

        {/* ── Stats ── */}
        <StatsRow boosts={allBoosts} />
      </div>
    </section>
  );
}
