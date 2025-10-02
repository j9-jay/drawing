/**
 * Color utility functions for the game
 */

/**
 * Generate a color from predefined palette based on index
 * @param index - The index to map to a color
 * @returns Hex color string
 */
export function generateColor(index: number): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', '#F0932B',
    '#EB4D4B', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E',
    '#00B894', '#00CEC9', '#0984E3', '#6C5CE7', '#A29BFE'
  ];
  return colors[index % colors.length];
}