import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Leaderboard } from "@/components/Leaderboard";
import { LiveDashboard } from "@/components/LiveDashboard";
import { ServicesHub } from "@/components/ServicesHub";
import { Wizard } from "@/components/Wizard";
import { Toaster } from "@/components/ui/sonner";
import { haptic } from "@/utils/haptic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/* ─── React Query ───────────────────────────────────────────────────────── */

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type AppView = "home" | "dashboard" | "leaderboard";

/* ─── TIERS constant (matches backend) ──────────────────────────────────── */

export const TIERS = [
  {
    id: "starter",
    name: "Starter",
    targetVolume: 1_000,
    solCost: 0.5,
    durationHours: 2,
  },
  {
    id: "basic",
    name: "Basic",
    targetVolume: 5_000,
    solCost: 1.5,
    durationHours: 6,
  },
  {
    id: "growth",
    name: "Growth",
    targetVolume: 10_000,
    solCost: 2.5,
    durationHours: 12,
  },
  {
    id: "pro",
    name: "Pro",
    targetVolume: 25_000,
    solCost: 5,
    durationHours: 24,
  },
  {
    id: "advanced",
    name: "Advanced",
    targetVolume: 50_000,
    solCost: 8,
    durationHours: 36,
  },
  {
    id: "elite",
    name: "Elite",
    targetVolume: 100_000,
    solCost: 15,
    durationHours: 48,
  },
  {
    id: "ultra",
    name: "Ultra",
    targetVolume: 500_000,
    solCost: 50,
    durationHours: 72,
  },
  {
    id: "premium",
    name: "Premium",
    targetVolume: 2_000_000,
    solCost: 150,
    durationHours: 96,
  },
] as const;

/* ─── Terminal background ────────────────────────────────────────────────── */

function TerminalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(0,255,136,0.05) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-64"
        style={{
          background:
            "linear-gradient(to top, rgba(13,13,13,0.8), transparent)",
        }}
      />
    </div>
  );
}

/* ─── PF Logo ────────────────────────────────────────────────────────────── */

