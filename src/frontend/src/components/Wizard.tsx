import { PackageCard } from "@/components/PackageCard";
import { StepProgressBar } from "@/components/StepProgressBar";
import { VOLUME_PACKAGES } from "@/constants/packages";
import {
  useLeaderboard,
  useSubmitOrder,
  useSubmitTxHash,
  useVerifyBoost,
  useVerifyTxOnChain,
} from "@/hooks/useBoost";
import type { TokenMetadata, WizardStep } from "@/types";
import { haptic } from "@/utils/haptic";
import {
  formatAddress,
  formatUsdAmount,
  generateOrderId,
  isValidSolanaAddress,
  isValidTxHash,
  lookupTokenByCA,
} from "@/utils/solana";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const PAYMENT_WALLET = "LiNRXfwp681aF3uV5vtVEBrBLmQEx7d7Nr85gjfmkFY";

/* ─── Token logo with fallback ──────────────────────────────────────────── */

function TokenLogo({ logoURI, symbol }: { logoURI?: string; symbol: string }) {
  const [errored, setErrored] = useState(false);
  if (logoURI && !errored) {
    return (
      <img
        src={logoURI}
        alt={`${symbol} logo`}
        onError={() => setErrored(true)}
        className="w-full h-full object-cover rounded-full"
      />
    );
  }
  return (
    <span
      className="font-display font-bold text-xl"
      style={{ color: "#0d0d0d" }}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </span>
  );
}

/* ─── Step 1: Token Contract Address ────────────────────────────────────── */

