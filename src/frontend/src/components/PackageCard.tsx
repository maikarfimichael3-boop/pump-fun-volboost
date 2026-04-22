import type { VolumePackage } from "@/types";

/* ─── Feature tag pills ───────────────────────────────────────────────────── */

const FEATURE_TAGS: Record<string, string[]> = {
  starter: ["Quick", "Easy Start"],
  basic: ["Visible", "Daily Vol"],
  standard: ["Credible", "Organic"],
  pro: ["Trending", "Fast", "Popular"],
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
  pro: "~24 hours",
  elite: "~36 hours",
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
      className={`relative rounded-xl p-4 border text-left card-interactive w-full ${selected ? "card-green-glow" : ""}`}
      style={{
        backgroundColor: selected ? "rgba(0,255,136,0.07)" : "#111111",
        borderColor: selected
          ? "rgba(0,255,136,0.55)"
          : isPopular
            ? "rgba(0,255,136,0.25)"
            : "rgba(255,255,255,0.08)",
        transform: selected ? "scale(1.02)" : undefined,
      }}
      data-ocid={`wizard.package.${index}`}
      aria-pressed={selected}
      aria-label={`${pkg.name} — ${pkg.targetVolumeFmt} volume for ${pkg.solCostFmt}`}
    >
      {/* POPULAR badge */}
      {isPopular && !selected && (
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold tracking-widest px-3 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: "#00ff88", color: "#0d0d0d" }}
        >
          MOST POPULAR
        </span>
      )}

      {/* Tier badge + selected indicator */}
      <div className="flex items-start justify-between mb-2 mt-1">
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

        {selected && (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#00ff88" }}
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
        )}

        {pkg.badge && !isPopular && (
          <span
            className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(0,255,136,0.15)",
              color: "#00ff88",
            }}
          >
            {pkg.badge}
          </span>
        )}
      </div>

      {/* Volume target */}
      <div
        className="font-display text-xl font-bold mb-0.5"
        style={{ color: selected ? "#ffffff" : "rgba(255,255,255,0.9)" }}
      >
        {pkg.targetVolumeFmt}
      </div>

      {/* SOL cost */}
      <div
        className="font-mono text-sm font-bold mb-0.5"
        style={{
          color: "#00ff88",
          textShadow: selected ? "0 0 8px rgba(0,255,136,0.5)" : "none",
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
