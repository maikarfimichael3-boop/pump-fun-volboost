/* ─── Footer ────────────────────────────────────────────────────────────── */

const PAYMENT_WALLET = "LiNRXfwp681aF3uV5vtVEBrBLmQEx7d7Nr85gjfmkFY";
const PAYMENT_WALLET_SHORT = `${PAYMENT_WALLET.slice(0, 6)}...${PAYMENT_WALLET.slice(-6)}`;

const NAV_LINKS = [
  { label: "Dashboard", href: "#hero" },
  { label: "About Us", href: "#hero" },
  { label: "Terms", href: "#hero" },
  { label: "Support", href: "#how-it-works" },
  { label: "Help", href: "#how-it-works" },
];

function PFLogoSmall() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "#00ff88" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          fill="none"
          role="img"
          aria-labelledby="footer-pf-logo-title"
        >
          <title id="footer-pf-logo-title">Pump.Fun logo</title>
          <path
            d="M9 2L3 6v6l6 4 6-4V6L9 2z"
            fill="#0d0d0d"
            fillOpacity="0.85"
          />
          <circle cx="9" cy="9" r="2.5" fill="#0d0d0d" />
        </svg>
      </div>
      <span className="font-display font-bold text-white text-sm">
        Pump<span style={{ color: "#00ff88" }}>.Fun</span>{" "}
        <span
          className="badge-capsule text-[10px] ml-1 align-middle"
          style={{ verticalAlign: "middle" }}
        >
          VolBoost
        </span>
      </span>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const handleCopyWallet = async () => {
    if (typeof window !== "undefined" && "vibrate" in window.navigator) {
      window.navigator.vibrate(12);
    }
    try {
      await navigator.clipboard.writeText(PAYMENT_WALLET);
    } catch {
      // clipboard not available — silent fail
    }
  };

  return (
    <footer
      className="relative z-10 border-t"
      style={{
        backgroundColor: "#060606",
        borderColor: "rgba(255,255,255,0.06)",
      }}
      data-ocid="footer.section"
    >
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand + tagline */}
          <div className="flex flex-col gap-4">
            <PFLogoSmall />
            <p
              className="font-body text-xs leading-relaxed max-w-[220px]"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Professional Solana volume boosting tool. Get your token trending
              on Pump.fun fast.
            </p>
            {/* Social links */}
            <div
              className="flex items-center gap-3"
              data-ocid="footer.social_links"
            >
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-body text-[11px] font-bold transition-smooth hover:opacity-80"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                  background: "rgba(255,255,255,0.03)",
                }}
                data-ocid="footer.telegram_link"
                aria-label="Telegram"
              >
                ✈ Telegram
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-body text-[11px] font-bold transition-smooth hover:opacity-80"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                  background: "rgba(255,255,255,0.03)",
                }}
                data-ocid="footer.twitter_link"
                aria-label="Twitter / X"
              >
                𝕏 Twitter
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            <p
              className="font-body text-[10px] font-bold tracking-[0.2em] uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              Navigation
            </p>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-body text-xs transition-colors duration-200 hover:text-white w-fit"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    "vibrate" in window.navigator
                  ) {
                    window.navigator.vibrate(8);
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Payment wallet + Solana badge */}
          <div className="flex flex-col gap-4">
            <p
              className="font-body text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              Payment Address
            </p>
            <button
              type="button"
              onClick={handleCopyWallet}
              className="flex items-center gap-2 rounded-xl px-4 py-3 border text-left transition-smooth hover:opacity-80 group"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
              title="Click to copy wallet address"
              data-ocid="footer.payment_wallet_copy"
            >
              <code
                className="font-mono text-xs flex-1 truncate"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {PAYMENT_WALLET_SHORT}
              </code>
              <span
                className="font-body text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 opacity-0 group-hover:opacity-100 transition-smooth"
                style={{
                  backgroundColor: "rgba(0,255,136,0.15)",
                  color: "#00ff88",
                }}
              >
                COPY
              </span>
            </button>

            {/* Powered by Solana */}
            <div className="flex items-center gap-2 mt-1">
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
        </div>

        {/* Divider */}
        <div
          className="h-px mb-6"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
          }}
          aria-hidden
        />

        {/* Bottom row — disclaimer + copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p
            className="font-body text-[11px] leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Results may vary. Volume boosting is subject to network conditions.
            Not financial advice.
          </p>
          <p
            className="font-body text-xs flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-white"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      {/* Pump.Fun branding bar */}
      <div
        className="border-t"
        style={{
          borderColor: "rgba(0,255,136,0.12)",
          background:
            "linear-gradient(90deg, rgba(0,255,136,0.03) 0%, rgba(0,255,136,0.06) 50%, rgba(0,255,136,0.03) 100%)",
          boxShadow: "0 -1px 0 rgba(0,255,136,0.08) inset",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-3">
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,255,136,0.2))",
            }}
            aria-hidden
          />
          <div className="flex items-center gap-2.5">
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "#00ff88" }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 18 18"
                fill="none"
                role="img"
                aria-label="Pump.Fun logo"
              >
                <path
                  d="M9 2L3 6v6l6 4 6-4V6L9 2z"
                  fill="#0d0d0d"
                  fillOpacity="0.85"
                />
                <circle cx="9" cy="9" r="2.5" fill="#0d0d0d" />
              </svg>
            </span>
            <span
              className="font-mono text-[10px] font-bold tracking-[0.2em]"
              style={{ color: "rgba(0,255,136,0.5)" }}
            >
              PUMP.FUN VOLBOOST · SOLANA ECOSYSTEM TOOL
            </span>
          </div>
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,255,136,0.2), transparent)",
            }}
            aria-hidden
          />
        </div>
      </div>
    </footer>
  );
}
