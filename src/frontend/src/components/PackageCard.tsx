import type { VolumePackage } from "@/types";

/* ─── Feature tag pills ───────────────────────────────────────────────────── */

const FEATURE_TAGS: Record<string, string[]> = {
  starter: ["Quick", "Easy Start"],
  basic: ["Visible", "Daily Vol"],
  standard: ["Credible", "Organic"],
  growth: ["Credible", "Organic"],
  pro: ["Trending", "Fast", "Popular"],
  advanced: ["Top 5", "Viral"],
  elite: ["Top 5", "Viral", "60min"],
  mega: ["#1 Chart", "Dominate"],
  ultra: ["Whale", "Institutional"],
  premium: ["Max Impact", "Viral", "Surge"],
};

/* ─── Duration label ─────────────────────────────────────────────────────── */

const DURATION_LABELS: Record<string, string> = {
  starter: "~2 hours",
  basic: "~6 hours",
  standard: "~12 hours",
  growth: "~12 hours",
  pro: "~24 hours",
  advanced: "~36 hours",
  elite: "~48 hours",
  mega: "~48 hours",
  ultra: "~72 hours",
  premium: "~96 hours",
};

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface PackageCardProps {
  pkg: VolumePackage;
  selected: boolean;
  onSelect: () => void;
  index: number;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function PackageCard({
  pkg,
  selected,
  onSelect,
  index,
}: PackageCardProps) {
  const tags = FEATURE_TAGS[pkg.id] ?? [];
  const duration = DURATION_LABELS[pkg.id] ?? "~24 hours";
  const isPopular = pkg.popular === true;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative rounded-xl p-4 border text-left w-full overflow-hidden${selected ? " card-green-glow" : " card-pkg-hover"}`}
      style={{
        backgroundColor: selected ? "rgba(0,255,136,0.07)" : "#111111",
        borderColor: selected
          ? "rgba(0,255,136,0.55)"
          : isPopular
            ? "rgba(0,255,136,0.25)"
            : "rgba(255,255,255,0.08)",
        transform: selected ? "scale(1.02)" : undefined,
        transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}
      data-ocid={`wizard.package.${index}`}
      aria-pressed={selected}
      aria-label={`${pkg.name} — ${pkg.targetVolumeFmt} volume for ${pkg.solCostFmt}`}
    >
      {/* Shimmer scan-line on hover */}
      <div
        className="pkg-shimmer absolute inset-0 pointer-events-none"
        aria-hidden
      />

      {/* POPULAR badge */}
      {isPopular && (
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold tracking-widest px-3 py-0.5 rounded-full whitespace-nowrap"
          style={{
            backgroundColor: "#00ff88",
            color: "#0d0d0d",
            boxShadow: selected
              ? "0 0 12px rgba(0,255,136,0.7)"
              : "0 0 8px rgba(0,255,136,0.5)",
            animation: "badgePulse 1.8s ease-in-out infinite",
          }}
        >
          MOST POPULAR
        </span>
      )}

      {/* Tier badge + selected indicator */}
      <div className="flex items-start justify-between mb-3 mt-1">
        <span
          className="inline-block px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-wider"
          style={{
            backgroundColor: selected
              ? "rgba(0,255,136,0.25)"
              : "rgba(255,255,255,0.06)",
            color: selected ? "#00ff88" : "rgba(255,255,255,0.45)",
            border: selected
              ? "1px solid rgba(0,255,136,0.4)"
              : "1px solid transparent",
          }}
        >
          {pkg.name.split(" ")[0].toUpperCase()}
        </span>

        {selected ? (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#00ff88",
              boxShadow: "0 0 8px rgba(0,255,136,0.6)",
            }}
            aria-label="Selected"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              role="img"
            >
              <title>Selected</title>
              <path
                d="M1.5 5.5L4 8L8.5 2.5"
                stroke="#0d0d0d"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : pkg.badge ? (
          <span
            className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(0,255,136,0.15)",
              color: "#00ff88",
              animation: "badgePulse 2.4s ease-in-out infinite",
            }}
          >
            {pkg.badge}
          </span>
        ) : null}
      </div>

      {/* Volume target */}
      <div
        className="font-display text-xl font-bold mb-1"
        style={{ color: selected ? "#ffffff" : "rgba(255,255,255,0.9)" }}
      >
        {pkg.targetVolumeFmt}
      </div>

      {/* SOL cost — large and prominent */}
      <div
        className="font-mono font-bold mb-1"
        style={{
          fontSize: "1.15rem",
          color: "#00ff88",
          textShadow: selected
            ? "0 0 16px rgba(0,255,136,0.8), 0 0 32px rgba(0,255,136,0.4)"
            : "0 0 8px rgba(0,255,136,0.4)",
          letterSpacing: "0.02em",
        }}
      >
        {pkg.solCostFmt}
      </div>

      {/* USD equivalent */}
      <div
        className="font-body text-[11px] mb-2"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        {pkg.usdCost}
      </div>

      {/* Duration */}
      <div
        className="font-mono text-[10px] mb-2"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        ⏱ {duration}
      </div>

      {/* Feature tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: selected
                  ? "rgba(0,255,136,0.12)"
                  : "rgba(255,255,255,0.04)",
                color: selected
                  ? "rgba(0,255,136,0.8)"
                  : "rgba(255,255,255,0.25)",
                border: selected
                  ? "1px solid rgba(0,255,136,0.2)"
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
