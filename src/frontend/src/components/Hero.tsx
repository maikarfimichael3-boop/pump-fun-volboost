import { haptic } from "@/utils/haptic";

/* ─── Ticker items ──────────────────────────────────────────────────────── */

const TICKER_ITEMS = [
  "⚡ VERIFIED ON-CHAIN",
  "🟢 PUMP.FUN POWERED",
  "🚀 1,200+ TOKENS BOOSTED",
  "📈 AVERAGE 94% SUCCESS RATE",
  "🔒 FULLY NON-CUSTODIAL",
  "⚡ REAL-TIME VOLUME TRACKING",
  "💎 INSTANT ACTIVATION",
  "🌐 SOLANA NATIVE",
];

function TickerBar() {
  // Double the items for seamless loop; prefix second set with "b-" for unique keys
  const items = TICKER_ITEMS.map((t, i) => ({ text: t, key: `a-${i}` })).concat(
    TICKER_ITEMS.map((t, i) => ({ text: t, key: `b-${i}` })),
  );
  return (
    <div
      className="ticker-bar-outer overflow-hidden border-b border-t"
      style={{
        backgroundColor: "rgba(0,255,136,0.04)",
        borderColor: "rgba(0,255,136,0.15)",
        borderTopColor: "rgba(0,255,136,0.08)",
      }}
      aria-hidden
    >
      <div className="ticker-track flex items-center py-2.5">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 flex-shrink-0 mx-6"
          >
            <span
              className="font-mono text-[10px] font-bold tracking-[0.18em] whitespace-nowrap"
              style={{ color: "rgba(0,255,136,0.75)" }}
            >
              {item.text}
            </span>
            <span
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: "rgba(0,255,136,0.3)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Animated Terminal Canvas Background ──────────────────────────────── */

function TerminalGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {/* Radial glow pulse at center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(0,255,136,0.09) 0%, transparent 70%)",
        }}
      />
      {/* Floating glow orbs */}
      <div
        className="absolute top-20 left-[15%] w-48 h-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)",
          animation: "floatOrb1 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-32 right-[12%] w-64 h-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
          animation: "floatOrb2 10s ease-in-out infinite",
        }}
      />
      {/* Scan line sweep */}
      <div
        className="absolute inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,255,136,0.12), transparent)",
          animation: "scanLine 6s linear infinite",
          top: "30%",
        }}
      />
    </div>
  );
}

/* ─── Stats Cards ───────────────────────────────────────────────────────── */

const STATS = [
  { label: "Tokens Boosted", value: "2,400+", icon: "🚀" },
  { label: "Volume Generated", value: "$48M+", icon: "📈" },
  { label: "Avg Completion", value: "< 1 hr", icon: "⚡" },
  { label: "Success Rate", value: "99.2%", icon: "✅" },
];

function StatCard({
  label,
  value,
  icon,
}: { label: string; value: string; icon: string }) {
  return (
    <div
      className="card-interactive flex flex-col items-center text-center px-5 py-4 rounded-xl border"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        borderColor: "rgba(0,255,136,0.12)",
        minWidth: "130px",
      }}
    >
      <span className="text-xl mb-1.5">{icon}</span>
      <div
        className="font-display text-2xl font-bold mb-0.5"
        style={{ color: "#00ff88", textShadow: "0 0 12px rgba(0,255,136,0.3)" }}
      >
        {value}
      </div>
      <div
        className="font-body text-[11px] leading-tight"
        style={{ color: "rgba(255,255,255,0.32)" }}
      >
        {label}
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */

