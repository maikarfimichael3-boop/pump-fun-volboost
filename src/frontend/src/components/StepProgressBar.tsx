import type { WizardStep } from "@/types";

/* ─── Step labels ────────────────────────────────────────────────────────── */

const STEPS: { num: WizardStep; label: string; shortLabel: string }[] = [
  { num: 1, label: "Token Address", shortLabel: "TOKEN" },
  { num: 2, label: "Select Package", shortLabel: "PACKAGE" },
  { num: 3, label: "Review Order", shortLabel: "REVIEW" },
  { num: 4, label: "Confirmed", shortLabel: "LIVE" },
];

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface StepProgressBarProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function StepProgressBar({
  currentStep,
  completedSteps,
}: StepProgressBarProps) {
  const pct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav
      className="mb-8"
      aria-label="Wizard progress"
      data-ocid="wizard.progress_bar"
    >
      {/* Track + dots */}
      <div className="relative flex items-center justify-between">
        {/* Background track */}
        <div
          className="absolute left-0 right-0 h-0.5 top-[19px]"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-hidden
        />
        {/* Filled track */}
        <div
          className="absolute left-0 h-0.5 top-[19px] transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, #00ff88 0%, rgba(0,255,136,0.6) 100%)",
            boxShadow: "0 0 8px rgba(0,255,136,0.5)",
          }}
          aria-hidden
        />

        {/* Step dots */}
        {STEPS.map((s) => {
          const isActive = s.num === currentStep;
          const isDone = completedSteps.includes(s.num);

          return (
            <div
              key={s.num}
              className="relative z-10 flex flex-col items-center gap-2"
              data-ocid={`wizard.step_dot.${s.num}`}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Dot */}
              <div
                className={`step-dot ${isActive ? "active" : isDone ? "completed" : ""}`}
                aria-label={`Step ${s.num}: ${s.label}${isDone ? " (completed)" : isActive ? " (current)" : ""}`}
              >
                {isDone ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    role="img"
                  >
                    <title>Step completed</title>
                    <path
                      d="M2.5 7.5L5.5 10.5L11 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  s.num
                )}
              </div>

              {/* Label */}
              <span
                className="hidden sm:block text-[9px] font-bold tracking-wider font-mono whitespace-nowrap"
                style={{
                  color: isActive
                    ? "#00ff88"
                    : isDone
                      ? "rgba(0,255,136,0.6)"
                      : "rgba(255,255,255,0.2)",
                }}
              >
                {s.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current step label — mobile */}
      <p
        className="sm:hidden text-center font-mono text-[10px] font-bold tracking-widest mt-4"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        STEP {currentStep} OF {STEPS.length} —{" "}
        <span style={{ color: "#00ff88" }}>
          {STEPS[currentStep - 1].label.toUpperCase()}
        </span>
      </p>
    </nav>
  );
}