export function WizardStep1CA({
  value,
  onChange,
  onNext,
  onTokenVerified,
  verifiedToken,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onTokenVerified: (token: TokenMetadata | null) => void;
  verifiedToken: TokenMetadata | null;
}) {
  const [touched, setTouched] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyFailed, setVerifyFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isValid = isValidSolanaAddress(value);
  const showError = touched && value.length > 0 && !isValid;
  const isVerified = !!verifiedToken;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.trim());
      haptic("select");
      setTouched(true);
      onTokenVerified(null);
      setVerifyFailed(false);
    } catch {
      /* clipboard not available */
    }
  };

  const handleVerify = async () => {
    if (!isValid || verifying) return;
    setVerifying(true);
    setVerifyFailed(false);
    onTokenVerified(null);
    haptic("tap");
    try {
      const token = await lookupTokenByCA(value.trim());
      if (token) {
        onTokenVerified(token);
        haptic("confirm");
        const sourceLabel =
          token.source === "pumpfun"
            ? "Verified on Pump.fun"
            : "Verified on Solana";
        toast.success(`${token.name} verified!`, {
          description: `$${token.symbol} · ${sourceLabel}`,
        });
      } else {
        setVerifyFailed(true);
        haptic("error");
      }
    } catch {
      setVerifyFailed(true);
      haptic("error");
    } finally {
      setVerifying(false);
    }
  };

  // Reset verification when CA changes
  useEffect(() => {
    setVerifyFailed(false);
  }, []); // intentionally runs once on mount — CA changes handled by onChange prop

  return (
    <div className="step-enter">
      {/* Header */}
      <div className="mb-1 flex items-center gap-2">
        <span className="badge-capsule text-[10px]">STEP 1 / 5</span>
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
          className={`volboost-input pr-20${showError ? " error" : isVerified ? " border-green-400" : ""}`}
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
      {isValid && value && !showError && !isVerified && !verifyFailed && (
        <p
          className="font-body text-xs mb-3 flex items-center gap-1.5"
          style={{ color: "rgba(0,255,136,0.7)" }}
        >
          <span>✓</span>
          <span>Valid format — click Verify Token to confirm on-chain</span>
        </p>
      )}
      {!showError && !(isValid && value) && !verifyFailed && (
        <div className="mb-3" />
      )}

      {/* Verify button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={!isValid || verifying || isVerified}
        className="w-full py-3 rounded-xl font-body font-semibold text-sm mb-4 border transition-smooth flex items-center justify-center gap-2"
        style={{
          borderColor: isVerified
            ? "rgba(0,255,136,0.5)"
            : verifyFailed
              ? "rgba(255,80,80,0.3)"
              : "rgba(0,255,136,0.15)",
          color: isVerified
            ? "#00ff88"
            : verifyFailed
              ? "#ff5050"
              : "rgba(255,255,255,0.4)",
          backgroundColor: isVerified
            ? "rgba(0,255,136,0.06)"
            : verifyFailed
              ? "rgba(255,80,80,0.03)"
              : "rgba(255,255,255,0.02)",
          opacity: !isValid && !isVerified ? 0.4 : 1,
          cursor: !isValid || isVerified ? "not-allowed" : "pointer",
        }}
        data-ocid="wizard.ca_verify_button"
      >
        {verifying ? (
          <>
            <span
              className="pulse-dot w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#00ff88" }}
            />
            <span className="font-mono text-xs">
              Looking up token on Pump.fun…
            </span>
          </>
        ) : isVerified ? (
          <>✓ Token verified on-chain</>
        ) : verifyFailed ? (
          <>⚠ Token not found — check your CA</>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              role="img"
              aria-label="Verify token"
            >
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="rgba(0,255,136,0.5)"
                strokeWidth="1.2"
              />
              <path
                d="M4.5 7L6.5 9L9.5 5"
                stroke="rgba(0,255,136,0.5)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Verify Token
          </>
        )}
      </button>

      {/* Error state */}
      {verifyFailed && (
        <div
          className="rounded-xl p-4 mb-4 flex items-start gap-3 border"
          style={{
            backgroundColor: "rgba(255,80,80,0.04)",
            borderColor: "rgba(255,80,80,0.25)",
          }}
          data-ocid="wizard.ca_verify.error_state"
        >
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p
              className="font-body text-sm font-semibold mb-0.5"
              style={{ color: "#ff5050" }}
            >
              Token not found on Solana
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "rgba(255,80,80,0.7)" }}
            >
              Please check the contract address and try again. Make sure you're
              using the correct CA from Pump.fun or your wallet.
            </p>
          </div>
        </div>
      )}

      {/* Verified token card */}
      {isVerified && verifiedToken && (
        <div
          className="rounded-2xl p-4 mb-5 border step-enter"
          style={{
            backgroundColor: "rgba(0,255,136,0.03)",
            borderColor: "rgba(0,255,136,0.35)",
            boxShadow:
              "0 0 24px rgba(0,255,136,0.08), inset 0 0 16px rgba(0,255,136,0.03)",
            backdropFilter: "blur(8px)",
          }}
          data-ocid="wizard.token_verified_card"
        >
          <div className="flex items-center gap-4">
            {/* Logo with glow ring */}
            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: "#00ff88",
                  border: "2px solid rgba(0,255,136,0.5)",
                  boxShadow:
                    "0 0 16px rgba(0,255,136,0.4), 0 0 32px rgba(0,255,136,0.15)",
                }}
              >
                <TokenLogo
                  logoURI={verifiedToken.logoURI}
                  symbol={verifiedToken.symbol}
                />
              </div>
              {/* Outer glow ring */}
              <div
                className="absolute -inset-1.5 rounded-full pointer-events-none"
                style={{
                  border: "1px solid rgba(0,255,136,0.2)",
                  animation: "greenGlow 2s ease-in-out infinite",
                }}
                aria-hidden
              />
            </div>

            {/* Token info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-display font-bold text-white text-base leading-tight truncate">
                  {verifiedToken.name}
                </span>
                {/* Source badge */}
                {verifiedToken.source === "pumpfun" ? (
                  <span
                    className="font-mono text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                    style={{
                      backgroundColor: "rgba(0,255,136,0.12)",
                      color: "#00ff88",
                      border: "1px solid rgba(0,255,136,0.3)",
                    }}
                    data-ocid="wizard.token_source_badge"
                  >
                    ✓ PUMP.FUN
                  </span>
                ) : (
                  <span
                    className="font-mono text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                    style={{
                      backgroundColor: "rgba(99,102,241,0.12)",
                      color: "#818cf8",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                    data-ocid="wizard.token_source_badge"
                  >
                    ✓ SOLANA
                  </span>
                )}
              </div>
              <p
                className="font-mono text-sm font-bold mb-2"
                style={{ color: "#00ff88" }}
              >
                ${verifiedToken.symbol}
              </p>
              {/* Metadata row */}
              <div className="flex items-center gap-2 flex-wrap">
                {verifiedToken.usdMarketCap != null &&
                  verifiedToken.usdMarketCap > 0 && (
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "rgba(0,255,136,0.06)",
                        color: "rgba(0,255,136,0.75)",
                        border: "1px solid rgba(0,255,136,0.15)",
                      }}
                    >
                      MC {formatUsdAmount(verifiedToken.usdMarketCap)}
                    </span>
                  )}
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Decimals: {verifiedToken.decimals}
                </span>
                <span
                  className="font-mono text-[10px] px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: "rgba(153,69,255,0.08)",
                    color: "rgba(153,69,255,0.8)",
                    border: "1px solid rgba(153,69,255,0.2)",
                  }}
                >
                  SPL Token
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue CTA */}
      <button
        type="button"
        className="btn-cta w-full py-4 rounded-xl font-display font-bold text-base tracking-wide"
        disabled={!isVerified}
        onClick={() => {
          if (!isVerified) {
            haptic("error");
            return;
          }
          haptic("select");
          onNext();
        }}
        data-ocid="wizard.ca_continue_button"
        style={
          !isVerified ? { opacity: 0.35, cursor: "not-allowed" } : undefined
        }
      >
        {isVerified ? "Continue →" : "Verify token to continue"}
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
        <span className="badge-capsule text-[10px]">STEP 2 / 5</span>
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
        <span className="badge-capsule text-[10px]">STEP 3 / 5</span>
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

      {/* PRIMARY: Payment instruction card */}
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

        <p
          className="font-mono text-[10px] tracking-widest mb-2 uppercase"
          style={{ color: "rgba(0,255,136,0.6)" }}
        >
          Send to This Wallet
        </p>

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
                aria-hidden
                role="presentation"
              >
                <title>Copied checkmark</title>
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
                aria-hidden
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

      {/* Order summary card */}
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

      {/* "I've Sent It" CTA — advances to TX hash step */}
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
            Registering order…
          </>
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden
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
            I've Sent the Payment →
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

