import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CA = "rGFb4yejWEuMKT2FPjgYpV8vwvvsE8taPcd9k6xpump";
const PUMP_LINK =
  "https://pump.fun/coin/rGFb4yejWEuMKT2FPjgYpV8vwvvsE8taPcd9k6xpump";
const TG_LINK = "https://t.me/RUG_KILLERS_RnD";
const X_LINK = "https://x.com/pumpai100?s=21";
const BOOT_IMG =
  "/assets/uploads/img_0085-019d1df5-dfe8-7468-857a-c81ce1f66891-1.jpeg";

/* ─── Utilities ─────────────────────────────────────────────────────────── */

function useCopyCA() {
  return (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        toast.success("Address copied!", {
          description: `${text.slice(0, 16)}…`,
        }),
      )
      .catch(() => toast.error("Copy failed — use Ctrl+C"));
  };
}

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            setTimeout(() => el.classList.add("revealed"), i * 80);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08 },
    );
    for (const el of Array.from(document.querySelectorAll(".reveal-section"))) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
}

/* ─── Dust Particles ────────────────────────────────────────────────────── */

const PARTICLES = [
  { left: 8, delay: 0, dur: 9 },
  { left: 15, delay: 1.5, dur: 11 },
  { left: 22, delay: 3, dur: 8 },
  { left: 30, delay: 0.8, dur: 13 },
  { left: 38, delay: 2.2, dur: 10 },
  { left: 45, delay: 4, dur: 12 },
  { left: 52, delay: 1, dur: 9 },
  { left: 58, delay: 2.8, dur: 14 },
  { left: 64, delay: 0.4, dur: 11 },
  { left: 70, delay: 3.5, dur: 8 },
  { left: 76, delay: 1.8, dur: 13 },
  { left: 82, delay: 0.2, dur: 10 },
  { left: 88, delay: 2.5, dur: 12 },
  { left: 93, delay: 1.2, dur: 9 },
  { left: 97, delay: 3.8, dur: 11 },
  { left: 5, delay: 2, dur: 14 },
  { left: 42, delay: 4.5, dur: 8 },
  { left: 67, delay: 0.6, dur: 13 },
];

