/**
 * Helpers for presenting user-facing speed values.
 */

const SPEED_LABELS: Record<number, string> = {
  0.1: 'Very Slow',
  0.2: 'Slow',
  0.3: 'Normal',
  0.4: 'Fast',
  0.5: 'Very Fast'
};

/**
 * Convert a numeric speed multiplier into a human friendly label.
 * Values outside the known set fall back to "0.0x" formatting.
 */
export function formatSpeedLabel(speed: number): string {
  return SPEED_LABELS[speed];
}
