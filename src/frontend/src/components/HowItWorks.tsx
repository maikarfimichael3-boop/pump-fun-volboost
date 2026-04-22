import { haptic } from "@/utils/haptic";

/* ─── Steps data ────────────────────────────────────────────────────────── */

const STEPS = [
  {
    step: "01",
    icon: "⌨️",
    iconLabel: "Terminal",
    title: "Paste Your CA",
    desc: "Enter your Solana meme coin contract address. Instant validation — no guesswork.",
    color: "#00ff88",
    colorBg: "rgba(0,255,136,0.1)",
    colorBorder: "rgba(0,255,136,0.25)",
  },
  {
    step: "02",
    icon: "📦",
    iconLabel: "Package",
    title: "Pick Package",
    desc: "Choose your volume tier. From $1K Starter to $2M Premium — with transparent SOL pricing.",
    color: "#ab9ff2",
    colorBg: "rgba(171,159,242,0.1)",
    colorBorder: "rgba(171,159,242,0.25)",
  },
  {
    step: "03",
    icon: "👻",
    iconLabel: "Wallet",
    title: "Connect & Pay",
    desc: "Connect Phantom. We only use your public key to process the one-time SOL payment.",
    color: "#ffd700",
    colorBg: "rgba(255,215,0,0.1)",
    colorBorder: "rgba(255,215,0,0.25)",
  },
  {
    step: "04",
    icon: "📈",
    iconLabel: "Chart",
    title: "Track Progress",
    desc: "Your boost runs on the Solana network. Monitor volume gains in real-time on the dashboard.",
    color: "#66ccff",
    colorBg: "rgba(102,204,255,0.1)",
    colorBorder: "rgba(102,204,255,0.25)",
  },
] as const;

/* ─── Step card ─────────────────────────────────────────────────────────── */

function StepCard({
  step,
  icon,
  iconLabel,
  title,
  desc,
  color,
  colorBg,
  colorBorder,
  index,
  isLast,
}: (typeof STEPS)[number] & { index: number; isLast: boolean }) {
  return (
    <div className="relative flex flex-col">
      {/* Horizontal connector line (desktop only, between cards) */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-[2.75rem] left-[calc(100%+2px)] h-px z-10 pointer-events-none"
          style={{
            width: "calc(var(--step-gap, 24px) + 4px)",
            background: `linear-gradient(90deg, ${color}55, rgba(255,255,255,0.06))`,
          }}
          aria-hidden
        />
      )}

      <div
        className="card-interactive w-full rounded-2xl p-6 border flex flex-col gap-4 h-full"
        style={{
          backgroundColor: "#0f0f0f",
          borderColor: "rgba(255,255,255,0.07)",
          animationDelay: `${index * 80}ms`,
        }}
        data-ocid={`how_it_works.item.${index + 1}`}
      >
        {/* Number + icon row */}
        <div className="flex items-center justify-between">
          {/* Icon circle */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: colorBg,
              border: `1px solid ${colorBorder}`,
            }}
            role="img"
            aria-label={iconLabel}
          >
            {icon}
          </div>
          {/* Big step number */}
          <span
            className="font-display text-5xl font-black leading-none"
            style={{ color: `${color}18` }}
            aria-hidden
          >
            {step}
          </span>
        </div>

        {/* Step label */}
        <div
          className="font-body text-[9px] font-bold tracking-[0.25em] uppercase"
          style={{ color: `${color}88` }}
        >
          STEP {step}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold text-white -mt-1">
          {title}
        </h3>

        {/* Description */}
        <p
          className="font-body text-xs leading-relaxed"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          {desc}
        </p>

        {/* Bottom accent line */}
        <div
          className="h-px mt-auto"
          style={{
            background: `linear-gradient(90deg, ${color}55, transparent)`,
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/* ─── Process stepper (horizontal, mobile-friendly) ────────────────────── */

function ProcessStepper() {
  return (
    <div
      className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0"
      aria-label="Process steps"
    >
      {STEPS.map((s, i) => (
        <div
          key={s.step}
          className="flex sm:flex-col items-center gap-4 sm:gap-2 flex-1 relative"
        >
          {/* Connector line between steps */}
          {i < STEPS.length - 1 && (
            <div
              className="hidden sm:block absolute top-5 left-[calc(50%+20px)] right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,255,136,0.3), rgba(0,255,136,0.05))",
              }}
              aria-hidden
            />
          )}
          {/* Step circle */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0 relative z-10"
            style={{
              background: "rgba(0,255,136,0.12)",
              border: "2px solid rgba(0,255,136,0.4)",
              color: "#00ff88",
            }}
          >
            {i + 1}
          </div>
          {/* Label */}
          <span
            className="font-body text-xs text-center"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {s.title}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── HowItWorks section ────────────────────────────────────────────────── */

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-4"
      style={{ backgroundColor: "#060606" }}
      data-ocid="how_it_works.section"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="font-body text-[10px] font-bold tracking-[0.3em] uppercase mb-3"
            style={{ color: "rgba(0,255,136,0.55)" }}
          >
            Simple Process
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p
            className="font-body text-sm max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.32)" }}
          >
            Get your Solana token trending on Pump.fun in four easy steps.
          </p>
        </div>

        {/* Stepper overview (visual shortcut) */}
        <div
          className="rounded-2xl border p-5 mb-10"
          style={{
            backgroundColor: "#0a0a0a",
            borderColor: "rgba(0,255,136,0.1)",
          }}
        >
          <ProcessStepper />
        </div>

        {/* Detailed step cards — 4 columns desktop */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          style={{ "--step-gap": "20px" } as React.CSSProperties}
        >
          {STEPS.map((s, i) => (
            <StepCard
              key={s.step}
              {...s}
              index={i}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </div>

        {/* CTA strip */}
        <div
          className="mt-12 rounded-2xl p-6 border flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{
            backgroundColor: "rgba(0,255,136,0.04)",
            borderColor: "rgba(0,255,136,0.15)",
          }}
          data-ocid="how_it_works.cta_strip"
        >
          <div>
            <p className="font-display text-base font-bold text-white mb-1">
              Ready to rank on Pump.fun?
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "rgba(255,255,255,0.32)" }}
            >
              Results may vary. Volume boosting is subject to network
              conditions.
            </p>
          </div>
          <button
            type="button"
            className="btn-cta px-7 py-3.5 rounded-xl font-display font-bold text-sm flex-shrink-0 flex items-center gap-2"
            onClick={() => {
              haptic("tap");
              document
                .getElementById("boost")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            data-ocid="how_it_works.start_button"
          >
            ⚡ Start Boosting
          </button>
        </div>
      </div>
    </section>
  );
}
