# Design Brief: Pump.Fun VolBoost Terminal

**Purpose**: Native Pump.Fun volume boost tool — terminal-inspired crypto interface with iOS-smooth interactions and haptic feedback.

**Tone**: Confident terminal pro — bold electric lime green, coal black, technical precision. Premium mobile experience that feels like a native Pump.Fun extension.

**Differentiation**: Electric lime glow on every interactive state + monospace typography creates instant "native Pump.Fun extension" recognition. Subtle terminal grid backdrop. Spring-based animations with haptic feedback.

| Token | OKLCH | Hex | Role |
|-------|-------|-----|------|
| Background | 0.04 0 0 | #0d0d0d | Deep coal black — immersive dark environment |
| Foreground | 0.98 0 0 | #ffffff | Bright white — maximum contrast, readability |
| Card | 0.08 0 0 | #1a1a1a | Slightly elevated layer — card surfaces, containers |
| Primary/Accent | 0.79 0.265 150 | #00ff88 | Electric lime — interactive, CTA, status, glow |
| Muted | 0.22 0 0 | #3a3a3a | Mid-gray — secondary text, disabled, borders |
| Border | 0.18 0 0 | #2d2d2d | Subtle dark gray — dividers, edges |

**Typography**
- Display: Space Grotesk — hero text, section headers, terminal-style labels
- Body: General Sans — primary copy, descriptions, readable body text
- Mono: JetBrains Mono — data, inputs, technical fields, terminal elements, code
- Scale: Hero `4xl md:6xl bold`, h2 `2xl md:3xl`, label `xs md:sm uppercase tracking-widest`, body `sm md:base`

**Elevation & Depth**: Cards hover 4px on interaction. Green glow + lift on active states. Subtle terminal grid + radial gradients backdrop. No expensive drop shadows—all using green glow or elevation lift.

| Zone | Background | Border | Notes |
|------|------------|--------|-------|
| Header | `bg-card border-b` | `rgba(0,255,136,0.12)` | Pump.Fun logo, branding, Solana badge |
| Content | `bg-background` with grid + radial | None | Wizard steps, volume cards, data displays |
| Cards | `bg-card` rounded-lg | `rgba(0,255,136,0.15)` base | Interactive hover + lift, selected: glow animation |
| Footer | `bg-card border-t` | `rgba(0,255,136,0.12)` | "Powered by Solana", copyright |

**Component Patterns**
- Buttons: Lime `#00ff88` solid, hover lifts 3px + glow pulse, active shrinks, disabled opacity 0.4
- Cards: `bg-card` rounded-lg, `border-border`, interactive hover + 4px lift, selected states pulse with `card-green-glow`
- Inputs: `bg-input` monospace (`JetBrains Mono`), green focus glow (0 0 16px), error shake animation
- Badges: Green capsule pills `badge-capsule`, active: brighter bg + glow, uppercase monospace labels
- Step dots: 40px circles, inactive: gray outline, active: lime bg + glow pulse + scale 1.1, completed: green outline

**Motion & Haptic**
- Entrance: `springBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` — iOS spring feel
- Hover: `transition-spring 0.35s` for lift + scale, `transition-smooth 0.25s` for color/shadow
- Active: `greenGlow 2.2s` pulse, `stepDotPulse 1.4s`, `buttonGlowPulse 1.5s`
- Progress: `progressFill 2.5s` animated bar fill
- Haptic: Navigator vibration API on tap/select/confirm/error (40–80ms pulses)

**Layout Approach**
- Mobile-first vertical flow, responsive breakpoints sm/md/lg
- 5-step wizard with top progress bar + step dots
- Card-based tier selection, full-width on mobile, grid on tablet+
- Bottom-sheet style modals, smooth slide-in animations
- Generous padding (1.25rem–1.5rem) on cards, tight input padding (0.875rem)

**Constraints & Guardrails**
- All interactive elements vibrate on tap (haptic API)
- Terminal monospace `JetBrains Mono` for data/code/technical fields
- No animations when `prefers-reduced-motion`
- Bright green used sparingly — dominant black + white contrast baseline
- Premium shadows for elevation — no cheap drop shadows
- Every interactive state must have glow feedback (text-shadow or box-shadow with lime)
- Min 0.45 lightness diff on interactive surfaces (AA+ WCAG compliance)

**Signature Detail**: Bright lime glow animations pulse on every interactive state — from green-glowing card borders on selection to step-dot pulse to button hover glow to input focus glow — creates premium, cohesive terminal aesthetic that feels native to Pump.Fun ecosystem and professional Solana tooling.
