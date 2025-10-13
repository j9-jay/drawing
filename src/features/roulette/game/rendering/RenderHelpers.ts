/**
 * Rendering helper functions
 * Pure functions that perform canvas drawing operations
 */

/**
 * Draw a glowing circle with shadow effect (for roulette border)
 * @param ctx - Canvas 2D rendering context
 * @param x - Center X coordinate
 * @param y - Center Y coordinate
 * @param radius - Circle radius
 * @param color - Glow color
 * @param thickness - Line thickness
 */
export function drawGlowingCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  thickness: number
): void {
  // Draw outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness + 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw inner bright circle
  ctx.shadowBlur = 5;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = thickness;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
