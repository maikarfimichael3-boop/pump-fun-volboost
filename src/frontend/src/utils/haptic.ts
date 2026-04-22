/* ─── Haptic feedback utility ───────────────────────────────────────────── */

type HapticType = "tap" | "select" | "confirm" | "error";

const PATTERNS: Record<HapticType, number[]> = {
  tap: [10],
  select: [15],
  confirm: [20, 60, 20],
  error: [40, 30, 40, 30, 40],
};

export function haptic(type: HapticType): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(PATTERNS[type]);
    } catch {
      // Silently ignore — vibration not supported
    }
  }
}
