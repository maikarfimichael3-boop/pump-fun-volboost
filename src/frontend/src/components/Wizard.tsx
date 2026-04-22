import { PackageCard } from "@/components/PackageCard";
import { StepProgressBar } from "@/components/StepProgressBar";
import { VOLUME_PACKAGES } from "@/constants/packages";
import { useLeaderboard, useSubmitOrder } from "@/hooks/useBoost";
import type { WizardStep } from "@/types";
import { haptic } from "@/utils/haptic";
import {
  formatAddress,
  generateOrderId,
  isValidSolanaAddress,
} from "@/utils/solana";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const PAYMENT_WALLET = "LiNRXfwp681aF3uV5vtVEBrBLmQEx7d7Nr85gjfmkFY";

/* ─── Step 1: Token Contract Address ────────────────────────────────────── */

export function WizardStep1CA({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isValid = isValidSolanaAddress(value);
  const showError = touched && value.length > 0 && !isValid;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.trim());
      haptic("select");
      setTouched(true);
    } catch {
      /* clipboard not available */
    }
  };

  const handleVerify = () => {
    if (!isValid) return;
    setVerifying(true);
    haptic("tap");
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      haptic("confirm");
      toast.success("Token verified!", { description: formatAddress(value) });
    }, 1500);
  };

  useEffect(() => {
    setVerified(false);
  }, []); // re-runs only on mount

  return (
    <div className="step-enter">
      {/* Header */}
      <div className="mb-1 flex items-center gap-2">
        <span className="badge-capsule text-[10px]">STEP 1 / 4</span>
      </div>
      <h2 className="font-display text-xl font-bold text-white tracking-wider mb-1">
        TOKEN ADDRESS
      </h2>
      <p
        className="font-body text-sm mb-6"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Enter the Solana contract address of the token you want to boost
      </p>

      {/* Label */}
      <p
        className="text-label mb-2"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        TOKEN CONTRACT ADDRESS
      </p>

      {/* Input + paste button */}
      <div className="relative mb-2">
        <input
          ref={inputRef}
          type="text"
          className={`volboost-input pr-20${showError ? " error" : isValid && value ? " border-green-400" : ""}`}
          placeholder="Paste your Solana CA here..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            haptic("tap");
          }}
          onBlur={() => setTouched(true)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          data-ocid="wizard.ca_input"
          aria-label="Token contract address"
          aria-invalid={showError}
          aria-describedby={showError ? "ca-error" : undefined}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
        <button
          type="button"
          onClick={handlePaste}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-smooth"
          style={{
            backgroundColor: "rgba(0,255,136,0.12)",
            color: "#00ff88",
            border: "1px solid rgba(0,255,136,0.25)",
          }}
          data-ocid="wizard.ca_paste_button"
          aria-label="Paste from clipboard"
        >
          PASTE
        </button>
      </div>

      {/* Validation feedback */}
      {showError && (
        <p
          id="ca-error"
          className="font-body text-xs mb-3 flex items-center gap-1.5"
          style={{ color: "#ff5050" }}
          data-ocid="wizard.ca_input.field_error"
        >
          <span>⚠</span>
          <span>
            Invalid — Solana addresses are 32–44 base58 chars (no 0, O, I, l)
          </span>
        </p>
      )}
      {isValid && value && !showError && (
        <p
          className="font-body text-xs mb-3 flex items-center gap-1.5"
          style={{ color: "rgba(0,255,136,0.7)" }}
        >
          <span>✓</span>
          <span>Valid Solana address format</span>
        </p>
      )}
      {!showError && !(isValid && value) && <div className="mb-3" />}

      {/* Verify button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={!isValid || verifying}
        className="w-full py-3 rounded-xl font-body font-semibold text-sm mb-4 border transition-smooth flex items-center justify-center gap-2"
        style={{
          borderColor: verified
            ? "rgba(0,255,136,0.4)"
            : "rgba(0,255,136,0.15)",
          color: verified ? "#00ff88" : "rgba(255,255,255,0.4)",
          backgroundColor: verified
            ? "rgba(0,255,136,0.06)"
            : "rgba(255,255,255,0.02)",
          opacity: !isValid ? 0.4 : 1,
          cursor: !isValid ? "not-allowed" : "pointer",
        }}
        data-ocid="wizard.ca_verify_button"
      >
        {verifying ? (
          <>
            <svg
              className="spinner w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
            >
              <title>Verifying</title>
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="rgba(0,255,136,0.2)"
                strokeWidth="3"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="#00ff88"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Verifying token…
          </>
        ) : verified ? (
          <>✓ Token verified</>
        ) : (
          "Verify token"
        )}
      </button>

      {/* Continue CTA */}
      <button
        type="button"
        className="btn-cta w-full py-4 rounded-xl font-display font-bold text-base tracking-wide"
        disabled={!isValid}
        onClick={() => {
          if (!isValid) {
            haptic("error");
            setTouched(true);
            return;
          }
          haptic("select");
          onNext();
        }}
        data-ocid="wizard.ca_continue_button"
      >
        Continue →
      </button>

      <p
        className="font-body text-xs text-center mt-4"
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        Your CA is never stored — only used to process your boost
      </p>
    </div>
  );
}