export function Hero() {
  const handleBoostClick = () => {
    haptic("tap");
    document.getElementById("boost")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleHowClick = () => {
    haptic("tap");
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAllToolsClick = () => {
    haptic("tap");
    document
      .getElementById("services-hub")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      style={{ minHeight: "92vh", paddingTop: "96px", paddingBottom: "0" }}
      data-ocid="hero.section"
    >
      <TerminalGrid />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center pb-16">
        {/* LIVE badge */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border mb-8 font-body text-[11px] font-bold tracking-[0.18em] uppercase step-enter"
          style={{
            backgroundColor: "rgba(0,255,136,0.07)",
            borderColor: "rgba(0,255,136,0.28)",
            color: "#00ff88",
            animationDelay: "0ms",
          }}
          data-ocid="hero.live_badge"
        >
          <span
            className="pulse-dot w-2 h-2 rounded-full inline-block flex-shrink-0"
            style={{ backgroundColor: "#00ff88" }}
          />
          Solana Volume Booster · LIVE
        </div>

        {/* Heading */}
        <h1
          className="font-display font-bold text-white leading-[1.05] tracking-tight mb-5 step-enter"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5rem)",
            animationDelay: "60ms",
          }}
        >
          Pump<span style={{ color: "#00ff88" }}>.Fun</span>
          <br />
          <span
            style={{
              color: "#00ff88",
              textShadow:
                "0 0 40px rgba(0,255,136,0.35), 0 0 80px rgba(0,255,136,0.15)",
            }}
          >
            VolBoost
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="font-body text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed step-enter"
          style={{ color: "rgba(255,255,255,0.45)", animationDelay: "120ms" }}
        >
          Boost your token's volume and rank on{" "}
          <span style={{ color: "rgba(0,255,136,0.7)" }}>Pump.fun</span>.
          Professional-grade, fast, and easy to use.
        </p>

        {/* CTA row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 w-full max-w-md step-enter"
          style={{ animationDelay: "180ms" }}
        >
          <button
            type="button"
            className="btn-cta px-8 py-4 rounded-xl font-display font-bold text-base w-full sm:w-auto flex items-center justify-center gap-2"
            data-ocid="hero.launch_boost_button"
            onClick={handleBoostClick}
          >
            <span>⚡</span> Boost My Token
          </button>
          <button
            type="button"
            className="px-8 py-4 rounded-xl font-body font-semibold text-sm border transition-smooth w-full sm:w-auto flex items-center justify-center gap-2"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.55)",
              background: "transparent",
            }}
            data-ocid="hero.how_it_works_button"
            onClick={handleHowClick}
          >
            How It Works →
          </button>
          <button
            type="button"
            className="px-8 py-4 rounded-xl font-body font-semibold text-sm border transition-smooth w-full sm:w-auto flex items-center justify-center gap-2"
            style={{
              borderColor: "rgba(0,255,136,0.18)",
              color: "rgba(0,255,136,0.65)",
              background: "rgba(0,255,136,0.04)",
            }}
            data-ocid="hero.all_tools_button"
            onClick={handleAllToolsClick}
          >
            🛠 All Tools
          </button>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap justify-center gap-3 w-full step-enter"
          style={{ animationDelay: "240ms" }}
          data-ocid="hero.stats_section"
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Powered by Solana badge */}
        <div
          className="mt-8 flex items-center gap-2 step-enter"
          style={{ animationDelay: "300ms" }}
          data-ocid="hero.powered_by_badge"
        >
          <span
            className="font-body text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Powered by
          </span>
          <span
            className="font-display font-bold text-sm"
            style={{ color: "#9945FF" }}
          >
            ◎ SOLANA
          </span>
        </div>
      </div>

      {/* Ticker bar — at the bottom of hero */}
      <div className="relative z-10 w-full">
        <TickerBar />
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 step-enter"
        style={{ animationDelay: "400ms" }}
        aria-hidden
      >
        <span
          className="font-body text-[10px] tracking-widest"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          SCROLL
        </span>
        <div
          className="w-px h-8"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,255,136,0.4), transparent)",
            animation: "pulseHeight 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.08); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(16px) scale(0.95); }
        }
        @keyframes scanLine {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes pulseHeight {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
