/**
 * Minimap rendering helpers
 * Functions to render game elements on the minimap
 */

import { Fixture } from 'planck';
import { Marble } from '../../../shared/types';
import { GameWorld, Wall } from '../../../shared/types/gameObjects';
import { MinimapRenderers, ObjectStyles } from '../../../shared/rendering';
import { PIXELS_PER_METER } from '../constants/physics';

interface MinimapContext {
  ctx: CanvasRenderingContext2D;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Render walls on minimap
 */
export function renderMinimapWalls(gameWorld: GameWorld, context: MinimapContext): void {
  const walls = gameWorld.getWalls();
  const { ctx, scaleX, scaleY, offsetX, offsetY } = context;

  ctx.strokeStyle = ObjectStyles.wall.strokeColor;
  ctx.lineWidth = 1;
  ctx.shadowColor = ObjectStyles.wall.shadowColor;
  ctx.shadowBlur = 1;
  ctx.setLineDash([]);

  walls.forEach(wall => {
    if (!wall.body) return;
    const body = wall.body;
    const fixtures: Fixture[] = [];
    let fixture = body.getFixtureList();

    while (fixture) {
      fixtures.push(fixture);
      fixture = fixture.getNext();
    }

    fixtures.forEach((fixtureItem: Fixture) => {
      const shape = fixtureItem.getShape();
      if (shape.getType() === 'edge') {
        const edge = shape as any;
        const v1 = body.getWorldPoint(edge.m_vertex1);
        const v2 = body.getWorldPoint(edge.m_vertex2);

        const x1 = v1.x * PIXELS_PER_METER * scaleX + offsetX;
        const y1 = v1.y * PIXELS_PER_METER * scaleY + offsetY;
        const x2 = v2.x * PIXELS_PER_METER * scaleX + offsetX;
        const y2 = v2.y * PIXELS_PER_METER * scaleY + offsetY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });
  });

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Render obstacles on minimap
 */
export function renderMinimapObstacles(obstacles: any[], context: MinimapContext): void {
  const { ctx, scaleX, scaleY, offsetX, offsetY } = context;

  obstacles.forEach(obstacle => {
    const pos = obstacle.body.getPosition();
    const x = pos.x * PIXELS_PER_METER * scaleX + offsetX;
    const y = pos.y * PIXELS_PER_METER * scaleY + offsetY;

    if (obstacle.type === 'bubble') {
      // 통합 미니맵 렌더러 사용
      MinimapRenderers.bubble(ctx, x, y, Math.max(1, (obstacle.size || 0) * scaleX * 0.5));
    } else if (obstacle.type === 'rotatingBar') {
      // 통합 미니맵 렌더러 사용
      const barWidth = Math.max(1, (obstacle.size || 0) * scaleX);
      MinimapRenderers.rotatingBar(ctx, x, y, barWidth, obstacle.angle || 0);
    }
  });
}

/**
 * Render marbles on minimap
 */
export function renderMinimapMarbles(marbles: Marble[], context: MinimapContext): void {
  const { ctx, scaleX, scaleY, offsetX, offsetY } = context;

  marbles.forEach((marble, index) => {
    if (marble.finished || marble.isPreview) return;

    const body = marble.body;
    if (!body) return;

    const pos = body.getPosition();
    const x = pos.x * PIXELS_PER_METER * scaleX + offsetX;
    const y = pos.y * PIXELS_PER_METER * scaleY + offsetY;
    const radius = Math.max(1, 10 * scaleX);

    // Determine rank marker
    let rankSymbol = '';
    if (index === 0) rankSymbol = '👑';
    else if (index === 1) rankSymbol = '🥈';
    else if (index === 2) rankSymbol = '🥉';

    // Draw marble circle
    ctx.fillStyle = marble.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw rank symbol if applicable
    if (rankSymbol) {
      ctx.font = `${Math.max(8, 10 * scaleX)}px Arial`;
      ctx.fillText(rankSymbol, x - radius/2, y - radius * 1.5);
    }
  });
}

/**
 * Render camera viewport on minimap
 */
export function renderMinimapViewport(
  canvas: HTMLCanvasElement,
  cameraX: number,
  cameraY: number,
  cameraZoom: number,
  context: MinimapContext
): void {
  const { ctx, scaleX, scaleY, offsetX, offsetY } = context;

  const viewportWidth = canvas.width / cameraZoom;
  const viewportHeight = canvas.height / cameraZoom;

  const viewportMinimapX = (-cameraX) * scaleX + offsetX;
  const viewportMinimapY = (-cameraY) * scaleY + offsetY;
  const viewportMinimapWidth = viewportWidth * scaleX;
  const viewportMinimapHeight = viewportHeight * scaleY;

  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  ctx.strokeRect(
    viewportMinimapX,
    viewportMinimapY,
    viewportMinimapWidth,
    viewportMinimapHeight
  );

  ctx.setLineDash([]);
}
