/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body:    ["'General Sans'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        background:              "oklch(var(--background))",
        foreground:              "oklch(var(--foreground))",
        card:                    "oklch(var(--card))",
        "card-foreground":       "oklch(var(--card-foreground))",
        primary:                 "oklch(var(--primary))",
        "primary-foreground":    "oklch(var(--primary-foreground))",
        secondary:               "oklch(var(--secondary))",
        "secondary-foreground":  "oklch(var(--secondary-foreground))",
        muted:                   "oklch(var(--muted))",
        "muted-foreground":      "oklch(var(--muted-foreground))",
        accent:                  "oklch(var(--accent))",
        "accent-foreground":     "oklch(var(--accent-foreground))",
        border:                  "oklch(var(--border))",
        input:                   "oklch(var(--input))",
        ring:                    "oklch(var(--ring))",
        /* VolBoost palette */
        coal:        "#0d0d0d",
        charcoal:    "#1a1a1a",
        steel:       "#2a2a2a",
        lime:        "#00ff88",
        "lime-dark": "#00cc6f",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "0",
      },
      boxShadow: {
        "green":       "0 0 16px rgba(0,255,136,0.3), 0 0 40px rgba(0,255,136,0.1)",
        "green-lg":    "0 0 28px rgba(0,255,136,0.5), 0 0 60px rgba(0,255,136,0.2)",
        "green-glow":  "0 0 32px rgba(0,255,136,0.6), inset 0 0 16px rgba(0,255,136,0.15)",
        "subtle":      "0 1px 8px rgba(0,0,0,0.4)",
        "elevated":    "0 8px 24px rgba(0,0,0,0.6)",
        "terminal":    "0 0 20px rgba(0,255,136,0.3), 0 4px 12px rgba(0,0,0,0.5)",
      },
      keyframes: {
        greenGlow: {
          "0%, 100%": {
            boxShadow: "0 0 16px rgba(0,255,136,0.5), inset 0 0 10px rgba(0,255,136,0.1), 0 0 40px rgba(0,255,136,0.08)"
          },
          "50%": {
            boxShadow: "0 0 28px rgba(0,255,136,0.7), inset 0 0 16px rgba(0,255,136,0.15), 0 0 60px rgba(0,255,136,0.12)"
          }
        },
        slideInUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" }
        },
        springBounce: {
          "0%": { transform: "scale(0.95) translateY(8px)", opacity: "0" },
          "70%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" }
        },
        progressFill: {
          from: { width: "0%" },
          to:   { width: "68%" }
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.5", transform: "scale(0.85)" }
        },
        buttonGlowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,255,136,0.4)" },
          "50%": { boxShadow: "0 0 32px rgba(0,255,136,0.6)" }
        },
        stepDotPulse: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(0,255,136,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(0,255,136,0.7)" }
        }
      },
      animation: {
        "slide-in":       "slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "spring-bounce":  "springBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "green-glow":     "greenGlow 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "progress-fill":  "progressFill 2.5s cubic-bezier(0.4,0,0.2,1) forwards",
        "pulse-dot":      "pulseDot 1.4s ease-in-out infinite",
        "button-glow":    "buttonGlowPulse 1.5s ease-in-out",
        "step-dot-pulse": "stepDotPulse 1.4s ease-in-out infinite",
      }
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
