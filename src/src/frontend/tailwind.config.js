/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["Figtree", "system-ui", "sans-serif"],
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
        /* Miner palette */
        coal:      "#0d0d0d",
        charcoal:  "#1a1a1a",
        steel:     "#2a2a2a",
        amber:     "#ffb000",
        copper:    "#b87333",
        silver:    "#c0c0c0",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "0",
      },
      boxShadow: {
        amber:     "0 0 20px rgba(255,176,0,0.5), 0 0 60px rgba(255,176,0,0.2)",
        "amber-lg": "0 0 40px rgba(255,176,0,0.7), 0 0 100px rgba(255,176,0,0.3)",
        copper:    "0 0 20px rgba(184,115,51,0.5), 0 0 60px rgba(184,115,51,0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
