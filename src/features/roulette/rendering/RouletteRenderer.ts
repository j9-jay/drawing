/**
 * Canvas 2D Renderer for Roulette Wheel
 * Handles all drawing operations: wheel, sectors, text, pointer
 */

import {
  WHEEL_RADIUS,
  CENTER_CIRCLE_RADIUS,
  WHEEL_BORDER_WIDTH,
  POINTER_SIZE,
  POINTER_COLOR,
  POINTER_ANGLE,
  SECTOR_COLORS,
  SECTOR_TEXT_SIZE,
  SECTOR_TEXT_COLOR,
  SECTOR_TEXT_RADIUS_RATIO
} from '../game/constants/roulette';
import { Participant, CameraState } from '../shared/types/roulette';

export class RouletteRenderer {
  private ctx: CanvasRenderingContext2D;
  private centerX: number = 0;
  private centerY: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Main render method
   * @param participants - List of participants
   * @param currentAngle - Current rotation angle (rad)
   * @param cameraState - Camera zoom and shake state
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
    this.centerX = canvasWidth / 2 + cameraState.shakeOffset.x;
    this.centerY = canvasHeight / 2 + cameraState.shakeOffset.y;

    // Save context for zoom transform
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.scale(cameraState.zoom, cameraState.zoom);
    this.ctx.translate(-this.centerX, -this.centerY);

    // Render order: wheel → pointer → center circle
    this.renderWheel(participants, currentAngle);
    this.renderPointer();
    this.renderCenterCircle();

    // Restore context
    this.ctx.restore();
  }

  /**
   * Render roulette wheel with sectors
   * @param participants - List of participants
   * @param currentAngle - Current rotation angle (rad)
   */
  private renderWheel(participants: Participant[], currentAngle: number): void {
    if (participants.length === 0) {
      this.renderEmptyWheel();
      return;
    }

    const sectorCount = participants.length;
    const sectorAngle = (Math.PI * 2) / sectorCount; // Angle per sector (rad)

    // Render each sector
    for (let i = 0; i < sectorCount; i++) {
      // Calculate start and end angles
      const startAngle = i * sectorAngle + currentAngle;
      const endAngle = (i + 1) * sectorAngle + currentAngle;
      const centerAngle = startAngle + sectorAngle / 2;

      // Select color
      const color = SECTOR_COLORS[i % SECTOR_COLORS.length];

      // Draw sector
      this.drawSector(startAngle, endAngle, color);

      // Draw sector border line
      this.drawSectorLine(startAngle);

      // Draw participant name
      this.drawSectorText(participants[i].name, centerAngle, sectorAngle);
    }

    // Draw outer border
    this.drawWheelBorder();
  }

  /**
   * Draw a single sector (filled arc)
   * @param startAngle - Start angle (rad)
   * @param endAngle - End angle (rad)
   * @param color - Fill color
   */
  private drawSector(startAngle: number, endAngle: number, color: string): void {
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.arc(this.centerX, this.centerY, WHEEL_RADIUS, startAngle, endAngle);
    this.ctx.closePath();

    this.ctx.fillStyle = color;
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Draw sector divider line
   * @param angle - Line angle (rad)
   */
  private drawSectorLine(angle: number): void {
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    const endX = this.centerX + Math.cos(angle) * WHEEL_RADIUS;
    const endY = this.centerY + Math.sin(angle) * WHEEL_RADIUS;
    this.ctx.lineTo(endX, endY);

    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draw participant name on sector
   * @param text - Participant name
   * @param centerAngle - Sector center angle (rad)
   * @param sectorAngle - Sector angle (rad)
   */
  private drawSectorText(text: string, centerAngle: number, sectorAngle: number): void {
    this.ctx.save();

    // Calculate text position (70% of radius)
    const textRadius = WHEEL_RADIUS * SECTOR_TEXT_RADIUS_RATIO;
    const x = this.centerX + Math.cos(centerAngle) * textRadius;
    const y = this.centerY + Math.sin(centerAngle) * textRadius;

    // Move to text position
    this.ctx.translate(x, y);

    // Rotate text to be readable from pointer direction
    let textAngle = centerAngle;

    // Flip text if upside down (between 90° and 270°)
    if (textAngle > Math.PI / 2 && textAngle < (Math.PI * 3) / 2) {
      textAngle += Math.PI; // Rotate 180°
    }

    this.ctx.rotate(textAngle);

    // Draw text
    this.ctx.fillStyle = SECTOR_TEXT_COLOR;
    this.ctx.font = `bold ${SECTOR_TEXT_SIZE}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Add shadow for readability
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;

    // Truncate long names
    const maxLength = 10;
    const displayText = text.length > maxLength ? text.substring(0, maxLength - 1) + '…' : text;
    this.ctx.fillText(displayText, 0, 0);

    this.ctx.restore();
  }

  /**
   * Draw wheel outer border
   */
  private drawWheelBorder(): void {
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, WHEEL_RADIUS, 0, Math.PI * 2);

    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = WHEEL_BORDER_WIDTH;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draw pointer (triangle) at 3 o'clock position
   * Pointer is fixed, wheel rotates underneath
   */
  private renderPointer(): void {
    this.ctx.save();

    // Pointer position: 3 o'clock (90° = π/2 rad)
    const pointerX = this.centerX + Math.cos(POINTER_ANGLE) * WHEEL_RADIUS;
    const pointerY = this.centerY + Math.sin(POINTER_ANGLE) * WHEEL_RADIUS;

    // Draw triangle pointing inward
    this.ctx.beginPath();
    this.ctx.moveTo(pointerX + POINTER_SIZE, pointerY); // Tip (pointing left)
    this.ctx.lineTo(pointerX, pointerY - POINTER_SIZE / 2); // Top corner
    this.ctx.lineTo(pointerX, pointerY + POINTER_SIZE / 2); // Bottom corner
    this.ctx.closePath();

    // Fill
    this.ctx.fillStyle = POINTER_COLOR;
    this.ctx.fill();

    // Border
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Draw center circle (decorative)
   */
  private renderCenterCircle(): void {
    this.ctx.save();

    // Outer circle
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, CENTER_CIRCLE_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Inner circle (3D effect)
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, CENTER_CIRCLE_RADIUS / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Render empty wheel (no participants)
   */
  private renderEmptyWheel(): void {
    this.ctx.save();

    // Draw gray circle
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, WHEEL_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = '#E0E0E0';
    this.ctx.fill();

    // Draw border
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = WHEEL_BORDER_WIDTH;
    this.ctx.stroke();

    // Draw placeholder text
    this.ctx.fillStyle = '#999999';
    this.ctx.font = 'bold 24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('참가자를 추가하세요', this.centerX, this.centerY);

    this.ctx.restore();
  }
}