/* ─── TX Hash Tooltip ────────────────────────────────────────────────────── */

function TxHashHelpTooltip({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="absolute left-0 right-0 z-50 rounded-xl p-4 border shadow-2xl step-enter"
      style={{
        backgroundColor: "#181818",
        borderColor: "rgba(0,255,136,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(0,255,136,0.08)",
        top: "calc(100% + 8px)",
      }}
      data-ocid="wizard.txhash_help.tooltip"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-display font-bold text-white text-sm">
          Where to find your TX Hash
        </p>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs transition-smooth ml-3 flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.4)" }}
          aria-label="Close tooltip"
          data-ocid="wizard.txhash_help.close_button"
        >
          ✕
        </button>
      </div>
      {[
        "1. Open your Solana wallet (Phantom, Solflare, etc.)",
        "2. Go to Transaction History or Activity",
        "3. Click your most recent outgoing transaction",
        "4. Copy the Signature / Hash shown at the top",
      ].map((step) => (
        <div key={step} className="flex items-start gap-2 mb-1.5">
          <span
            className="font-mono text-[10px] flex-shrink-0 mt-0.5"
            style={{ color: "#00ff88" }}
          >
            ▸
          </span>
          <span
            className="font-body text-xs"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Step 4: TX Hash Submission ─────────────────────────────────────────── */

export function WizardStep4TxHash({
  orderId,
  pkgIndex,
  onConfirmed,
}: {
  orderId: string;
  pkgIndex: number;
  onConfirmed: () => void;
}) {
  const [txHash, setTxHash] = useState("");
  const [touched, setTouched] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyState, setVerifyState] = useState<
    "idle" | "verifying" | "confirmed" | "not_found" | "rpc_error"
  >("idle");
  const [rpcErrorMsg, setRpcErrorMsg] = useState("");
  const [manualOverride, setManualOverride] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const submitTxHash = useSubmitTxHash();
  const verifyBoost = useVerifyBoost();
  const verifyTxOnChain = useVerifyTxOnChain();
  const pkg = VOLUME_PACKAGES[pkgIndex];

  const isValid = isValidTxHash(txHash);
  const showError = touched && txHash.length > 0 && !isValid;

  const canContinueAfterRpcError =
    verifyState === "rpc_error" && manualOverride;

  const handleVerify = async () => {
    if (!isValid || verifying) {
      if (!isValid) {
        haptic("error");
        setTouched(true);
      }
      return;
    }
    setVerifying(true);
    setVerifyState("verifying");
    setManualOverride(false);
    haptic("tap");
    try {
      const result = await verifyTxOnChain.mutateAsync({
        txHash: txHash.trim(),
      });
      if (result.kind === "confirmed") {
        await submitTxHash.mutateAsync({ orderId, txHash: txHash.trim() });
        await verifyBoost.mutateAsync({ orderId });
        setVerifyState("confirmed");
        haptic("confirm");
        toast.success("Transaction confirmed on-chain!", {
          description: "Your boost is now activating.",
        });
        setTimeout(() => onConfirmed(), 1800);
      } else if (result.kind === "not_found") {
        setVerifyState("not_found");
        haptic("error");
      } else {
        setVerifyState("rpc_error");
        setRpcErrorMsg(result.message);
        haptic("error");
      }
    } catch {
      setVerifyState("rpc_error");
      setRpcErrorMsg("Unexpected error reaching Solana network.");
      haptic("error");
    } finally {
      setVerifying(false);
    }
  };

  const handleManualContinue = async () => {
    if (!manualOverride) return;
    setVerifying(true);
    haptic("tap");
    try {
      await submitTxHash.mutateAsync({ orderId, txHash: txHash.trim() });
      await verifyBoost.mutateAsync({ orderId });
      setVerifyState("confirmed");
      haptic("confirm");
      toast.success("Order submitted!", {
        description: "We'll verify your transaction manually.",
      });
      setTimeout(() => onConfirmed(), 1800);
    } catch {
      haptic("error");
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="step-enter">
      <div className="mb-1 flex items-center gap-2">
        <span className="badge-capsule text-[10px]">STEP 4 / 5</span>
      </div>
      <h2 className="font-display text-xl font-bold text-white tracking-wider mb-1">
        CONFIRM YOUR PAYMENT
      </h2>
      <p
        className="font-body text-sm mb-6"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Paste your Solana transaction hash below. Your boost will only activate
        after we verify your payment on-chain.
      </p>

      {/* Order reminder */}
      <div
        className="rounded-xl px-4 py-3 mb-5 border flex items-center justify-between"
        style={{
          backgroundColor: "#111111",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div>
          <p
            className="font-mono text-[10px] tracking-wider mb-0.5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            ORDER
          </p>
          <p
            className="font-mono text-sm font-bold"
            style={{ color: "#00ff88" }}
          >
            #{orderId}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-mono text-[10px] tracking-wider mb-0.5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            AMOUNT
          </p>
          <p className="font-mono text-sm font-bold text-white">
            {pkg.solCostFmt}
          </p>
        </div>
      </div>

      {/* TX Hash input */}
      <p
        className="text-label mb-2"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        TRANSACTION HASH (TX HASH)
      </p>

      <div className="relative mb-2">
        <textarea
          className={`volboost-input resize-none${showError ? " error" : isValid && txHash ? " focused-green" : ""}`}
          rows={3}
          placeholder="Paste your Solana transaction signature here..."
          value={txHash}
          onChange={(e) => {
            setTxHash(e.target.value.trim());
            setVerifyState("idle");
            setManualOverride(false);
          }}
          onBlur={() => setTouched(true)}
          spellCheck={false}
          autoComplete="off"
          data-ocid="wizard.txhash_input"
          aria-label="Transaction hash"
          aria-invalid={showError}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            paddingBottom: "0.75rem",
          }}
          disabled={verifyState === "confirmed" || verifyState === "verifying"}
        />
      </div>

      {/* Inline validation */}
      {showError && (
        <p
          className="font-body text-xs mb-3 flex items-center gap-1.5"
          style={{ color: "#ff5050" }}
          data-ocid="wizard.txhash_input.field_error"
        >
          <span>⚠</span>
          <span>
            Invalid TX hash — must be 87–88 base58 chars (no 0, O, I, l)
          </span>
        </p>
      )}
      {isValid && txHash && !showError && verifyState === "idle" && (
        <p
          className="font-body text-xs mb-3 flex items-center gap-1.5"
          style={{ color: "rgba(0,255,136,0.7)" }}
        >
          <span>✓</span>
          <span>Valid TX hash format — click Verify to confirm on-chain</span>
        </p>
      )}
      {!showError && !(isValid && txHash) && verifyState === "idle" && (
        <div className="mb-3" />
      )}

      {/* Help link — relative positioned for tooltip */}
      <div className="relative mb-5">
        <button
          type="button"
          onClick={() => {
            setShowHelp(!showHelp);
            haptic("tap");
          }}
          className="font-body text-xs underline transition-smooth"
          style={{ color: "rgba(0,255,136,0.55)" }}
          data-ocid="wizard.txhash_help_link"
        >
          Where do I find my TX hash? →
        </button>
        <TxHashHelpTooltip open={showHelp} onClose={() => setShowHelp(false)} />
      </div>

      {/* Verification state feedback */}
      {verifyState === "verifying" && (
        <div
          className="rounded-xl p-4 mb-5 border flex items-center gap-3 step-enter"
          style={{
            backgroundColor: "rgba(0,255,136,0.03)",
            borderColor: "rgba(0,255,136,0.2)",
          }}
          data-ocid="wizard.txhash_verify.loading_state"
        >
          <span
            className="pulse-dot w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#00ff88" }}
          />
          <div>
            <p
              className="font-mono text-sm font-bold"
              style={{ color: "#00ff88" }}
            >
              Confirming transaction on Solana blockchain…
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Querying Solana mainnet. This takes a moment.
            </p>
          </div>
        </div>
      )}

      {verifyState === "confirmed" && (
        <div
          className="rounded-xl p-4 mb-5 border flex items-center gap-3 step-enter"
          style={{
            backgroundColor: "rgba(0,255,136,0.06)",
            borderColor: "rgba(0,255,136,0.4)",
          }}
          data-ocid="wizard.txhash_verify.success_state"
        >
          <div
            className="check-pop w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#00ff88",
              boxShadow: "0 0 16px rgba(0,255,136,0.5)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              role="img"
            >
              <title>Confirmed</title>
              <path
                d="M2.5 7L5.5 10L11 4"
                stroke="#0d0d0d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-white">
              Transaction Confirmed on-chain ✓
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Activating your boost now…
            </p>
          </div>
        </div>
      )}

      {verifyState === "not_found" && (
        <div
          className="rounded-xl p-4 mb-5 border flex items-start gap-3 step-enter"
          style={{
            backgroundColor: "rgba(255,80,80,0.04)",
            borderColor: "rgba(255,80,80,0.3)",
          }}
          data-ocid="wizard.txhash_verify.error_state"
        >
          <span className="text-lg flex-shrink-0">❌</span>
          <div>
            <p
              className="font-body text-sm font-semibold mb-1"
              style={{ color: "#ff5050" }}
            >
              Transaction not found on Solana blockchain
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "rgba(255,80,80,0.7)" }}
            >
              The TX hash was not found on Solana mainnet. Check your
              transaction history and paste the correct signature. Do not
              proceed until you have the right hash.
            </p>
          </div>
        </div>
      )}

      {verifyState === "rpc_error" && (
        <div
          className="rounded-xl p-4 mb-4 border step-enter"
          style={{
            backgroundColor: "rgba(255,170,0,0.04)",
            borderColor: "rgba(255,170,0,0.25)",
          }}
          data-ocid="wizard.txhash_verify.rpc_error_state"
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p
                className="font-body text-sm font-semibold mb-1"
                style={{ color: "#ffaa00" }}
              >
                Could not confirm transaction automatically
              </p>
              <p
                className="font-body text-xs"
                style={{ color: "rgba(255,170,0,0.7)" }}
              >
                {rpcErrorMsg || "Solana RPC returned an error."} Please
                double-check your TX hash on{" "}
                <a
                  href={`https://solscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#ffaa00" }}
                >
                  Solscan
                </a>{" "}
                before proceeding.
              </p>
            </div>
          </div>
          {/* Manual override checkbox */}
          <label
            className="flex items-start gap-3 cursor-pointer"
            data-ocid="wizard.txhash_manual_override"
          >
            <input
              type="checkbox"
              checked={manualOverride}
              onChange={(e) => {
                setManualOverride(e.target.checked);
                haptic("tap");
              }}
              className="mt-0.5 w-4 h-4 flex-shrink-0 accent-amber-400"
              data-ocid="wizard.txhash_manual_override.checkbox"
            />
            <span
              className="font-body text-xs"
              style={{ color: "rgba(255,170,0,0.85)" }}
            >
              I confirm I sent the correct amount (
              <strong>{pkg.solCostFmt}</strong>) to the correct wallet address
              and my TX hash is accurate.
            </span>
          </label>
        </div>
      )}

      {/* Verify button — shown unless already confirmed */}
      {verifyState !== "confirmed" && verifyState !== "rpc_error" && (
        <button
          type="button"
          className="btn-cta w-full py-4 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2.5"
          disabled={!isValid || verifying}
          onClick={handleVerify}
          data-ocid="wizard.txhash_verify_button"
          style={
            !isValid || verifying
              ? { opacity: 0.4, cursor: "not-allowed" }
              : { animation: "buttonGlowPulse 2s ease-in-out infinite" }
          }
        >
          {verifying ? (
            <>
              <svg
                className="spinner w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                role="img"
              >
                <title>Verifying</title>
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
              Confirming on Solana…
            </>
          ) : verifyState === "not_found" ? (
            <>🔍 Try Again</>
          ) : (
            <>🔍 Verify & Activate Boost</>
          )}
        </button>
      )}

      {/* Re-verify button when in not_found state for clarity */}
      {verifyState === "not_found" && (
        <p
          className="font-body text-xs text-center mt-3"
          style={{ color: "rgba(255,80,80,0.6)" }}
        >
          Fix your TX hash above, then click Try Again.
        </p>
      )}

      {/* Manual continue button — only for RPC error with override */}
      {verifyState === "rpc_error" && (
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            className="flex-1 py-3.5 rounded-xl font-body font-semibold text-sm border transition-smooth"
            onClick={() => {
              setVerifyState("idle");
              setManualOverride(false);
              haptic("tap");
            }}
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              background: "transparent",
            }}
            data-ocid="wizard.txhash_retry_button"
          >
            ← Re-enter Hash
          </button>
          <button
            type="button"
            className="flex-[2] py-3.5 rounded-xl font-display font-bold text-base transition-smooth flex items-center justify-center gap-2"
            disabled={!canContinueAfterRpcError || verifying}
            onClick={handleManualContinue}
            data-ocid="wizard.txhash_manual_continue_button"
            style={
              canContinueAfterRpcError && !verifying
                ? {
                    backgroundColor: "rgba(255,170,0,0.15)",
                    color: "#ffaa00",
                    border: "1.5px solid rgba(255,170,0,0.4)",
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.2)",
                    border: "1.5px solid rgba(255,255,255,0.08)",
                    cursor: "not-allowed",
                  }
            }
          >
            {verifying ? (
              <>
                <svg
                  className="spinner w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  role="img"
                >
                  <title>Submitting</title>
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,170,0,0.2)"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="#ffaa00"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Submitting…
              </>
            ) : (
              <>Submit Manually →</>
            )}
          </button>
        </div>
      )}
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
        const dist = 60 + (i % 3) * 15;
        const size = 4 + (i % 4);
        return (
          <div
            key={`p-${i}`}
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

/* ─── Step 5: Boost Confirmed ────────────────────────────────────────────── */

export function WizardStep5Confirm({
  pkgIndex,
  orderId,
  txHash,
  onRestart,
}: {
  pkgIndex: number;
  orderId: string;
  txHash: string;
  onRestart: () => void;
}) {
  const pkg = VOLUME_PACKAGES[pkgIndex];
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"Processing" | "Active">("Processing");
  const timestamp = new Date().toLocaleString();

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
      `TX Hash:  ${txHash ? formatAddress(txHash, 8, 8) : "N/A"}`,
      `Status:   ${status}`,
      `Time:     ${timestamp}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ].join("\n");
    navigator.clipboard.writeText(receipt).then(() => {
      haptic("tap");
      toast.success("Receipt copied!");
    });
  };

  const handleShare = () => {
    const text = encodeURIComponent(
      `🚀 My boost is LIVE! Order #${orderId}\n${pkg.targetVolumeFmt} volume boost running on @pumpdotfun\nPowered by Pump.Fun VolBoost ⚡ #Solana #PumpFun`,
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
          {
            label: "TX HASH",
            value: txHash ? formatAddress(txHash, 8, 8) : "—",
            mono: true,
          },
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
          background:
            "linear-gradient(135deg, #0f0f0f 0%, rgba(0,255,136,0.03) 100%)",
          borderColor: "rgba(0,255,136,0.12)",
        }}
        data-ocid="wizard.receipt_card"
      >
        <p className="font-body text-sm text-white mb-1 font-semibold">
          My boost is live! 🚀
        </p>
        <p
          className="font-mono text-xs mb-1"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {pkg.name} · {pkg.solCostFmt} · {pkg.targetVolumeFmt}
        </p>
        {txHash && (
          <p
            className="font-mono text-[10px] mb-3"
            style={{ color: "rgba(0,255,136,0.5)" }}
          >
            TX: {formatAddress(txHash, 8, 8)}
          </p>
        )}
        <p
          className="font-mono text-[10px] mb-3"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          {timestamp}
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
  const [verifiedToken, setVerifiedToken] = useState<TokenMetadata | null>(
    null,
  );
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [orderId, setOrderId] = useState(() => generateOrderId());
  const [txHash, setTxHash] = useState("");

  const completedSteps = Array.from(
    { length: step - 1 },
    (_, i) => (i + 1) as WizardStep,
  );

  const handleRestart = () => {
    setStep(1);
    setCA("");
    setVerifiedToken(null);
    setSelectedPkg(null);
    setOrderId(generateOrderId());
    setTxHash("");
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
            Boost your Solana meme coin in 5 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Wizard panel */}
          <div
            className="rounded-2xl p-6 sm:p-8 border"
            style={{
              backgroundColor: "#0f0f0f",
              borderColor:
                step === 1 || step === 5
                  ? "rgba(0,255,136,0.25)"
                  : "rgba(255,255,255,0.07)",
              ...(step === 1 || step === 5
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
                onChange={(v) => {
                  setCA(v);
                  setVerifiedToken(null);
                }}
                onNext={() => setStep(2)}
                onTokenVerified={setVerifiedToken}
                verifiedToken={verifiedToken}
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
              <WizardStep4TxHash
                orderId={orderId}
                pkgIndex={selectedPkg}
                onConfirmed={() => setStep(5)}
              />
            )}
            {step === 5 && selectedPkg !== null && (
              <WizardStep5Confirm
                pkgIndex={selectedPkg}
                orderId={orderId}
                txHash={txHash}
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