function DustParticles({ count = 18 }: { count?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {PARTICLES.slice(0, count).map((p, idx) => (
        <div
          key={`p-${p.left}-${p.delay}`}
          className="dust-particle"
          style={{
            left: `${p.left}%`,
            bottom: `${10 + (idx % 6) * 12}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────────────────────── */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "HOME", href: "#hero" },
    { label: "ARTIFACT", href: "#artifact" },
    { label: "LEGEND", href: "#legend" },
    { label: "TOKENOMICS", href: "#tokenomics" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-coal/96 shadow-lg shadow-black/60 backdrop-blur-md border-b border-copper/20"
          : "bg-coal/70 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          className="flex items-center gap-3"
          data-ocid="nav.link"
        >
          <img
            src={BOOT_IMG}
            alt="$bOOt"
            className="w-9 h-9 object-cover rounded-lg"
            style={{ boxShadow: "0 0 12px rgba(255,176,0,0.4)" }}
          />
          <span
            className="font-display text-lg text-amber font-bold tracking-wide"
            style={{ textShadow: "0 0 12px rgba(255,176,0,0.5)" }}
          >
            $bOOt
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="font-body text-xs font-semibold tracking-widest text-silver/60 hover:text-amber transition-opacity duration-200 hover:opacity-100 px-4 py-2"
                data-ocid="nav.link"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={PUMP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 font-body text-xs font-bold tracking-widest bg-amber text-coal px-5 py-2.5 rounded-lg hover:bg-amber/90 transition-all duration-300 ease-out"
          style={{ boxShadow: "0 0 16px rgba(255,176,0,0.35)" }}
          data-ocid="nav.primary_button"
        >
          BUY NOW
        </a>

        {/* Hamburger */}
        <button
          type="button"
          className="md:hidden text-amber p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          data-ocid="nav.toggle"
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-coal/98 border-t border-copper/20 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-body text-xs font-semibold tracking-widest text-silver/70 hover:text-amber transition-opacity duration-200"
              onClick={() => setMenuOpen(false)}
              data-ocid="nav.link"
            >
              {l.label}
            </a>
          ))}
          <a
            href={PUMP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs font-bold tracking-widest bg-amber text-coal px-4 py-2.5 rounded-lg text-center transition-all duration-300 ease-out hover:bg-amber/90"
            data-ocid="nav.primary_button"
          >
            BUY NOW
          </a>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */

function Hero() {
  const copy = useCopyCA();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-24 px-4 overflow-hidden"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <DustParticles count={18} />

      {/* Radial ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 55%, rgba(255,176,0,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        {/* Small copper label */}
        <p
          className="font-body text-[10px] font-semibold tracking-[0.3em] uppercase mb-8"
          style={{ color: "#b87333" }}
        >
          SOLANA MEME COIN
        </p>

        {/* Boot image with lantern glow */}
        <div className="relative mb-12">
          <img
            src={BOOT_IMG}
            alt="The Boot"
            className="boot-glow w-52 h-52 sm:w-64 sm:h-64 object-cover rounded-lg"
          />
          {/* Pedestal glow */}
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-48 h-6 rounded-full blur-lg"
            style={{ background: "rgba(255,176,0,0.25)" }}
            aria-hidden
          />
        </div>

        {/* Main headline */}
        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
          style={{ textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}
        >
          &ldquo;All he left me…
          <br />
          <span className="text-amber text-glow-amber">
            was this boot.&rdquo;
          </span>
        </h1>

        <p className="font-body text-sm sm:text-base text-silver/55 mb-12 leading-relaxed max-w-md">
          Every scuff, every crack… tells a story.
        </p>

        {/* CA mine-tag */}
        <div className="w-full max-w-xl mb-8">
          <p className="font-body text-[10px] font-semibold tracking-[0.25em] text-silver/35 mb-2.5 text-left uppercase">
            Contract Address
          </p>
          <div className="mine-tag flex items-center gap-3 px-5 py-4 rounded-lg">
            <code className="font-mono text-[11px] sm:text-xs text-amber flex-1 break-all leading-relaxed">
              {CA}
            </code>
            <button
              type="button"
              onClick={() => copy(CA)}
              className="flex-shrink-0 font-body text-[10px] font-bold tracking-widest bg-amber text-coal px-3 py-2 rounded-md hover:bg-amber/90 transition-all duration-200"
              data-ocid="hero.button"
            >
              COPY
            </button>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <a
            href={PUMP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body font-bold text-sm tracking-widest bg-amber text-coal px-10 py-4 rounded-lg hover:bg-amber/90 transition-all duration-300 ease-out"
            style={{ boxShadow: "0 0 24px rgba(255,176,0,0.4)" }}
            data-ocid="hero.primary_button"
          >
            👢 BUY ON PUMP.FUN
          </a>
          <a
            href="#artifact"
            className="font-body font-bold text-sm tracking-widest text-amber border border-amber/40 px-8 py-4 rounded-lg hover:bg-amber/10 hover:border-amber/70 transition-all duration-300 ease-out"
            data-ocid="hero.secondary_button"
          >
            ↓ ENTER THE LEGACY
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6">
          {["✅ SOLANA", "✅ PUMP.FUN", "✅ 0% TAX", "✅ 1B SUPPLY"].map(
            (b) => (
              <span
                key={b}
                className="font-body text-[11px] font-semibold text-silver/45 tracking-wider"
              >
                {b}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Marquee ───────────────────────────────────────────────────────────── */

function Marquee() {
  const text =
    "DEEPER THAN ANYONE DARED • SOLE TO THE EARTH • LEGACY IN LEATHER • $bOOt TO THE MOON • THE TUNNELS REMEMBER • RUG KILLERS • ";
  const repeated = text.repeat(5);
  return (
    <div
      className="relative overflow-hidden border-y border-amber/20 py-3"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(-45deg, rgba(255,176,0,0.04) 0px, rgba(255,176,0,0.04) 1px, transparent 1px, transparent 20px)",
        }}
        aria-hidden
      />
      <div className="flex overflow-hidden">
        <div className="ticker-inner">
          <span className="font-body text-xs font-bold tracking-[0.25em] text-amber">
            {repeated}
          </span>
          <span
            className="font-body text-xs font-bold tracking-[0.25em] text-amber"
            aria-hidden
          >
            {repeated}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Artifact Section ──────────────────────────────────────────────────── */

function Artifact() {
  const [hovered, setHovered] = useState<number | null>(null);

  const cards = [
    {
      icon: "👢",
      title: "Heel",
      quote:
        "This heel survived the tunnel collapse… it carries the memory of every man who didn't come back.",
    },
    {
      icon: "💧",
      title: "Sole",
      quote:
        "Miles of tunnels no map shows. Steps too heavy for one man alone. The earth knows the weight.",
    },
    {
      icon: "🔥",
      title: "Burn",
      quote:
        "A close call with fire deep in the mine. It came out. He came out. They both wore the scars.",
    },
    {
      icon: "⛏️",
      title: "Cracks",
      quote:
        "Leather bends but doesn't break. Neither did he. Every crack is a story he chose not to tell.",
    },
  ];

  return (
    <section
      id="artifact"
      className="py-32 md:py-40 px-4 reveal-section"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper text-center mb-3 uppercase">
          The Object
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-16">
          THE ARTIFACT
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className="stagger-child card-copper border rounded-lg p-7 cursor-default relative overflow-hidden"
              style={{
                animationDelay: `${i * 0.15}s`,
                backgroundColor: "#1a1a1a",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              data-ocid={`artifact.item.${i + 1}`}
            >
              {/* Icon + title always visible */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{c.icon}</span>
                <h3 className="font-display text-xl font-bold text-amber">
                  {c.title}
                </h3>
              </div>

              {/* Quote revealed on hover — smooth max-height transition */}
              <div
                className="overflow-hidden transition-all duration-400 ease-out"
                style={{ maxHeight: hovered === i ? "100px" : "0" }}
              >
                <p
                  className="font-body text-sm italic leading-relaxed text-silver/70 transition-opacity duration-300"
                  style={{ opacity: hovered === i ? 1 : 0 }}
                >
                  &ldquo;{c.quote}&rdquo;
                </p>
              </div>

              {/* Hover copper glow line top */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #b87333, transparent)",
                  opacity: hovered === i ? 1 : 0,
                }}
                aria-hidden
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Legend Section ────────────────────────────────────────────────────── */

function Legend() {
  const lore = [
    {
      icon: "👢",
      text: "One boot. Dropped on the blockchain. Nobody expected it to walk this far.",
    },
    {
      icon: "🔥",
      text: "They said it was dead. The boot disagreed.",
    },
    {
      icon: "💀",
      text: "Every rug has a survivor. $bOOt is theirs.",
    },
  ];

  return (
    <section
      id="legend"
      className="relative py-32 md:py-40 px-4 mine-shaft reveal-section"
      style={{
        backgroundColor: "#080808",
        backgroundAttachment: "fixed",
      }}
    >
      <DustParticles count={12} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper mb-4 uppercase">
          The Story
        </p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-10 text-glow-amber">
          THE MINER&rsquo;S LEGEND
        </h2>

        {/* Three myth lines with copper dividers */}
        <div className="max-w-lg mx-auto space-y-0 mb-16">
          {[
            "He went deeper than anyone dared.",
            "Hands raw, eyes bright… but the tunnels keep their secrets.",
            "The earth remembers him, and so do we.",
          ].map((line) => (
            <div key={line}>
              <p
                className="font-display text-lg sm:text-xl font-semibold italic py-6"
                style={{
                  color: line.includes("Hands") ? "#c0c0c0" : "#e0d5c5",
                }}
              >
                &ldquo;{line}&rdquo;
              </p>
              {!line.includes("so do we") && <div className="copper-divider" />}
            </div>
          ))}
        </div>

        {/* BootLore artifact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {lore.map((a, i) => (
            <div
              key={a.icon}
              className="stagger-child card-amber border rounded-lg p-6 text-left"
              style={{
                animationDelay: `${i * 0.18}s`,
                backgroundColor: "#141414",
              }}
              data-ocid={`legend.item.${i + 1}`}
            >
              <div className="text-3xl mb-4">{a.icon}</div>
              <p className="font-body text-sm text-silver/70 leading-relaxed italic">
                {a.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Encounters Section ────────────────────────────────────────────────── */

function Encounters() {
  const cols = [
    {
      icon: "⛏️",
      title: "FELLOW MINERS",
      lines: [
        "They saw what he carried.",
        "They asked no questions.",
        "Respect needs no words.",
      ],
    },
    {
      icon: "💀",
      title: "THE RIVALS",
      lines: [
        "Some want his work buried.",
        "Some want the boot to stay underground.",
        "They were wrong.",
      ],
    },
    {
      icon: "👁️",
      title: "THE OUTSIDERS",
      lines: [
        "Curious about what the boot means.",
        "About what you survived.",
        "About whether you'll go back.",
      ],
    },
  ];

  return (
    <section
      className="py-32 md:py-40 px-4 reveal-section"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper text-center mb-3 uppercase">
          The People
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-16">
          THE ENCOUNTERS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cols.map((c, i) => (
            <div
              key={c.title}
              className="stagger-child card-copper border rounded-lg p-7"
              style={{
                animationDelay: `${i * 0.15}s`,
                backgroundColor: "#1a1a1a",
                borderTopWidth: "2px",
                borderTopColor: "#b87333",
              }}
              data-ocid={`encounters.item.${i + 1}`}
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3
                className="font-body text-[11px] font-bold tracking-widest mb-4"
                style={{ color: "#b87333" }}
              >
                {c.title}
              </h3>
              <div className="space-y-1.5">
                {c.lines.map((l) => (
                  <p
                    key={l}
                    className="font-display text-sm italic text-silver/60"
                  >
                    {l}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── The Choice ────────────────────────────────────────────────────────── */

function TheChoice() {
  return (
    <section
      className="relative py-36 md:py-44 px-4 text-center overflow-hidden reveal-section"
      style={{ backgroundColor: "#080808" }}
    >
      <DustParticles count={14} />

      {/* Shaft of light from above */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full pointer-events-none"
        aria-hidden
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,176,0,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Boot on pedestal */}
        <div className="relative inline-block mb-12">
          <img
            src={BOOT_IMG}
            alt="The Boot"
            className="boot-glow w-44 h-44 sm:w-56 sm:h-56 object-cover rounded-lg mx-auto"
          />
          {/* Glowing platform */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-4 rounded-full blur-xl"
            style={{ background: "rgba(255,176,0,0.3)" }}
            aria-hidden
          />
        </div>

        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-snug">
          &ldquo;You can leave the boot behind…
          <br />
          <span style={{ color: "#b87333" }}>
            Or walk the tunnels he never left.&rdquo;
          </span>
        </h2>

        <a
          href={PUMP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-body font-bold text-sm tracking-widest bg-amber text-coal px-10 py-4 rounded-lg hover:bg-amber/90 transition-all duration-300 ease-out"
          style={{ boxShadow: "0 0 32px rgba(255,176,0,0.5)" }}
          data-ocid="choice.primary_button"
        >
          STEP INTO THE LEGACY
        </a>
      </div>
    </section>
  );
}

/* ─── Tokenomics ────────────────────────────────────────────────────────── */

function Tokenomics() {
  const stats = [
    { label: "TOTAL SUPPLY", value: "1,000,000,000", sub: "$bOOt" },
    { label: "TAX", value: "0%", sub: "BUY & SELL" },
    { label: "BLOCKCHAIN", value: "SOLANA", sub: "HIGH SPEED" },
    { label: "LAUNCH", value: "PUMP.FUN", sub: "FAIR LAUNCH" },
  ];

  return (
    <section
      id="tokenomics"
      className="py-32 md:py-40 px-4 reveal-section"
      style={{ backgroundColor: "#111111" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper text-center mb-3 uppercase">
          The Numbers
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-14">
          TOKENOMICS
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="stagger-child card-amber border rounded-lg p-5 text-center"
              style={{
                animationDelay: `${i * 0.1}s`,
                backgroundColor: "#1a1a1a",
              }}
              data-ocid="tokenomics.card"
            >
              <div className="font-body text-[9px] font-bold tracking-widest text-silver/40 mb-3 uppercase">
                {s.label}
              </div>
              <div className="font-display text-xl sm:text-2xl font-bold text-amber text-glow-amber mb-1">
                {s.value}
              </div>
              <div
                className="font-body text-[10px] font-semibold tracking-wider"
                style={{ color: "#b87333" }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "PUBLIC SALE", pct: 80 },
            { label: "LIQUIDITY", pct: 15 },
            { label: "TEAM (LOCKED)", pct: 5 },
            { label: "MARKETING", pct: 0 },
          ].map((b) => (
            <div key={b.label}>
              <div className="flex justify-between mb-2.5">
                <span className="font-body text-[10px] font-semibold tracking-widest text-silver/50 uppercase">
                  {b.label}
                </span>
                <span className="font-body text-[10px] font-bold text-amber">
                  {b.pct}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: "#2a2a2a" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${b.pct}%`, backgroundColor: "#b87333" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How to Buy ────────────────────────────────────────────────────────── */

function HowToBuy() {
  const steps = [
    {
      n: "01",
      icon: "👻",
      title: "GET PHANTOM",
      desc: "Download Phantom wallet from phantom.app. Set it up and secure your seed phrase — this is your key to the legacy.",
    },
    {
      n: "02",
      icon: "💰",
      title: "ACQUIRE SOL",
      desc: "Buy Solana (SOL) on Coinbase, Binance, or any exchange. Transfer it to your Phantom wallet.",
    },
    {
      n: "03",
      icon: "🔥",
      title: "GO TO PUMP.FUN",
      desc: "Head to pump.fun and search for $bOOt or use our direct link. Connect your Phantom wallet.",
    },
    {
      n: "04",
      icon: "👢",
      title: "CLAIM $bOOt",
      desc: "Enter the amount of SOL you want to swap, confirm in Phantom — and the legacy is yours.",
    },
  ];

  return (
    <section
      id="how-to-buy"
      className="py-32 md:py-40 px-4 reveal-section"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper text-center mb-3 uppercase">
          The Path
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-14">
          HOW TO BUY
        </h2>

        <div className="space-y-4">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="stagger-child card-copper border rounded-lg p-6 flex gap-5"
              style={{
                animationDelay: `${i * 0.12}s`,
                backgroundColor: "#1a1a1a",
              }}
              data-ocid={`howtobuy.item.${i + 1}`}
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <span
                  className="font-display text-lg font-bold"
                  style={{ color: "#b87333" }}
                >
                  {s.n}
                </span>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <div>
                <h3 className="font-body text-xs font-bold tracking-widest text-amber mb-2 uppercase">
                  {s.title}
                </h3>
                <p className="font-body text-sm text-silver/60 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <a
            href={PUMP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-body font-bold text-sm tracking-widest bg-amber text-coal px-10 py-4 rounded-lg hover:bg-amber/90 transition-all duration-300 ease-out"
            style={{ boxShadow: "0 0 24px rgba(255,176,0,0.35)" }}
            data-ocid="howtobuy.primary_button"
          >
            👢 BUY $bOOt NOW
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Roadmap ───────────────────────────────────────────────────────────── */

function Roadmap() {
  const phases = [
    {
      phase: "LEVEL 1",
      title: "ENTER THE SHAFT",
      color: "#ffb000",
      borderColor: "rgba(255,176,0,0.35)",
      items: [
        "Fair launch on Pump.fun",
        "Build core community on Telegram & X",
        "Website & brand assets live",
        "First 1,000 holders milestone",
      ],
    },
    {
      phase: "LEVEL 2",
      title: "BREAK GROUND",
      color: "#b87333",
      borderColor: "rgba(184,115,51,0.35)",
      items: [
        "Raydium DEX listing",
        "CoinGecko & CoinMarketCap listing",
        "Community meme competitions",
        "10,000 holders milestone",
      ],
    },
    {
      phase: "LEVEL 3",
      title: "STRIKE GOLD",
      color: "#c0c0c0",
      borderColor: "rgba(192,192,192,0.25)",
      items: [
        "CEX listings",
        "$bOOt merchandise drop",
        "$bOOt community game launch",
        "100,000 holders — THE LEGACY LIVES",
      ],
    },
  ];

  return (
    <section
      id="roadmap"
      className="py-32 md:py-40 px-4 reveal-section"
      style={{ backgroundColor: "#111111" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper text-center mb-3 uppercase">
          The Journey
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-14">
          ROADMAP
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {phases.map((p, i) => (
            <div
              key={p.phase}
              className="stagger-child card-amber border rounded-lg p-6"
              style={{
                animationDelay: `${i * 0.15}s`,
                backgroundColor: "#1a1a1a",
                borderColor: p.borderColor,
              }}
              data-ocid={`roadmap.item.${i + 1}`}
            >
              <div className="font-body text-[9px] font-semibold tracking-widest text-silver/35 mb-2 uppercase">
                {p.phase}
              </div>
              <h3
                className="font-display text-lg font-bold mb-5"
                style={{ color: p.color }}
              >
                {p.title}
              </h3>
              <ul className="space-y-3">
                {p.items.map((item) => (
                  <li key={item} className="flex gap-2.5 items-start">
                    <span className="text-amber mt-0.5 flex-shrink-0 text-xs">
                      ▸
                    </span>
                    <span className="font-body text-sm text-silver/60 leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Community ─────────────────────────────────────────────────────────── */

function Community() {
  return (
    <section
      id="community"
      className="py-32 md:py-40 px-4 reveal-section"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper mb-3 uppercase">
          The Crew
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-14">
          JOIN THE CREW
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <a
            href={TG_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="stagger-child card-copper border rounded-lg p-6 flex items-center gap-4 group transition-all duration-300 ease-out"
            style={{ animationDelay: "0s", backgroundColor: "#1a1a1a" }}
            data-ocid="community.link"
          >
            <span className="text-3xl">✈️</span>
            <div className="text-left">
              <div className="font-body text-xs font-bold tracking-widest text-amber group-hover:text-white transition-colors duration-200 mb-1 uppercase">
                Telegram
              </div>
              <div className="font-body text-sm text-silver/50">
                Rug Killers HQ — join the crew
              </div>
            </div>
            <span className="ml-auto text-copper text-lg group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </a>

          <a
            href={X_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="stagger-child card-copper border rounded-lg p-6 flex items-center gap-4 group transition-all duration-300 ease-out"
            style={{ animationDelay: "0.1s", backgroundColor: "#1a1a1a" }}
            data-ocid="community.link"
          >
            <span className="text-3xl">𝕏</span>
            <div className="text-left">
              <div className="font-body text-xs font-bold tracking-widest text-amber group-hover:text-white transition-colors duration-200 mb-1 uppercase">
                X / Twitter
              </div>
              <div className="font-body text-sm text-silver/50">
                Follow for updates & dispatches
              </div>
            </div>
            <span className="ml-auto text-copper text-lg group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────── */

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = [
    {
      q: "WHAT IS $bOOt?",
      a: "$bOOt is a Solana meme coin. One boot, one legacy, one community. Fair-launched on Pump.fun and built for holders who understand that something left behind can be more powerful than what's taken.",
    },
    {
      q: "HOW DO I BUY $bOOt?",
      a: "Get a Phantom wallet, buy SOL, head to Pump.fun, and swap for $bOOt. Check our 'How to Buy' section above for the full four-step guide. It takes less than five minutes.",
    },
    {
      q: "IS THERE A TAX ON TRANSACTIONS?",
      a: "Zero. 0% buy tax, 0% sell tax. We believe in a pure fair-market experience. What you buy is what you get — no hidden fees.",
    },
    {
      q: "IS $bOOt SAFE TO BUY?",
      a: "$bOOt is a meme coin — always do your own research (DYOR). We're a community project with no promises of profit. Only invest what you can afford to lose.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-32 md:py-40 px-4 reveal-section"
      style={{ backgroundColor: "#111111" }}
    >
      <div className="max-w-3xl mx-auto">
        <p className="font-body text-[9px] font-semibold tracking-[0.35em] text-copper text-center mb-3 uppercase">
          The Answers
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-14">
          FAQ
        </h2>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={item.q}
              className="border rounded-lg overflow-hidden transition-all duration-300 ease-out"
              style={{
                backgroundColor: "#1a1a1a",
                borderColor:
                  open === i ? "rgba(184,115,51,0.5)" : "rgba(184,115,51,0.15)",
              }}
              data-ocid={`faq.item.${i + 1}`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                data-ocid="faq.toggle"
              >
                <span className="font-body text-xs font-bold tracking-wider text-amber uppercase">
                  {item.q}
                </span>
                <span
                  className="text-copper ml-4 text-sm transition-transform duration-300 ease-out"
                  style={{
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>
              <div
                ref={(el) => {
                  contentRefs.current[i] = el;
                }}
                className="overflow-hidden transition-all duration-400 ease-out"
                style={{
                  maxHeight: open === i ? "200px" : "0",
                  opacity: open === i ? 1 : 0,
                }}
              >
                <div className="px-6 pb-6">
                  <div className="copper-divider mb-4" />
                  <p className="font-body text-sm text-silver/60 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────── */

function Footer() {
  const copy = useCopyCA();
  const year = new Date().getFullYear();

  return (
    <footer
      className="pt-20 pb-10 px-4 border-t"
      style={{
        backgroundColor: "#080808",
        borderColor: "rgba(184,115,51,0.2)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src={BOOT_IMG}
                alt="$bOOt"
                className="w-10 h-10 object-cover rounded-lg"
                style={{ boxShadow: "0 0 10px rgba(255,176,0,0.3)" }}
              />
              <span className="font-display text-xl font-bold text-amber">
                $bOOt
              </span>
            </div>
            <p className="font-body text-sm text-silver/40 leading-relaxed mb-5">
              The boot-themed meme coin on Solana.
              <br />
              Community-driven. No tax. Fair launch.
            </p>
            <div className="mine-tag p-4 rounded-lg">
              <div className="font-body text-[9px] font-semibold tracking-widest text-silver/30 mb-1.5 uppercase">
                CA
              </div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-[9px] text-amber flex-1 break-all">
                  {CA}
                </code>
                <button
                  type="button"
                  onClick={() => copy(CA)}
                  className="flex-shrink-0 font-body text-[9px] font-bold tracking-wider text-coal bg-amber px-2 py-1 rounded-md hover:bg-amber/90 transition-all duration-200"
                  data-ocid="footer.button"
                >
                  COPY
                </button>
              </div>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-body text-[10px] font-bold tracking-widest text-amber mb-5 uppercase">
              Community
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href={TG_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-silver/40 hover:text-amber transition-opacity duration-200"
                  data-ocid="footer.link"
                >
                  ✈️ Telegram
                </a>
              </li>
              <li>
                <a
                  href={X_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-silver/40 hover:text-amber transition-opacity duration-200"
                  data-ocid="footer.link"
                >
                  𝕏 Twitter / X
                </a>
              </li>
              <li>
                <a
                  href={PUMP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-silver/40 hover:text-amber transition-opacity duration-200"
                  data-ocid="footer.link"
                >
                  🔥 Pump.fun
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-body text-[10px] font-bold tracking-widest text-amber mb-5 uppercase">
              Resources
            </h4>
            <ul className="space-y-3.5">
              {["TOKENOMICS", "ROADMAP", "HOW TO BUY"].map((r) => (
                <li key={r}>
                  <a
                    href={`#${r.toLowerCase().replace(/ /g, "-")}`}
                    className="font-body text-sm text-silver/40 hover:text-amber transition-opacity duration-200"
                    data-ocid="footer.link"
                  >
                    {r}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="copper-divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <span className="font-display text-sm font-bold italic text-silver/30 tracking-wider">
              THE TUNNELS REMEMBER
            </span>
            <span className="font-body text-xs text-silver/30">CONTINUE?</span>
            <a
              href={PUMP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs font-bold tracking-widest bg-amber text-coal px-4 py-2 rounded-lg hover:bg-amber/90 transition-all duration-200"
              data-ocid="footer.primary_button"
            >
              YES →
            </a>
          </div>
          <p className="font-body text-[10px] text-silver/25">
            © {year}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber transition-opacity duration-200"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── App ───────────────────────────────────────────────────────────────── */

export default function App() {
  useScrollReveal();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d0d0d" }}>
      <Toaster position="top-right" />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Artifact />
        <Legend />
        <Encounters />
        <TheChoice />
        <Tokenomics />
        <HowToBuy />
        <Roadmap />
        <Community />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
