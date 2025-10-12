/**
 * Roulette wheel rendering module
 * Handles drawing the roulette wheel, sectors, and participant names
 */

import { Participant, CameraState } from '../../shared/types/roulette';
import { generateColor } from '../../shared/utils/colorUtils';
import {
  WHEEL_RADIUS,
  CENTER_CIRCLE_RADIUS,
  WHEEL_BORDER_WIDTH,
  POINTER_SIZE,
  POINTER_COLOR,
  POINTER_ANGLE,
  SECTOR_TEXT_SIZE,
  SECTOR_TEXT_COLOR,
  SECTOR_TEXT_RADIUS_RATIO,
  SECTOR_BORDER_COLOR,
  WHEEL_OUTER_COLOR,
  CENTER_CIRCLE_COLOR,
  CENTER_CIRCLE_BORDER_COLOR,
  EMPTY_WHEEL_FILL_COLOR,
  EMPTY_WHEEL_BORDER_COLOR,
  EMPTY_WHEEL_TEXT_COLOR,
  POINTER_BORDER_COLOR
} from '../constants/roulette';

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

    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(cameraState.zoom, cameraState.zoom);
    this.ctx.translate(-centerX, -centerY);

    if (participants.length === 0) {
      this.renderEmptyWheel(centerX, centerY);
    } else {
      this.renderWheel(participants, currentAngle, centerX, centerY);
      this.renderPointer(centerX, centerY);
      this.renderCenterCircle(centerX, centerY);
    }

    this.ctx.restore();
  }

  /**
   * Render the roulette wheel with sectors
   */
  private renderWheel(
    participants: Participant[],
    currentAngle: number,
    centerX: number,
    centerY: number
  ): void {
    const sectorAngle = (Math.PI * 2) / participants.length;

    // Draw sectors
    participants.forEach((participant, index) => {
      const startAngle = index * sectorAngle + currentAngle;
      const endAngle = startAngle + sectorAngle;

      // Draw sector
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, WHEEL_RADIUS, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = generateColor(index);
      this.ctx.fill();

      // Draw sector border
      this.ctx.strokeStyle = SECTOR_BORDER_COLOR;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });

    // Draw outer border
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, WHEEL_RADIUS, 0, Math.PI * 2);
    this.ctx.strokeStyle = WHEEL_OUTER_COLOR;
    this.ctx.lineWidth = WHEEL_BORDER_WIDTH;
    this.ctx.stroke();

    // Draw participant names
    participants.forEach((participant, index) => {
      const centerAngle = index * sectorAngle + sectorAngle / 2 + currentAngle;
      this.renderText(participant.name, centerAngle, centerX, centerY);
    });
  }

  /**
   * Render participant name text
   */
  private renderText(
    name: string,
    angle: number,
    centerX: number,
    centerY: number
  ): void {
    const textRadius = WHEEL_RADIUS * SECTOR_TEXT_RADIUS_RATIO;
    const x = centerX + Math.cos(angle) * textRadius;
    const y = centerY + Math.sin(angle) * textRadius;

    this.ctx.save();
    this.ctx.translate(x, y);

    // Rotate text to be readable at 3 o'clock position
    let textAngle = angle;

    // Flip text if it's upside down (90° ~ 270°)
    if (textAngle > Math.PI / 2 && textAngle < (Math.PI * 3) / 2) {
      textAngle += Math.PI;
    }

    this.ctx.rotate(textAngle);

    // Draw text
    this.ctx.fillStyle = SECTOR_TEXT_COLOR;
    this.ctx.font = `bold ${SECTOR_TEXT_SIZE}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(name, 0, 0);

    this.ctx.restore();
  }

  /**
   * Render pointer (triangle) at 3 o'clock position
   */
  private renderPointer(centerX: number, centerY: number): void {
    const pointerX = centerX + WHEEL_RADIUS + 10;
    const pointerY = centerY;
    const size = POINTER_SIZE;

    this.ctx.save();
    this.ctx.translate(pointerX, pointerY);
    this.ctx.rotate(POINTER_ANGLE);

    // Draw triangle pointing left (towards wheel)
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-size, -size / 2);
    this.ctx.lineTo(-size, size / 2);
    this.ctx.closePath();

    this.ctx.fillStyle = POINTER_COLOR;
    this.ctx.fill();

    this.ctx.strokeStyle = POINTER_BORDER_COLOR;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Render center circle (decorative)
   */
  private renderCenterCircle(centerX: number, centerY: number): void {
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, CENTER_CIRCLE_RADIUS, 0, Math.PI * 2);
    this.ctx.fillStyle = CENTER_CIRCLE_COLOR;
    this.ctx.fill();
    this.ctx.strokeStyle = CENTER_CIRCLE_BORDER_COLOR;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
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
