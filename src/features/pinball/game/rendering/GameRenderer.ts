/**
 * Game rendering system
 * Handles all game rendering operations
 *
 * TODO (Phase 7 optimization):
 * - Add frustum culling for off-screen objects
 * - Cache DOM queries (fps-display, etc.)
 * - Optimize context save/restore usage
 * - Batch rendering by fillStyle/strokeStyle
 */

import { Fixture } from 'planck';
import { Marble } from '../../../shared/types';
import { GameWorld } from '../../../shared/types/gameObjects';
import { drawGlowingLine } from './RenderHelpers';
import { updateRotatingBars } from '../entities/ObstacleUpdater';
import { PIXELS_PER_METER } from '../constants/physics';
import {
  MAX_MARBLE_DISPLAY_NAME_LENGTH,
  MARBLE_NAME_TRUNCATE_THRESHOLD
} from '../constants/ui';

// FPS 계산을 위한 변수들
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

import {
  renderBounceCircle,
  renderJumpPad,
  renderBubble,
  renderRotatingBar,
  renderFinishLine as renderFinishLineShared
} from '../../../shared/rendering';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  cameraZoom: number;
  currentCameraX: number;
  currentCameraY: number;
  timeScale: number;
}

/**
 * FPS 계산 및 업데이트
 */
function updateFPS(): void {
  frameCount++;
  const now = performance.now();

  if (now - lastTime >= 1000) {
    fps = Math.round(frameCount * 1000 / (now - lastTime));
    frameCount = 0;
    lastTime = now;

    // HTML 엘리먼트 업데이트
    const fpsDisplay = document.getElementById('fps-display');
    if (fpsDisplay) {
      fpsDisplay.textContent = `FPS: ${fps}`;
    }
  }
}

/**
 * Main render loop
 */
export function render(
  context: RenderContext,
  gameWorld: GameWorld,
  marbles: Marble[],
  finishLine: number,
  renderCallback: () => void
): void {
  const { ctx, canvas, cameraZoom, currentCameraX, currentCameraY, timeScale } = context;

  // FPS 업데이트
  updateFPS();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update rotating bars continuously regardless of game state
  const rotatingBars = gameWorld.getRotatingBars();
  updateRotatingBars(rotatingBars as any, timeScale);

  // Apply smooth camera offset and zoom
  const cameraOffsetX = currentCameraX;
  const cameraOffsetY = currentCameraY;

  ctx.save();

  // Apply camera transform - simple and clear
  ctx.scale(cameraZoom, cameraZoom);
  ctx.translate(cameraOffsetX, cameraOffsetY);

  renderWalls(ctx, gameWorld);
  renderObstacles(ctx, gameWorld);
  renderSensors(ctx, gameWorld);
  renderMarbles(ctx, marbles);
  renderFinishLine(ctx, finishLine);

  ctx.restore();

  // Call additional rendering (minimap, etc)
  renderCallback();
}

/**
 * Render walls
 */
export function renderWalls(ctx: CanvasRenderingContext2D, gameWorld: GameWorld): void {
  const walls = gameWorld.getWalls();
  walls.forEach(wall => {
    if (!wall.body) return;
    // Render walls as glowing lines based on their physics bodies
    const body = wall.body;
    const fixtures: Fixture[] = [];
    let fixture = body.getFixtureList();

    while (fixture) {
      fixtures.push(fixture);
      fixture = fixture.getNext();
    }

    fixtures.forEach((fixture: Fixture) => {
      const shape = fixture.getShape();
      if (shape.getType() === 'edge') {
        // Render edge as glowing line
        const edge = shape as any;
        const v1 = body.getWorldPoint(edge.m_vertex1);
        const v2 = body.getWorldPoint(edge.m_vertex2);

        // Convert physics coordinates back to pixels for rendering
        const x1 = v1.x * PIXELS_PER_METER;
        const y1 = v1.y * PIXELS_PER_METER;
        const x2 = v2.x * PIXELS_PER_METER;
        const y2 = v2.y * PIXELS_PER_METER;

        drawGlowingLine(ctx, x1, y1, x2, y2, '#00ffff', 3);
      }
    });
  });
}

