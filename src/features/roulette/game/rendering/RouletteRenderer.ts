/**
 * Roulette wheel rendering module
 * Handles drawing the roulette wheel, sectors, and participant names
 */

import { Participant, CameraState } from '../../shared/types/roulette';
import { generateColor } from '../../shared/utils/colorUtils';
import {
  WHEEL_RADIUS,
  WHEEL_RADIUS_VIEWPORT_RATIO,
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

interface SectorInfo {
  participant: Participant;
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  sectorAngle: number;
  color: string;
}

/**
 * RouletteRenderer class
 * Handles all Canvas 2D rendering for the roulette wheel
 */
export class RouletteRenderer {
  private ctx: CanvasRenderingContext2D;
  private currentRadius: number = WHEEL_RADIUS;
  private scaleFactor: number = 1;
  private lastFontRadius: number = WHEEL_RADIUS;
  private participantCacheKey: string = '';
  private sectorCache: SectorInfo[] = [];
  private fontSizeCache: Map<string, number> = new Map();

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  private updateWheelDimensions(canvasWidth: number, canvasHeight: number): void {
    const minDimension = Math.min(canvasWidth, canvasHeight);
    const dynamicRadius = Math.max(0, minDimension * WHEEL_RADIUS_VIEWPORT_RATIO);

    if (dynamicRadius > 0) {
      this.currentRadius = dynamicRadius;
      this.scaleFactor = this.currentRadius / WHEEL_RADIUS;
    } else {
      this.currentRadius = WHEEL_RADIUS;
      this.scaleFactor = 1;
    }

    if (Math.abs(this.currentRadius - this.lastFontRadius) > 0.5) {
      this.fontSizeCache.clear();
      this.lastFontRadius = this.currentRadius;
    }
  }

  private getScaledValue(value: number): number {
    return value * this.scaleFactor;
  }

  private updateSectorCache(participants: Participant[]): void {
    if (participants.length === 0) {
      if (this.sectorCache.length > 0) {
        this.sectorCache = [];
        this.participantCacheKey = '';
        this.fontSizeCache.clear();
      }
      return;
    }

    const key = participants.map((p) => `${p.name}:${p.weight}`).join('|');
    if (key === this.participantCacheKey) {
      return;
    }

    this.participantCacheKey = key;
    this.fontSizeCache.clear();

    const totalWeight = participants.reduce((sum, participant) => sum + participant.weight, 0);
    const fullCircle = Math.PI * 2;
    let accumulatedWeight = 0;

    this.sectorCache = participants.map((participant, index) => {
      const startRatio = totalWeight > 0 ? accumulatedWeight / totalWeight : 0;
      const endRatio = totalWeight > 0 ? (accumulatedWeight + participant.weight) / totalWeight : 0;
      const startAngle = fullCircle * startRatio;
      const endAngle = fullCircle * endRatio;
      const centerAngle = fullCircle * ((startRatio + endRatio) / 2);
      const sectorAngle = Math.max(0, endAngle - startAngle);
      accumulatedWeight += participant.weight;

      return {
        participant,
        startAngle,
        endAngle,
        centerAngle,
        sectorAngle,
        color: generateColor(index)
      };
    });
  }

  private getFontSizeCacheKey(name: string, sectorAngle: number): string {
    return `${name}:${sectorAngle.toFixed(6)}:${Math.round(this.currentRadius)}`;
  }

  private getFontSize(name: string, sectorAngle: number): number {
    const cacheKey = this.getFontSizeCacheKey(name, sectorAngle);
    const cached = this.fontSizeCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const computed = this.calculateFontSize(name, sectorAngle);
    this.fontSizeCache.set(cacheKey, computed);
    return computed;
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

    this.updateWheelDimensions(canvasWidth, canvasHeight);
    this.updateSectorCache(participants);

    // Calculate center with camera shake
    const centerX = canvasWidth / 2 + cameraState.shakeOffset.x;
    const centerY = canvasHeight / 2 + cameraState.shakeOffset.y;

    // Apply camera transform with zoom centered towards 3 o'clock (pointer position)
    this.ctx.save();

    // Zoom center point: offset towards 3 o'clock (right side)
    const zoomCenterX = centerX + this.currentRadius * ZOOM_OFFSET_RATIO;
    const zoomCenterY = centerY;

    this.ctx.translate(zoomCenterX, zoomCenterY);
    this.ctx.scale(cameraState.zoom, cameraState.zoom);
    this.ctx.translate(-zoomCenterX, -zoomCenterY);

    if (participants.length === 0 || this.sectorCache.length === 0) {
      this.renderEmptyWheel(centerX, centerY);
    } else {
      this.renderWheel(currentAngle, centerX, centerY);
      // Render pointer with current sector color
      const pointerColor = this.getCurrentSectorColor(currentAngle);
      this.renderPointer(centerX, centerY, pointerColor);
    }

    this.ctx.restore();
  }

  /**
   * Render the roulette wheel with sectors (weighted)
   */
  private renderWheel(
    currentAngle: number,
    centerX: number,
    centerY: number
  ): void {
    this.sectorCache.forEach((sector) => {
      const startAngle = sector.startAngle + currentAngle;
      const endAngle = startAngle + sector.sectorAngle;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, this.currentRadius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = sector.color;
      this.ctx.fill();
    });

    // Draw outer border with glowing effect
    drawGlowingCircle(
      this.ctx,
      centerX,
      centerY,
      this.currentRadius,
      WHEEL_GLOW_COLOR,
      Math.max(1, this.getScaledValue(WHEEL_BORDER_WIDTH))
    );

    this.sectorCache.forEach((sector) => {
      const fontSize = this.getFontSize(sector.participant.name, sector.sectorAngle);
      const centerAngle = sector.centerAngle + currentAngle;
      this.renderText(sector.participant.name, centerAngle, centerX, centerY, fontSize);
    });
  }

  /**
   * Public method to calculate font size for external use (e.g., zoom calculation)
   * @param name - Participant name
   * @param sectorAngle - Sector angle in radians
   * @returns Calculated font size in pixels
   */
  public calculateFontSizeForSector(name: string, sectorAngle: number): number {
    return this.getFontSize(name, sectorAngle);
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
    const textRadius = this.currentRadius * SECTOR_TEXT_RADIUS_RATIO;
    const minRadius = this.currentRadius * SECTOR_TEXT_MIN_RADIUS_RATIO;
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
    const maxTextWidth = this.currentRadius * (SECTOR_TEXT_RADIUS_RATIO - SECTOR_TEXT_MIN_RADIUS_RATIO);

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
    const textRadius = this.currentRadius * SECTOR_TEXT_RADIUS_RATIO;
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
  private getCurrentSectorColor(currentAngle: number): string {
    if (this.sectorCache.length === 0) return POINTER_COLOR;

    const fullCircle = Math.PI * 2;
    const relativeAngle = (fullCircle - currentAngle % fullCircle) % fullCircle;
    const EPSILON = 1e-10;

    for (const sector of this.sectorCache) {
      if (relativeAngle >= sector.startAngle - EPSILON && relativeAngle < sector.endAngle + EPSILON) {
        return sector.color;
      }
    }

    return this.sectorCache[this.sectorCache.length - 1].color;
  }

  /**
   * Render pointer (sharp triangle) outside the wheel at 3 o'clock position
   * Points inward towards the wheel center
   */
  private renderPointer(centerX: number, centerY: number, color: string): void {
    const pointerLength = this.getScaledValue(POINTER_SIZE);
    const pointerWidth = Math.max(8, this.getScaledValue(12));

    // Position pointer outside the wheel at 3 o'clock
    const pointerX = centerX + this.currentRadius + this.getScaledValue(POINTER_OFFSET);
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
    this.ctx.lineWidth = Math.max(1, this.getScaledValue(2));
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Render empty wheel placeholder
   */
  private renderEmptyWheel(centerX: number, centerY: number): void {
    // Draw empty circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.currentRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = EMPTY_WHEEL_FILL_COLOR;
    this.ctx.fill();
    this.ctx.strokeStyle = EMPTY_WHEEL_BORDER_COLOR;
    this.ctx.lineWidth = Math.max(1, this.getScaledValue(WHEEL_BORDER_WIDTH));
    this.ctx.stroke();

    // Draw placeholder text
    this.ctx.fillStyle = EMPTY_WHEEL_TEXT_COLOR;
    this.ctx.font = '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('참가자를 입력하세요', centerX, centerY);
  }
}
