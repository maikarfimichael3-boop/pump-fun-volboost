import { haptic } from "@/utils/haptic";
import { useEffect, useRef, useState } from "react";

/* ─── Service definitions ───────────────────────────────────────────────── */

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  live: boolean;
  comingSoonLabel?: string;
}

const SERVICES: Service[] = [
  {
    id: "volume-bot",
    name: "Volume Bot",
    description:
      "Boost your token's trading volume and climb the Pump.fun trending charts",
    icon: "📈",
    live: true,
  },
  {
    id: "token-launchpad",
    name: "Token Launchpad",
    description: "Launch your token on Pump.fun or Bonk with one click",
    icon: "🚀",
    live: false,
    comingSoonLabel: "Q3 2025",
  },
  {
    id: "token-creator",
    name: "Token Creator",
    description: "Create a new SPL token with custom metadata in seconds",
    icon: "🪙",
    live: false,
  },
  {
    id: "airdrop-tokens",
    name: "Airdrop Tokens",
    description: "Distribute tokens to hundreds of wallets instantly",
    icon: "🎁",
    live: false,
  },
  {
    id: "create-liquidity-pool",
    name: "Create Liquidity Pool",
    description: "Add liquidity to Raydium or Orca with guided steps",
    icon: "💧",
    live: false,
  },
  {
    id: "allinone-bundler",
    name: "AllinOne Pro Bundler",
    description: "Bundle multiple transactions for maximum efficiency",
    icon: "📦",
    live: false,
    comingSoonLabel: "HOT",
  },
  {
    id: "pumpfun-zone",
    name: "Pump.fun Zone",
    description: "Full suite of Pump.fun tools — trend, boost, snipe, and more",
    icon: "🔥",
    live: false,
    comingSoonLabel: "Q3 2025",
  },
  {
    id: "bonk-zone",
    name: "Bonk Zone",
    description: "Tools optimized for the Bonk ecosystem and launchpad",
    icon: "🐕",
    live: false,
  },
  {
    id: "pump-swap-zone",
    name: "Pump Swap Zone",
    description: "Automate swaps on Pump.fun's native DEX",
    icon: "🔄",
    live: false,
  },
  {
    id: "moonit-zone",
    name: "Moonit Zone",
    description: "Launch and boost on Moonit's launchpad",
    icon: "🌙",
    live: false,
  },
  {
    id: "launchlab-zone",
    name: "LaunchLab Zone",
    description: "Tools for Raydium's LaunchLab launchpad",
    icon: "⚗️",
    live: false,
  },
  {
    id: "bags-zone",
    name: "Bags Zone",
    description: "Portfolio tracking and bag management tools",
    icon: "💼",
    live: false,
  },
  {
    id: "jupiter-studio",
    name: "Jupiter Studio Zone",
    description: "Advanced Jupiter swap routing and DCA tools",
    icon: "🪐",
    live: false,
  },
  {
    id: "token-vesting",
    name: "Token Vesting",
    description: "Set up token vesting schedules for team and investors",
    icon: "⏳",
    live: false,
  },
  {
    id: "token-staking",
    name: "Create Token Staking",
    description: "Deploy a staking pool for your token holders",
    icon: "🏦",
    live: false,
  },
  {
    id: "revoke-authorities",
    name: "Revoke Authorities",
    description: "Revoke mint/freeze authority to signal trust",
    icon: "🛡️",
    live: false,
  },
  {
    id: "manage-liquidity",
    name: "Manage Liquidity",
    description: "Add, remove, and rebalance your liquidity positions",
    icon: "🌊",
    live: false,
  },
  {
    id: "token-manager",
    name: "Token Manager",
    description: "Update token metadata, URI, and social links",
    icon: "⚙️",
    live: false,
  },
  {
    id: "snapshot-holders",
    name: "Snapshot Holders",
    description: "Take a snapshot of all current token holders",
    icon: "📸",
    live: false,
  },
  {
    id: "token-incinerator",
    name: "Token Incinerator",
    description: "Burn tokens permanently to reduce supply",
    icon: "🔥",
    live: false,
  },
  {
    id: "private-transfers",
    name: "Solana Private Transfers",
    description:
      "Send SOL and tokens privately with minimal on-chain footprint",
    icon: "🕵️",
    live: false,
  },
  {
    id: "holder-verifier",
    name: "Holder Verifier",
    description: "Verify token holder status for gated access",
    icon: "✅",
    live: false,
  },
];

/* ─── Intersection observer hook ───────────────────────────────────────── */

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ─── Service Card ──────────────────────────────────────────────────────── */