/* ─── Step 2: Select Package ─────────────────────────────────────────────── */

export function WizardStep2Package({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: number | null;
  onSelect: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="step-enter">
      <div className="mb-1 flex items-center gap-2">
        <span className="badge-capsule text-[10px]">STEP 2 / 4</span>
      </div>
      <h2 className="font-display text-xl font-bold text-white tracking-wider mb-1">
        SELECT PACKAGE
      </h2>
      <p
        className="font-body text-sm mb-5"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Choose the volume tier that fits your goals
      </p>

      <div
        className="grid grid-cols-2 gap-2.5 mb-5"
        data-ocid="wizard.packages_list"
      >
        {VOLUME_PACKAGES.map((pkg, i) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={selected === i}
            onSelect={() => {
              haptic("select");
              onSelect(i);
            }}
            index={i + 1}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            haptic("tap");
            onBack();
          }}
          className="flex-1 py-3.5 rounded-xl font-body font-semibold text-sm border transition-smooth"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
            background: "transparent",
          }}
          data-ocid="wizard.package_back_button"
        >
          ← Back
        </button>
        <button
          type="button"
          className="btn-cta flex-[2] py-3.5 rounded-xl font-display font-bold text-base"
          disabled={selected === null}
          onClick={() => {
            haptic("select");
            onNext();
          }}
          data-ocid="wizard.package_continue_button"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3: Review Order & Send Payment ────────────────────────────────── */