function PFLogo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2.5 transition-spring"
      data-ocid="nav.logo_link"
      onClick={onClick}
      aria-label="Go to home"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-base flex-shrink-0"
        style={{ backgroundColor: "#00ff88", color: "#0d0d0d" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          role="img"
          aria-labelledby="logo-title"
        >
          <title id="logo-title">Pump.Fun logo</title>
          <path
            d="M9 2L3 6v6l6 4 6-4V6L9 2z"
            fill="#0d0d0d"
            fillOpacity="0.85"
          />
          <circle cx="9" cy="9" r="2.5" fill="#0d0d0d" />
        </svg>
      </div>
      <span
        className="font-display font-bold text-lg"
        style={{ color: "#ffffff" }}
      >
        Pump<span style={{ color: "#00ff88" }}>.Fun</span>{" "}
        <span className="badge-capsule text-[11px] ml-1 align-middle">
          VolBoost
        </span>
      </span>
    </button>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────────── */

interface HeaderProps {
  view: AppView;
  onViewChange: (v: AppView) => void;
}

function Header({ view, onViewChange }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navItems: { label: string; id: AppView; ocid: string }[] = [
    { label: "HOME", id: "home", ocid: "nav.home_link" },
    { label: "DASHBOARD", id: "dashboard", ocid: "nav.dashboard_link" },
    { label: "LEADERBOARD", id: "leaderboard", ocid: "nav.leaderboard_link" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(8,8,8,0.97)" : "rgba(8,8,8,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid rgba(255,255,255,0.04)",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.6)" : "none",
      }}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        <PFLogo
          onClick={() => {
            haptic("tap");
            onViewChange("home");
          }}
        />

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className="relative px-4 py-2 rounded-lg font-body text-xs font-bold tracking-wider transition-spring"
                style={{
                  color: isActive ? "#00ff88" : "rgba(255,255,255,0.45)",
                  backgroundColor: isActive
                    ? "rgba(0,255,136,0.08)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(0,255,136,0.3)"
                    : "1px solid transparent",
                  cursor: "pointer",
                }}
                data-ocid={item.ocid}
                onClick={() => {
                  haptic("tap");
                  onViewChange(item.id);
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right side: status badge + boost CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border font-mono text-xs"
            style={{
              backgroundColor: "rgba(0,255,136,0.06)",
              borderColor: "rgba(0,255,136,0.25)",
              color: "#00ff88",
            }}
          >
            <span
              className="pulse-dot w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: "#00ff88" }}
            />
            LIVE
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-xs font-bold cursor-pointer transition-spring hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
              color: "#0d0d0d",
            }}
            data-ocid="nav.boost_cta_button"
            onClick={() => {
              haptic("tap");
              onViewChange("home");
              setTimeout(
                () =>
                  document
                    .getElementById("boost")
                    ?.scrollIntoView({ behavior: "smooth" }),
                100,
              );
            }}
          >
            <span>⚡</span>
            <span>Boost Now</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg transition-spring"
          style={{ color: "rgba(255,255,255,0.7)" }}
          onClick={() => {
            haptic("tap");
            setMenuOpen(!menuOpen);
          }}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          data-ocid="nav.toggle"
        >
          <span className="text-xl font-bold">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden border-t px-6 py-5 flex flex-col gap-3"
          style={{
            backgroundColor: "rgba(8,8,8,0.99)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className="font-body text-xs font-bold tracking-wider py-2 px-3 rounded-lg transition-spring text-left"
                style={{
                  color: isActive ? "#00ff88" : "rgba(255,255,255,0.5)",
                  backgroundColor: isActive
                    ? "rgba(0,255,136,0.08)"
                    : "transparent",
                }}
                data-ocid={item.ocid}
                onClick={() => {
                  haptic("tap");
                  onViewChange(item.id);
                  setMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm font-bold justify-center"
            style={{
              background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
              color: "#0d0d0d",
            }}
            onClick={() => {
              haptic("tap");
              onViewChange("home");
              setMenuOpen(false);
              setTimeout(
                () =>
                  document
                    .getElementById("boost")
                    ?.scrollIntoView({ behavior: "smooth" }),
                150,
              );
            }}
            data-ocid="nav.mobile_boost_button"
          >
            <span>⚡</span> Boost Now
          </button>
        </div>
      )}
    </header>
  );
}

/* ─── View: Dashboard ────────────────────────────────────────────────────── */

function DashboardView() {
  return (
    <main className="relative z-10 pt-16">
      <div className="py-10 px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8 pt-6">
          <span
            className="pulse-dot w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#00ff88" }}
          />
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            LIVE BOOST DASHBOARD
          </h1>
          <span className="badge-capsule text-[10px]">REAL-TIME</span>
        </div>
      </div>
      <LiveDashboard />
      <Footer />
    </main>
  );
}

/* ─── View: Leaderboard ──────────────────────────────────────────────────── */

function LeaderboardView() {
  return (
    <main className="relative z-10 pt-16">
      <div className="py-10 px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2 pt-6">
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            TOP VOLUME BOOSTS
          </h1>
          <span className="badge-capsule-active text-[10px]">ALL TIME</span>
        </div>
      </div>
      <Leaderboard />
      <Footer />
    </main>
  );
}

/* ─── View: Home (wizard + full page) ───────────────────────────────────── */

function HomeView() {
  return (
    <main className="relative z-10 pt-16">
      <Hero />
      <Wizard />
      <LiveDashboard />
      <Leaderboard />
      <HowItWorks />
      <ServicesHub />
      <Footer />
    </main>
  );
}

/* ─── App Content ────────────────────────────────────────────────────────── */

function AppContent() {
  const [view, setView] = useState<AppView>("home");

  const handleViewChange = (v: AppView) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderView = () => {
    if (view === "dashboard") return <DashboardView />;
    if (view === "leaderboard") return <LeaderboardView />;
    return <HomeView />;
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <TerminalBackground />
      <Header view={view} onViewChange={handleViewChange} />
      <Toaster position="top-right" theme="dark" />
      {renderView()}
    </div>
  );
}

/* ─── App root ───────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
