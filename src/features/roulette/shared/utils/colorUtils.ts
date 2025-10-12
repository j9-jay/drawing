/**
 * Color utility functions for roulette game
 */

import { SECTOR_COLORS } from '../../game/constants/roulette';

/**
 * Generate a color from predefined palette based on index
 * @param index - The index to map to a color
 * @returns Hex color string
 */
export function generateColor(index: number): string {
  return SECTOR_COLORS[index % SECTOR_COLORS.length];
}