/**
 * Render obstacles
 */
export function renderObstacles(ctx: CanvasRenderingContext2D, gameWorld: GameWorld): void {
  // Render bubbles
  const bubbles = gameWorld.getBubbles();
  bubbles.forEach(bubble => {
    if (!bubble.body) return;
    const pos = bubble.body.getPosition();
    const x = pos.x * PIXELS_PER_METER;
    const y = pos.y * PIXELS_PER_METER;
    renderBubble(ctx, x, y, bubble.radius, bubble.popped, bubble.popAnimation || 0);
  });

  // Render rotating bars
  const rotatingBars = gameWorld.getRotatingBars();
  rotatingBars.forEach(bar => {
    if (!bar.body) return;
    const pos = bar.body.getPosition();
    const x = pos.x * PIXELS_PER_METER;
    const y = pos.y * PIXELS_PER_METER;
    renderRotatingBar(ctx, x, y, bar.length, bar.thickness, bar.body.getAngle());
  });
}


/**
 * Render sensors (bounce circles, jump pads)
 */
export function renderSensors(ctx: CanvasRenderingContext2D, gameWorld: GameWorld): void {
  // Render bounce circles
  const bounceCircles = gameWorld.getBounceCircles();
  bounceCircles.forEach(circle => {
    if (!circle.body) return;
    const pos = circle.body.getPosition();
    const x = pos.x * PIXELS_PER_METER;
    const y = pos.y * PIXELS_PER_METER;

    ctx.save();
    renderBounceCircle(ctx, x, y, circle.radius, circle.bounceAnimation);
    ctx.restore();
  });

  // Render jump pads (rectangles)
  const jumpPads = gameWorld.getJumpPads();
  jumpPads.forEach(pad => {
    if (!pad.body) return;
    const pos = pad.body.getPosition();
    const x = pos.x * PIXELS_PER_METER;
    const y = pos.y * PIXELS_PER_METER;

    ctx.save();
    renderJumpPad(ctx, x, y, pad.width, pad.height);
    ctx.restore();
  });
}

/**
 * Render marbles
 */
export function renderMarbles(ctx: CanvasRenderingContext2D, marbles: Marble[]): void {
  marbles.forEach(marble => {
    let x: number, y: number;

    if (marble.isPreview) {
      // Preview marbles have fixed position
      x = marble.position.x;
      y = marble.position.y;
    } else if (marble.finished) {
      // Don't render finished marbles (already removed from physics world)
      return;
    } else if (marble.body) {
      // Physics engine marbles
      const pos = marble.body.getPosition();
      x = pos.x * PIXELS_PER_METER;
      y = pos.y * PIXELS_PER_METER;
    } else {
      return; // No position info, don't render
    }

    // Draw marble
    ctx.beginPath();
    ctx.arc(x, y, marble.size, 0, Math.PI * 2);
    ctx.fillStyle = marble.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw name
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.min(marble.size / 2, 16)}px Arial`; // Increased font size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    const displayName = marble.name.length > MARBLE_NAME_TRUNCATE_THRESHOLD
      ? marble.name.substring(0, MAX_MARBLE_DISPLAY_NAME_LENGTH)
      : marble.name;
    ctx.strokeText(displayName, x, y);
    ctx.fillText(displayName, x, y);
  });
}

/**
 * Render finish line (센서로만 작동, 시각적 렌더링 없음)
 */
export function renderFinishLine(ctx: CanvasRenderingContext2D, finishLine: number): void {
  // 피니시 라인은 물리 엔진의 센서로만 작동
  // 시각적으로 렌더링하지 않음
  return;
}