function ServiceCard({
  service,
  index,
  visible,
}: { service: Service; index: number; visible: boolean }) {
  const handleClick = () => {
    if (!service.live) return;
    haptic("tap");
    document.getElementById("boost")?.scrollIntoView({ behavior: "smooth" });
  };

  const isHotLabel = service.comingSoonLabel === "HOT";

  return (
    <div
      role={service.live ? "button" : undefined}
      tabIndex={service.live ? 0 : undefined}
      data-ocid={
        service.live
          ? `services.${service.id}_card`
          : `services.${service.id}_coming_soon`
      }
      onClick={handleClick}
      onKeyDown={(e) => {
        if (service.live && (e.key === "Enter" || e.key === " ")) handleClick();
      }}
      className="relative flex flex-col gap-3 p-5 rounded-xl border transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: "rgba(255,255,255,0.025)",
        borderColor: service.live
          ? "rgba(0,255,136,0.22)"
          : "rgba(255,255,255,0.06)",
        cursor: service.live ? "pointer" : "default",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? (service.live ? 1 : 0.62) : 0,
        transition: `opacity 0.45s ease ${index * 35}ms, transform 0.45s cubic-bezier(0.34,1.56,0.64,1) ${index * 35}ms, border-color 0.25s ease, box-shadow 0.25s ease`,
      }}
      onMouseEnter={(e) => {
        if (!service.live) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "rgba(0,255,136,0.5)";
        el.style.boxShadow =
          "0 0 24px rgba(0,255,136,0.18), 0 8px 24px rgba(0,0,0,0.35)";
        el.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        if (!service.live) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "rgba(0,255,136,0.22)";
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Badge top-right */}
      <div className="absolute top-3 right-3">
        {service.live ? (
          <span
            className="badge-capsule-active"
            style={{ fontSize: "9px", padding: "2px 8px" }}
          >
            LIVE
          </span>
        ) : service.comingSoonLabel ? (
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider"
            style={{
              backgroundColor: isHotLabel
                ? "rgba(255,100,50,0.15)"
                : "rgba(0,255,136,0.06)",
              color: isHotLabel ? "#ff6432" : "rgba(0,255,136,0.5)",
              border: `1px solid ${isHotLabel ? "rgba(255,100,50,0.3)" : "rgba(0,255,136,0.2)"}`,
              animation: "badgePulse 2s ease-in-out infinite",
              boxShadow: isHotLabel
                ? "0 0 8px rgba(255,100,50,0.2)"
                : "0 0 8px rgba(0,255,136,0.12)",
            }}
          >
            {service.comingSoonLabel}
          </span>
        ) : (
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider"
            style={{
              backgroundColor: "rgba(0,255,136,0.04)",
              color: "rgba(0,255,136,0.3)",
              border: "1px solid rgba(0,255,136,0.12)",
            }}
          >
            SOON
          </span>
        )}
      </div>

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{
          backgroundColor: service.live
            ? "rgba(0,255,136,0.1)"
            : "rgba(255,255,255,0.04)",
          border: service.live
            ? "1px solid rgba(0,255,136,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
        }}
        aria-hidden
      >
        {service.icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1 pr-6">
        <div
          className="font-display font-bold text-sm leading-tight"
          style={{ color: service.live ? "#ffffff" : "rgba(255,255,255,0.55)" }}
        >
          {service.name}
        </div>
        <div
          className="font-body text-xs leading-snug"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          {service.description}
        </div>
      </div>
    </div>
  );
}

/* ─── ServicesHub ───────────────────────────────────────────────────────── */

export function ServicesHub() {
  const { ref, inView } = useInView(0.05);

  return (
    <section
      id="services-hub"
      className="relative py-20 px-4"
      style={{ backgroundColor: "rgba(0,255,136,0.012)" }}
      data-ocid="services_hub.section"
    >
      {/* Divider line */}
      <div
        className="max-w-7xl mx-auto mb-14"
        style={{ borderTop: "1px solid rgba(0,255,136,0.12)" }}
      >
        <div
          className="h-px w-24 mt-0"
          style={{
            background:
              "linear-gradient(90deg, #00ff88 0%, rgba(0,255,136,0.0) 100%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Section header */}
        <div className="mb-12 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5 font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{
              backgroundColor: "rgba(0,255,136,0.06)",
              borderColor: "rgba(0,255,136,0.2)",
              color: "#00ff88",
            }}
          >
            <span
              className="pulse-dot w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#00ff88" }}
            />
            Full Toolkit
          </div>
          <h2
            className="font-display font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            Solana{" "}
            <span
              style={{
                color: "#00ff88",
                textShadow: "0 0 28px rgba(0,255,136,0.3)",
              }}
            >
              Toolkit
            </span>
          </h2>
          <p
            className="font-body text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Everything you need to launch, grow, and manage your Solana token —
            all in one place.
          </p>
        </div>

        {/* Services grid */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
          }}
          data-ocid="services_hub.grid"
        >
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              visible={inView}
            />
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center">
          <p
            className="font-mono text-[11px] tracking-widest"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            MORE TOOLS LAUNCHING SOON · BUILT FOR SOLANA DEGENS
          </p>
        </div>
      </div>
    </section>
  );
}
