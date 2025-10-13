/**
 * Roulette wheel rendering module
 * Handles drawing the roulette wheel, sectors, and participant names
 */

import { Participant, CameraState } from '../../shared/types/roulette';
import { generateColor } from '../../shared/utils/colorUtils';
import {
  WHEEL_RADIUS,
  WHEEL_BORDER_WIDTH,
  WHEEL_GLOW_COLOR,
  POINTER_SIZE,
  POINTER_COLOR,
  POINTER_OFFSET,
  SECTOR_TEXT_COLOR,
  SECTOR_TEXT_RADIUS_RATIO,
  SECTOR_TEXT_MIN_RADIUS_RATIO,
  EMPTY_WHEEL_FILL_COLOR,
  EMPTY_WHEEL_BORDER_COLOR,
  EMPTY_WHEEL_TEXT_COLOR,
  POINTER_BORDER_COLOR
} from '../constants/roulette';
import { ZOOM_OFFSET_RATIO } from '../constants/camera';
import { drawGlowingCircle } from './RenderHelpers';

/**
 * RouletteRenderer class
 * Handles all Canvas 2D rendering for the roulette wheel
 */
export class RouletteRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Main render method
   * @param participants - List of participants
   * @param currentAngle - Current rotation angle in radians
   * @param cameraState - Camera state (zoom, shake)
   * @param canvasWidth - Canvas width
   * @param canvasHeight - Canvas height
   */
  render(
    participants: Participant[],
    currentAngle: number,
    cameraState: CameraState,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate center with camera shake
    const centerX = canvasWidth / 2 + cameraState.shakeOffset.x;
    const centerY = canvasHeight / 2 + cameraState.shakeOffset.y;

    // Apply camera transform with zoom centered towards 3 o'clock (pointer position)
    this.ctx.save();

    // Zoom center point: offset towards 3 o'clock (right side)
    const zoomCenterX = centerX + WHEEL_RADIUS * ZOOM_OFFSET_RATIO;
    const zoomCenterY = centerY;

    this.ctx.translate(zoomCenterX, zoomCenterY);
    this.ctx.scale(cameraState.zoom, cameraState.zoom);
    this.ctx.translate(-zoomCenterX, -zoomCenterY);

    if (participants.length === 0) {
      this.renderEmptyWheel(centerX, centerY);
    } else {
      this.renderWheel(participants, currentAngle, centerX, centerY);
      // Render pointer with current sector color
      const pointerColor = this.getCurrentSectorColor(participants, currentAngle);
      this.renderPointer(centerX, centerY, pointerColor);
    }

    this.ctx.restore();
  }

  /**
   * Render the roulette wheel with sectors (weighted)
   */
  private renderWheel(
    participants: Participant[],
    currentAngle: number,
    centerX: number,
    centerY: number
  ): void {
    // Calculate total weight
    const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
    const fullCircle = Math.PI * 2;

    // Draw weighted sectors
    // Use accumulated weight to avoid floating-point precision errors
    let accumulatedWeight = 0;
    participants.forEach((participant, index) => {
      // Calculate sector boundaries based on accumulated weight
      const startRatio = accumulatedWeight / totalWeight;
      const endRatio = (accumulatedWeight + participant.weight) / totalWeight;

      const startAngle = fullCircle * startRatio + currentAngle;
      const endAngle = fullCircle * endRatio + currentAngle;

      // Draw sector (without border)
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, WHEEL_RADIUS, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = generateColor(index);
      this.ctx.fill();

      accumulatedWeight += participant.weight;
    });

    // Draw outer border with glowing effect (cyan like pinball edges)
    drawGlowingCircle(this.ctx, centerX, centerY, WHEEL_RADIUS, WHEEL_GLOW_COLOR, WHEEL_BORDER_WIDTH);

    // Draw participant names with dynamic font size
    // Use accumulated weight to avoid floating-point precision errors
    accumulatedWeight = 0;
    participants.forEach((participant) => {
      const startRatio = accumulatedWeight / totalWeight;
      const endRatio = (accumulatedWeight + participant.weight) / totalWeight;
      const sectorAngle = fullCircle * (endRatio - startRatio);

      // Calculate appropriate font size for this sector and text
      const fontSize = this.calculateFontSize(participant.name, sectorAngle);

      // Text at center of sector
      const centerRatio = (startRatio + endRatio) / 2;
      const centerAngle = fullCircle * centerRatio + currentAngle;
      this.renderText(participant.name, centerAngle, centerX, centerY, fontSize);

      accumulatedWeight += participant.weight;
    });
  }

  /**
   * Public method to calculate font size for external use (e.g., zoom calculation)
   * @param name - Participant name
   * @param sectorAngle - Sector angle in radians
   * @returns Calculated font size in pixels
   */
  public calculateFontSizeForSector(name: string, sectorAngle: number): number {
    return this.calculateFontSize(name, sectorAngle);
  }

  /**
   * Calculate optimal font size to fit text within sector
   * Pure calculation-based sizing with NO hardcoded limits
   * Considers arc width, radial height, and center protection constraints
   *
   * @param name - Participant name to render
   * @param sectorAngle - Sector angle in radians
   * @returns Optimal font size in pixels
   */
  private calculateFontSize(name: string, sectorAngle: number): number {
    // Calculate available space for text
    const textRadius = WHEEL_RADIUS * SECTOR_TEXT_RADIUS_RATIO;
    const minRadius = WHEEL_RADIUS * SECTOR_TEXT_MIN_RADIUS_RATIO;
    const halfAngle = sectorAngle / 2;

    // Constraint 1: Text height (vertical in rotated coordinate)
    // Text starts at textRadius and can extend inward toward minRadius
    // Use weighted average: 20% outer (textRadius) + 80% inner (minRadius)
    // More conservative toward inner edge where sector narrows
    const avgRadius = textRadius * 0.01 + minRadius * 0.99;
    const sectorWidthAtAvgRadius = 2 * avgRadius * Math.sin(halfAngle);
    const availableHeight = sectorWidthAtAvgRadius * 1.5; // Use 110% for more aggressive filling

    // Constraint 2: Text width (horizontal in rotated coordinate)
    // Text is right-aligned at textRadius, grows inward
    // Must not pass center protection zone (SECTOR_TEXT_MIN_RADIUS_RATIO)
    const maxTextWidth = WHEEL_RADIUS * (SECTOR_TEXT_RADIUS_RATIO - SECTOR_TEXT_MIN_RADIUS_RATIO);

    // Initial guess
    const initialGuess = Math.min(
      maxTextWidth / name.length * 1.5,
      availableHeight * 1.2
    );

    // Binary search for optimal font size (no artificial limits)
    let low = 4; // Absolute minimum (below this is unreadable)
    let high = Math.max(initialGuess * 2, 100); // Start high enough

    while (high - low > 0.5) {
      const fontSize = (low + high) / 2;
      this.ctx.font = `bold ${fontSize}px sans-serif`;
      const textWidth = this.ctx.measureText(name).width;
      const textHeight = fontSize * 1.2; // Bold font actual height with margins

      // Check constraints
      const fitsWidth = textWidth <= maxTextWidth;
      const fitsHeight = textHeight <= availableHeight;

      if (fitsWidth && fitsHeight) {
        low = fontSize; // Text fits, try larger
      } else {
        high = fontSize; // Text too big, try smaller
      }
    }

    // Return the largest size that fits (rounded)
    return Math.max(4, Math.floor(low));
  }

  /**
   * Render participant name text inside sector
   * Text is right-aligned so it grows inward (away from wheel edge)
   */
  private renderText(
    name: string,
    angle: number,
    centerX: number,
    centerY: number,
    fontSize: number
  ): void {
    const textRadius = WHEEL_RADIUS * SECTOR_TEXT_RADIUS_RATIO;
    const x = centerX + Math.cos(angle) * textRadius;
    const y = centerY + Math.sin(angle) * textRadius;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Rotate by sector angle (no flipping, allow upside down text)
    this.ctx.rotate(angle);

    // Draw text with RIGHT alignment (fixed)
    // Text starts from inner radius and grows outward
    this.ctx.fillStyle = SECTOR_TEXT_COLOR;
    this.ctx.font = `bold ${fontSize}px sans-serif`;
    this.ctx.textAlign = 'right'; // Fixed right alignment
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(name, 0, 0);

    this.ctx.restore();
  }

  /**
   * Get the color of the sector currently pointed to by the pointer
   * Pointer is at 3 o'clock (0 radians), so we need to find which sector is there
   * Wheel rotates by currentAngle, so we need to check which sector is at pointer position
   * Now supports weighted sectors
   */
  private getCurrentSectorColor(participants: Participant[], currentAngle: number): string {
    if (participants.length === 0) return POINTER_COLOR;

    // Pointer is at 0 radians (3 o'clock)
    // Wheel has rotated by currentAngle
    // To find which sector is at the pointer, we need to check which sector
    // is at relative position -currentAngle (or 2π - currentAngle)
    const fullCircle = Math.PI * 2;
    const relativeAngle = (fullCircle - currentAngle % fullCircle) % fullCircle;

    // Calculate total weight
    const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);

    // Small epsilon for floating-point comparison
    const EPSILON = 1e-10;

    // Find which weighted sector the pointer is in
    let accumulatedWeight = 0;
    for (let i = 0; i < participants.length; i++) {
      const startRatio = accumulatedWeight / totalWeight;
      const endRatio = (accumulatedWeight + participants[i].weight) / totalWeight;

      const startAngle = fullCircle * startRatio;
      const endAngle = fullCircle * endRatio;

      if (relativeAngle >= startAngle - EPSILON && relativeAngle < endAngle + EPSILON) {
        return generateColor(i);
      }

      accumulatedWeight += participants[i].weight;
    }

    // Fallback to last sector (should not reach here)
    return generateColor(participants.length - 1);
  }

  /**
   * Render pointer (sharp triangle) outside the wheel at 3 o'clock position
   * Points inward towards the wheel center
   */
  private renderPointer(centerX: number, centerY: number, color: string): void {
    const pointerLength = POINTER_SIZE;
    const pointerWidth = 12; // Width at the base

    // Position pointer outside the wheel at 3 o'clock
    const pointerX = centerX + WHEEL_RADIUS + POINTER_OFFSET;
    const pointerY = centerY;

    this.ctx.save();
    this.ctx.translate(pointerX, pointerY);

    // Draw sharp triangle pointing left (towards wheel center)
    this.ctx.beginPath();
    this.ctx.moveTo(-pointerLength, 0); // Tip pointing inward (left)
    this.ctx.lineTo(0, -pointerWidth / 2); // Top of base
    this.ctx.lineTo(0, pointerWidth / 2); // Bottom of base
    this.ctx.closePath();

    this.ctx.fillStyle = color;
    this.ctx.fill();

    this.ctx.strokeStyle = POINTER_BORDER_COLOR;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Render empty wheel placeholder
   */
  private renderEmptyWheel(centerX: number, centerY: number): void {
    // Draw empty circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, WHEEL_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = EMPTY_WHEEL_FILL_COLOR;
    this.ctx.fill();
    this.ctx.strokeStyle = EMPTY_WHEEL_BORDER_COLOR;
    this.ctx.lineWidth = WHEEL_BORDER_WIDTH;
    this.ctx.stroke();

    // Draw placeholder text
    this.ctx.fillStyle = EMPTY_WHEEL_TEXT_COLOR;
    this.ctx.font = '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('참가자를 입력하세요', centerX, centerY);
  }
}