export function WizardStep3Review({
  ca,
  pkgIndex,
  onConfirm,
  onBack,
}: {
  ca: string;
  pkgIndex: number;
  onConfirm: (orderId: string) => void;
  onBack: () => void;
}) {
  const [walletCopied, setWalletCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const submitOrder = useSubmitOrder();
  const pkg = VOLUME_PACKAGES[pkgIndex];

  const copyCA = () => {
    navigator.clipboard.writeText(ca).then(() => {
      haptic("tap");
      toast.success("CA copied!");
    });
  };

  const copyPaymentWallet = () => {
    navigator.clipboard.writeText(PAYMENT_WALLET).then(() => {
      haptic("confirm");
      toast.success("Wallet address copied!", {
        description: "Open your Solana wallet and paste to send payment",
      });
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 3000);
    });
  };

  const handleConfirm = async () => {
    haptic("confirm");
    setProcessing(true);
    try {
      const result = await submitOrder.mutateAsync({
        ca,
        tier: pkg.id,
        solAmount: pkg.solCost,
        walletAddress: "manual-payment",
      });
      haptic("confirm");
      onConfirm(result.orderId);
    } catch {
      haptic("error");
      toast.error("Transaction failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="step-enter">
      <div className="mb-1 flex items-center gap-2">
        <span className="badge-capsule text-[10px]">STEP 3 / 4</span>
      </div>
      <h2 className="font-display text-xl font-bold text-white tracking-wider mb-1">
        SEND PAYMENT
      </h2>
      <p
        className="font-body text-sm mb-5"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Open your Solana wallet and send the exact amount below
      </p>

      {/* ── PRIMARY: Payment instruction card ───────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-4 border"
        style={{
          backgroundColor: "rgba(0,255,136,0.04)",
          borderColor: "rgba(0,255,136,0.3)",
          boxShadow: "0 0 28px rgba(0,255,136,0.08)",
          animation: "greenGlow 2.5s ease-in-out infinite",
        }}
        data-ocid="wizard.payment_instruction_card"
      >
        {/* Amount to send */}
        <p
          className="font-mono text-[10px] tracking-widest mb-2 uppercase"
          style={{ color: "rgba(0,255,136,0.6)" }}
        >
          Amount to Send
        </p>
        <div className="flex items-baseline gap-3 mb-5">
          <span
            className="font-display font-bold leading-none"
            style={{
              fontSize: "2.75rem",
              color: "#00ff88",
              textShadow: "0 0 20px rgba(0,255,136,0.6)",
            }}
          >
            {pkg.solCostFmt}
          </span>
          <span
            className="font-body text-sm"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {pkg.usdCost}
          </span>
        </div>

        {/* Wallet address label */}
        <p
          className="font-mono text-[10px] tracking-widest mb-2 uppercase"
          style={{ color: "rgba(0,255,136,0.6)" }}
        >
          Send to This Wallet
        </p>

        {/* Address block — terminal style */}
        <div
          className="rounded-xl px-4 py-3.5 mb-3 select-all"
          style={{
            backgroundColor: "#0a0a0a",
            border: "1.5px solid rgba(0,255,136,0.35)",
            boxShadow: "0 0 12px rgba(0,255,136,0.1)",
          }}
          data-ocid="wizard.payment_wallet_address"
        >
          <code
            className="font-mono text-xs leading-relaxed break-all"
            style={{
              color: "rgba(0,255,136,0.9)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            {PAYMENT_WALLET}
          </code>
        </div>

        {/* Big copy button */}
        <button
          type="button"
          onClick={copyPaymentWallet}
          className="w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wide transition-spring flex items-center justify-center gap-2.5"
          style={{
            backgroundColor: walletCopied
              ? "rgba(0,255,136,0.2)"
              : "rgba(0,255,136,0.12)",
            color: "#00ff88",
            border: walletCopied
              ? "1.5px solid rgba(0,255,136,0.7)"
              : "1.5px solid rgba(0,255,136,0.35)",
            boxShadow: walletCopied ? "0 0 20px rgba(0,255,136,0.3)" : "none",
          }}
          data-ocid="wizard.copy_payment_wallet_button"
          aria-label="Copy payment wallet address"
        >
          {walletCopied ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                role="presentation"
              >
                <title>Copied</title>
                <path
                  d="M3 8.5L6.5 12L13 5"
                  stroke="#00ff88"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                role="presentation"
              >
                <title>Copy</title>
                <rect
                  x="5"
                  y="5"
                  width="8"
                  height="9"
                  rx="1.5"
                  stroke="#00ff88"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 11V3a1 1 0 0 1 1-1h7"
                  stroke="#00ff88"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Copy Wallet Address
            </>
          )}
        </button>

        {/* Instruction line */}
        <p
          className="font-body text-xs text-center mt-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Open Phantom, Solflare, or any Solana wallet → paste address → send
          exactly{" "}
          <span style={{ color: "#00ff88", fontWeight: 700 }}>
            {pkg.solCostFmt}
          </span>
        </p>
      </div>

      {/* ── Order summary card ───────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 mb-5 border"
        style={{
          backgroundColor: "#111111",
          borderColor: "rgba(255,255,255,0.07)",
        }}
        data-ocid="wizard.order_summary_card"
      >
        <p
          className="font-mono text-[10px] tracking-widest mb-3 uppercase"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Order Summary
        </p>

        {[
          {
            label: "Token",
            value: formatAddress(ca),
            mono: true,
            action: copyCA,
            ocid: "wizard.copy_ca_button",
          },
          {
            label: "Package",
            value: `${pkg.name} · ${pkg.targetVolumeFmt}`,
            mono: false,
            action: null,
            ocid: null,
          },
          {
            label: "Duration",
            value: `~${pkg.solCost < 5 ? "2–6" : pkg.solCost < 20 ? "12–36" : "48–96"} hours`,
            mono: false,
            action: null,
            ocid: null,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center py-2 border-b last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <span
              className="font-body text-xs"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {row.label}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={
                  row.mono
                    ? "font-mono text-xs"
                    : "font-body text-xs font-semibold text-white"
                }
                style={
                  row.mono ? { color: "rgba(255,255,255,0.65)" } : undefined
                }
              >
                {row.value}
              </span>
              {row.action && (
                <button
                  type="button"
                  onClick={row.action}
                  className="font-mono text-[9px] font-bold px-2 py-0.5 rounded transition-smooth"
                  style={{
                    backgroundColor: "rgba(0,255,136,0.08)",
                    color: "#00ff88",
                    border: "1px solid rgba(0,255,136,0.18)",
                  }}
                  data-ocid={row.ocid ?? undefined}
                  aria-label="Copy"
                >
                  COPY
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── "I've Paid" CTA ──────────────────────────────────────────────── */}
      <button
        type="button"
        className="btn-cta w-full py-4 rounded-xl font-display font-bold text-base mb-3 flex items-center justify-center gap-2.5"
        onClick={handleConfirm}
        disabled={processing}
        data-ocid="wizard.confirm_pay_button"
        style={
          !processing
            ? { animation: "buttonGlowPulse 2s ease-in-out infinite" }
            : undefined
        }
      >
        {processing ? (
          <>
            <svg
              className="spinner w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
            >
              <title>Processing</title>
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="3"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="#0d0d0d"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Activating boost…
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              role="presentation"
            >
              <title>Confirm</title>
              <path
                d="M4 9.5L7.5 13L14 6"
                stroke="#0d0d0d"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            I've Paid — Activate My Boost
          </>
        )}
      </button>

      <div className="flex gap-3 mb-3">
        <button
          type="button"
          onClick={() => {
            haptic("tap");
            onBack();
          }}
          disabled={processing}
          className="flex-1 py-3 rounded-xl font-body font-semibold text-sm border transition-smooth"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
            background: "transparent",
          }}
          data-ocid="wizard.confirm_back_button"
        >
          ← Back
        </button>
      </div>

      <p
        className="font-body text-xs text-center"
        style={{ color: "rgba(255,255,255,0.18)" }}
      >
        By confirming you agree to our{" "}
        <span style={{ color: "rgba(0,255,136,0.5)" }}>Terms of Service</span>
      </p>
    </div>
  );
}

/* ─── Particle burst (CSS confetti) ─────────────────────────────────────── */

function ParticleBurst() {
  const particles = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {particles.map((i) => {
        const angle = (i / particles.length) * 360;
        const dist = 60 + Math.random() * 40;
        const size = 4 + Math.random() * 6;
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              top: "50%",
              left: "50%",
              backgroundColor:
                i % 3 === 0
                  ? "#00ff88"
                  : i % 3 === 1
                    ? "rgba(0,255,136,0.5)"
                    : "rgba(255,255,255,0.4)",
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(${-dist}px)`,
              animation: `particleFade 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.04}s both`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Step 4: Confirmation ───────────────────────────────────────────────── */

export function WizardStep4Confirm({
  pkgIndex,
  orderId,
  onRestart,
}: {
  pkgIndex: number;
  orderId: string;
  onRestart: () => void;
}) {
  const pkg = VOLUME_PACKAGES[pkgIndex];
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"Processing" | "Active">("Processing");

  useEffect(() => {
    haptic("confirm");
    const t = setTimeout(() => setProgress(5), 600);
    const t2 = setTimeout(() => setStatus("Active"), 3000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  const handleCopyReceipt = () => {
    const receipt = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "    PUMP.FUN VOLBOOST RECEIPT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `Order:    #${orderId}`,
      `Tier:     ${pkg.name}`,
      `Volume:   ${pkg.targetVolumeFmt}`,
      `Cost:     ${pkg.solCostFmt}`,
      `Status:   ${status}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ].join("\n");
    navigator.clipboard.writeText(receipt).then(() => {
      haptic("tap");
      toast.success("Receipt copied!");
    });
  };

  const handleShare = () => {
    const text = encodeURIComponent(
      `🚀 My boost is live! Order #${orderId}\n${pkg.targetVolumeFmt} volume boost running on @pumpdotfun\nPowered by Pump.Fun VolBoost ⚡ #Solana #PumpFun`,
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    haptic("tap");
  };

  return (
    <div className="step-enter text-center" data-ocid="wizard.success_state">
      {/* Success checkmark with particle burst */}
      <div className="relative inline-block mb-6">
        <ParticleBurst />
        <div
          className="check-pop w-24 h-24 rounded-full flex items-center justify-center mx-auto"
          style={{
            background:
              "radial-gradient(circle, rgba(0,255,136,0.15) 0%, rgba(0,255,136,0.05) 100%)",
            border: "2px solid rgba(0,255,136,0.45)",
            boxShadow:
              "0 0 40px rgba(0,255,136,0.35), 0 0 80px rgba(0,255,136,0.1)",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            role="img"
          >
            <title>Success</title>
            <path
              d="M8 21L16 29L32 11"
              stroke="#00ff88"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex justify-center mb-3">
        <span className="badge-capsule-active text-xs tracking-widest px-4 py-1.5 flex items-center gap-2">
          <span
            className="pulse-dot w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: "#00ff88" }}
          />
          BOOST ACTIVATED
        </span>
      </div>

      <h2 className="font-display text-2xl font-bold text-white mb-2 tracking-wider">
        BOOST IS LIVE!
      </h2>
      <p
        className="font-body text-sm mb-6"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Your volume boost is now running on the Solana network
      </p>

      {/* Order details card */}
      <div
        className="rounded-xl p-5 mb-4 text-left border"
        style={{
          backgroundColor: "#111111",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {[
          { label: "ORDER ID", value: `#${orderId}`, mono: true },
          { label: "STATUS", isStatus: true, value: status },
          { label: "VOLUME TARGET", value: pkg.targetVolumeFmt, mono: false },
          {
            label: "EST. COMPLETION",
            value: `${pkg.solCost < 5 ? "2–6" : pkg.solCost < 20 ? "12–36" : "48–96"} hours`,
            mono: false,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center py-2.5 border-b last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <span
              className="font-mono text-[10px] tracking-wider"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {row.label}
            </span>
            {row.isStatus ? (
              <div className="flex items-center gap-2">
                <div
                  className="pulse-dot w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      status === "Active" ? "#00ff88" : "#ffaa00",
                  }}
                />
                <span
                  className="font-mono text-xs font-bold px-2.5 py-1 rounded-full transition-smooth"
                  style={{
                    backgroundColor:
                      status === "Active"
                        ? "rgba(0,255,136,0.15)"
                        : "rgba(255,170,0,0.15)",
                    color: status === "Active" ? "#00ff88" : "#ffaa00",
                  }}
                >
                  ● {status}
                </span>
              </div>
            ) : (
              <span
                className={
                  row.mono
                    ? "font-mono text-xs"
                    : "font-body text-sm font-semibold text-white"
                }
                style={
                  row.mono ? { color: "rgba(255,255,255,0.55)" } : undefined
                }
              >
                {row.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress preview card */}
      <div
        className="rounded-xl p-4 mb-4 border text-left"
        style={{
          backgroundColor: "rgba(0,255,136,0.03)",
          borderColor: "rgba(0,255,136,0.15)",
        }}
        data-ocid="wizard.boost_progress_card"
      >
        <div className="flex justify-between items-center mb-2">
          <span
            className="font-mono text-[10px] tracking-wider"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            VOLUME PROGRESS
          </span>
          <span
            className="font-mono text-xs font-bold"
            style={{ color: "#00ff88" }}
          >
            {progress}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden mb-3"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              backgroundColor: "#00ff88",
              boxShadow: "0 0 8px rgba(0,255,136,0.6)",
            }}
          />
        </div>
        <div className="flex justify-between">
          <span
            className="font-body text-xs"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Est. completion:{" "}
            {pkg.solCost < 5 ? "2–6" : pkg.solCost < 20 ? "12–36" : "48–96"}{" "}
            hours
          </span>
          <button
            type="button"
            onClick={() => {
              haptic("tap");
              toast.info("Progress refreshed", {
                description: "Data syncing with Solana network",
              });
            }}
            className="font-mono text-[10px] font-bold transition-smooth"
            style={{ color: "rgba(0,255,136,0.6)" }}
            data-ocid="wizard.refresh_progress_button"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Shareable receipt card */}
      <div
        className="rounded-xl p-4 mb-5 border text-left"
        style={{
          backgroundColor: "#0f0f0f",
          borderColor: "rgba(255,255,255,0.06)",
        }}
        data-ocid="wizard.receipt_card"
      >
        <p className="font-body text-sm text-white mb-1">
          My boost is live! 🚀
        </p>
        <p
          className="font-mono text-xs mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {formatAddress(PAYMENT_WALLET)} · {pkg.name} · {pkg.solCostFmt}
        </p>
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-2.5 rounded-lg font-body text-sm font-semibold border transition-smooth flex items-center justify-center gap-2"
          style={{
            borderColor: "rgba(29,161,242,0.3)",
            color: "#1da1f2",
            backgroundColor: "rgba(29,161,242,0.06)",
          }}
          data-ocid="wizard.share_twitter_button"
        >
          𝕏 Share on X
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-3">
        <button
          type="button"
          onClick={handleCopyReceipt}
          className="flex-1 py-3.5 rounded-xl font-body font-semibold text-sm border transition-smooth"
          style={{
            borderColor: "rgba(0,255,136,0.25)",
            color: "#00ff88",
            backgroundColor: "rgba(0,255,136,0.05)",
          }}
          data-ocid="wizard.copy_receipt_button"
        >
          📋 Receipt
        </button>
        <button
          type="button"
          onClick={() => {
            haptic("tap");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex-1 py-3.5 rounded-xl font-body font-semibold text-sm border transition-smooth"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
            backgroundColor: "transparent",
          }}
          data-ocid="wizard.view_dashboard_button"
        >
          Dashboard →
        </button>
      </div>

      <button
        type="button"
        className="btn-cta w-full py-4 rounded-xl font-display font-bold text-base"
        onClick={() => {
          haptic("tap");
          onRestart();
        }}
        data-ocid="wizard.restart_button"
      >
        Boost Another Token ⚡
      </button>
    </div>
  );
}

/* ─── Live Activity Panel ────────────────────────────────────────────────── */

export function LiveActivityPanel() {
  const { data: leaderboard } = useLeaderboard(5);

  return (
    <aside
      className="rounded-2xl border p-5 h-fit"
      style={{
        backgroundColor: "#0f0f0f",
        borderColor: "rgba(255,255,255,0.07)",
      }}
      data-ocid="dashboard.live_panel"
    >
      <h3
        className="font-body text-xs font-bold tracking-wider mb-4"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        LIVE VOLBOOST ACTIVITY
      </h3>

      <div className="mb-5">
        {[
          { label: "Active Boost", progress: 72 },
          { label: "Growth Accelerate", progress: 45 },
        ].map((item) => (
          <div key={item.label} className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span
                className="font-body text-xs"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {item.label}
              </span>
              <span
                className="font-body text-xs font-bold"
                style={{ color: "#00ff88" }}
              >
                {item.progress}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${item.progress}%`,
                  backgroundColor: "#00ff88",
                  boxShadow: "0 0 6px rgba(0,255,136,0.4)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <p
          className="font-body text-[10px] tracking-wider mb-3"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          RECENT ACTIVITY
        </p>
        {(leaderboard ?? []).slice(0, 4).map((entry, i) => (
          <div
            key={`${entry.walletAddress}-${i}`}
            className="flex items-center gap-2 py-2 border-b"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
            data-ocid={`dashboard.activity.item.${i + 1}`}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  entry.status === "running"
                    ? "#00ff88"
                    : "rgba(0,255,136,0.4)",
              }}
            />
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: "rgba(171,159,242,0.3)",
                color: "#ab9ff2",
              }}
            >
              {entry.walletAddress.slice(0, 1)}
            </div>
            <span
              className="font-mono text-[11px] flex-1 min-w-0 truncate"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {formatAddress(entry.walletAddress)}
            </span>
            <span className="badge-capsule text-[9px] px-1.5 py-0.5">
              {entry.tier.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ─── Wizard (main export) ───────────────────────────────────────────────── */

export function Wizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [ca, setCA] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [orderId, setOrderId] = useState(() => generateOrderId());

  const completedSteps = Array.from(
    { length: step - 1 },
    (_, i) => (i + 1) as WizardStep,
  );

  const handleRestart = () => {
    setStep(1);
    setCA("");
    setSelectedPkg(null);
    setOrderId(generateOrderId());
  };

  return (
    <section
      id="boost"
      className="py-12 md:py-20 px-4"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wider">
            VOLBOOST WIZARD
          </h1>
          <p
            className="font-body text-sm mt-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Boost your Solana meme coin in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Wizard panel */}
          <div
            className="rounded-2xl p-6 sm:p-8 border"
            style={{
              backgroundColor: "#0f0f0f",
              borderColor:
                step === 1 || step === 4
                  ? "rgba(0,255,136,0.25)"
                  : "rgba(255,255,255,0.07)",
              ...(step === 1 || step === 4
                ? { boxShadow: "0 0 32px rgba(0,255,136,0.06)" }
                : {}),
            }}
            data-ocid="wizard.panel"
          >
            <StepProgressBar
              currentStep={step}
              completedSteps={completedSteps}
            />

            {step === 1 && (
              <WizardStep1CA
                value={ca}
                onChange={setCA}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <WizardStep2Package
                selected={selectedPkg}
                onSelect={setSelectedPkg}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && selectedPkg !== null && (
              <WizardStep3Review
                ca={ca}
                pkgIndex={selectedPkg}
                onConfirm={(id) => {
                  setOrderId(id);
                  setStep(4);
                }}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && selectedPkg !== null && (
              <WizardStep4Confirm
                pkgIndex={selectedPkg}
                orderId={orderId}
                onRestart={handleRestart}
              />
            )}
          </div>

          {/* Live activity sidebar */}
          <LiveActivityPanel />
        </div>
      </div>
    </section>
  );
}
