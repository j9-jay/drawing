/**
 * Helpers for presenting user-facing speed values.
 * Returns translation keys instead of hardcoded strings for i18n support.
 */

const SPEED_LABEL_KEYS: Record<number, string> = {
  0.1: 'speedVerySlow',
  0.2: 'speedSlow',
  0.3: 'speedNormal',
  0.4: 'speedFast',
  0.5: 'speedVeryFast'
};

/**
 * Convert a numeric speed multiplier into a translation key.
 * Returns the translation key to be used with the i18n system.
 */
export function formatSpeedLabel(speed: number): string {
  return SPEED_LABEL_KEYS[speed] || 'speedNormal';
}
