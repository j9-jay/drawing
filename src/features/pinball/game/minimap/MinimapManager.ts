/**
 * Minimap management system
 * Handles minimap rendering and interaction
 */

import { Fixture } from 'planck';
import { Marble } from '../../shared/types';
import { GameWorld } from '../../shared/types/gameObjects';
import { MinimapRenderers } from '../../shared/rendering';
import { PIXELS_PER_METER } from '../constants/physics';
import { CAMERA_VIEWPORT_CENTER_RATIO } from '../constants/camera';
import { FINISH_LINE_BUFFER } from '../constants/map';

// eslint-disable-next-line no-unused-vars
type CameraUpdateFn = (x: number, y: number) => void;
// eslint-disable-next-line no-unused-vars
type MinimapHoverSetter = (hovered: boolean, mouseX?: number, mouseY?: number) => void;

export interface MinimapConfig {
  minimapCanvas: HTMLCanvasElement;
  minimapCtx: CanvasRenderingContext2D;
  gameAreaBounds: { minX: number; maxX: number; minY: number; maxY: number };
  finishLine: number;
  cameraZoom: number;
  currentCameraX: number;
  currentCameraY: number;
  canvas: HTMLCanvasElement;
  minimapMouseX: number;
  minimapMouseY: number;
  isMinimapHovered: boolean;
  originalCameraX: number;
  originalCameraY: number;
  targetCameraX: number;
  targetCameraY: number;
}

/**
 * Render minimap
 */
export function renderMinimap(
  config: MinimapConfig,
  gameWorld: GameWorld,
  marbles: Marble[]
): void {
  const {
    minimapCanvas,
    minimapCtx,
    gameAreaBounds,
    finishLine,
    cameraZoom,
    currentCameraX,
    currentCameraY,
    canvas,
    minimapMouseX,
    minimapMouseY,
    isMinimapHovered
  } = config;

  // Calculate game area size - consider up to finish line only
  const gameWidth = (gameAreaBounds.maxX - gameAreaBounds.minX) * PIXELS_PER_METER; // Convert game coords to pixels

  // Use finish line height if available, otherwise use full height
  let effectiveGameHeight: number;
  if (finishLine > 0) {
    effectiveGameHeight = finishLine + 100; // Finish line + buffer
  } else {
    effectiveGameHeight = (gameAreaBounds.maxY - gameAreaBounds.minY) * PIXELS_PER_METER;
  }
  const gameHeight = effectiveGameHeight;

  // Set max minimap size
  const maxMinimapWidth = 150;
  const maxMinimapHeight = 700;

  // Calculate minimap size based on map aspect ratio (with max limits)
  const gameAspectRatio = gameWidth / gameHeight;

  // Calculate based on width first
  let minimapCanvasWidth = maxMinimapWidth;
  let minimapCanvasHeight = maxMinimapWidth / gameAspectRatio;

  // If height exceeds max, recalculate based on height
  if (minimapCanvasHeight > maxMinimapHeight) {
    minimapCanvasHeight = maxMinimapHeight;
    minimapCanvasWidth = maxMinimapHeight * gameAspectRatio;
  }

  // Map uses full canvas (no margins)
  const mapRenderWidth = minimapCanvasWidth;
  const mapRenderHeight = minimapCanvasHeight;
  const offsetX = 0;
  const offsetY = 0;

  // Dynamically adjust canvas size
  if (minimapCanvas.width !== minimapCanvasWidth || minimapCanvas.height !== minimapCanvasHeight) {
    minimapCanvas.width = minimapCanvasWidth;
    minimapCanvas.height = minimapCanvasHeight;
  }

  // Clear minimap
  minimapCtx.clearRect(0, 0, minimapCanvasWidth, minimapCanvasHeight);

  // Draw background (entire canvas is map area)
  minimapCtx.fillStyle = '#2a2a2a';
  minimapCtx.fillRect(0, 0, minimapCanvasWidth, minimapCanvasHeight);

  // Draw map structure (walls and obstacles)
  renderMinimapStructure(
    minimapCtx,
    gameWorld,
    mapRenderWidth,
    mapRenderHeight,
    gameWidth,
    gameHeight,
    offsetX,
    offsetY
  );

  // Draw marbles on minimap with stable positioning
  marbles.forEach(marble => {
    if (marble.finished) return; // Don't show finished marbles

    // Convert actual marble position to minimap coordinates (with offset)
    const scaleX = mapRenderWidth / gameWidth;
    const scaleY = mapRenderHeight / gameHeight;

    const x = marble.position.x * scaleX + offsetX;
    const y = marble.position.y * scaleY + offsetY;

    if (x >= offsetX && x <= offsetX + mapRenderWidth && y >= offsetY && y <= offsetY + mapRenderHeight) {
      minimapCtx.beginPath();
      minimapCtx.arc(x, y, 2, 0, Math.PI * 2);
      minimapCtx.fillStyle = marble.color;
      minimapCtx.fill();
      minimapCtx.strokeStyle = '#fff';
      minimapCtx.lineWidth = 0.5;
      minimapCtx.stroke();
    }
  });

  // Draw current viewport rectangle
  const visibleHeight = canvas.height / cameraZoom;
  const visibleWidth = canvas.width / cameraZoom;

  // Convert game viewport size to minimap scale (with offset)
  const scaleX = mapRenderWidth / gameWidth;
  const scaleY = mapRenderHeight / gameHeight;

  const viewportWidth = visibleWidth * scaleX;
  const viewportHeight = visibleHeight * scaleY;

  // Calculate camera viewport - convert visible area to minimap coords
  // Current camera's top-left position in game world (pixel basis)
  const viewportWorldLeftPx = -currentCameraX;
  const viewportWorldTopPx = -currentCameraY;

  // Convert to minimap scale (gameWidth, gameHeight are already in pixels)
  const viewportX = (viewportWorldLeftPx * scaleX) + offsetX;
  const viewportY = (viewportWorldTopPx * scaleY) + offsetY;

  // Draw current viewport rectangle
  minimapCtx.strokeStyle = '#4CAF50';
  minimapCtx.lineWidth = 2;
  minimapCtx.setLineDash([]);
  minimapCtx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

  // Draw preview viewport rectangle when hovering (different style)
  if (isMinimapHovered && minimapMouseX !== undefined && minimapMouseY !== undefined) {
    const previewViewportX = minimapMouseX - viewportWidth * CAMERA_VIEWPORT_CENTER_RATIO;
    const previewViewportY = minimapMouseY - viewportHeight * CAMERA_VIEWPORT_CENTER_RATIO;

    // Draw preview viewport rectangle with dashed line
    minimapCtx.strokeStyle = '#FFA500';
    minimapCtx.lineWidth = 2;
    minimapCtx.setLineDash([3, 3]);
    minimapCtx.strokeRect(previewViewportX, previewViewportY, viewportWidth, viewportHeight);

    // Fill with semi-transparent overlay
    minimapCtx.fillStyle = 'rgba(255, 165, 0, 0.2)';
    minimapCtx.fillRect(previewViewportX, previewViewportY, viewportWidth, viewportHeight);

    // Reset line dash after drawing preview
    minimapCtx.setLineDash([]);
  }
}

/**
 * Render minimap structure (walls, obstacles, sensors)
 */
export function renderMinimapStructure(
  minimapCtx: CanvasRenderingContext2D,
  gameWorld: GameWorld,
  minimapWidth: number,
  minimapHeight: number,
  gameWidth: number,
  gameHeight: number,
  offsetX: number,
  offsetY: number
): void {
  const scaleX = minimapWidth / gameWidth;
  const scaleY = minimapHeight / gameHeight;

  // Draw walls on minimap using physics engine data
  minimapCtx.strokeStyle = '#00ffff'; // Same color as actual game
  minimapCtx.lineWidth = 1;
  minimapCtx.shadowColor = '#00ffff';
  minimapCtx.shadowBlur = 1;
  minimapCtx.setLineDash([]); // Reset dash pattern

  const walls = gameWorld.getWalls();
  walls.forEach(wall => {
    // Same approach as renderWalls() in actual game
    const body = wall.body;
    if (!body) return;
    const fixtures: Fixture[] = [];
    let fixture = body.getFixtureList();

    while (fixture) {
      fixtures.push(fixture);
      fixture = fixture.getNext();
    }

    fixtures.forEach((fixtureItem: Fixture) => {
      const shape = fixtureItem.getShape();
      if (shape.getType() === 'edge') {
        // Render edge as line on minimap
        const edge = shape as any;
        const v1 = body.getWorldPoint(edge.m_vertex1);
        const v2 = body.getWorldPoint(edge.m_vertex2);

        // Convert physics coordinates to minimap coordinates
        const x1 = v1.x * PIXELS_PER_METER * scaleX + offsetX;
        const y1 = v1.y * PIXELS_PER_METER * scaleY + offsetY;
        const x2 = v2.x * PIXELS_PER_METER * scaleX + offsetX;
        const y2 = v2.y * PIXELS_PER_METER * scaleY + offsetY;

        minimapCtx.beginPath();
        minimapCtx.moveTo(x1, y1);
        minimapCtx.lineTo(x2, y2);
        minimapCtx.stroke();
      }
    });
  });

  // Reset shadow for other elements
  minimapCtx.shadowColor = 'transparent';
  minimapCtx.shadowBlur = 0;

  // Draw bubbles on minimap
  const bubbles = gameWorld.getBubbles();
  bubbles.forEach(bubble => {
    if (!bubble.body) return;
    const pos = bubble.body.getPosition();
    const x = pos.x * PIXELS_PER_METER * scaleX + offsetX;
    const y = pos.y * PIXELS_PER_METER * scaleY + offsetY;

    const radius = Math.max(1, bubble.radius * scaleX);
    MinimapRenderers.bubble(minimapCtx, x, y, radius);
  });

  // Draw rotating bars on minimap
  const rotatingBars = gameWorld.getRotatingBars();
  rotatingBars.forEach(bar => {
    if (!bar.body) return;
    const pos = bar.body.getPosition();
    const x = pos.x * PIXELS_PER_METER * scaleX + offsetX;
    const y = pos.y * PIXELS_PER_METER * scaleY + offsetY;

    const barWidth = Math.max(1, bar.length * scaleX);
    MinimapRenderers.rotatingBar(minimapCtx, x, y, barWidth, bar.angle || 0);
  });

  // Draw bounce circles on minimap
  const bounceCircles = gameWorld.getBounceCircles();
  bounceCircles.forEach(circle => {
    if (!circle.body) return;
    const pos = circle.body.getPosition();
    const x = pos.x * PIXELS_PER_METER * scaleX + offsetX;
    const y = pos.y * PIXELS_PER_METER * scaleY + offsetY;

    const radius = Math.max(1, circle.radius * scaleX);
    MinimapRenderers.bounceCircle(minimapCtx, x, y, radius);
  });

  // Draw jump pads on minimap
  const jumpPads = gameWorld.getJumpPads();
  jumpPads.forEach(pad => {
    if (!pad.body) return;
    const pos = pad.body.getPosition();
    const x = pos.x * PIXELS_PER_METER * scaleX + offsetX;
    const y = pos.y * PIXELS_PER_METER * scaleY + offsetY;

    const width = Math.max(2, pad.width * scaleX);
    const height = Math.max(2, pad.height * scaleY);

    MinimapRenderers.jumpPad(minimapCtx, x, y, width, height);
  });
}

/**
 * Setup minimap events
 */
export function setupMinimapEvents(
  minimapCanvas: HTMLCanvasElement,
  getConfig: () => MinimapConfig,
  getGameState: () => string,
  updateTargetCamera: CameraUpdateFn,
  restoreCamera: () => void,
  setMinimapHover: MinimapHoverSetter
): void {
  minimapCanvas.addEventListener('mousemove', (e) => {
    const rect = minimapCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Get current config
    const config = getConfig();

    // Store original camera position if not already hovering
    if (!config.isMinimapHovered) {
      // We'll store original position through the callback
    }

    setMinimapHover(true, mouseX, mouseY);

    // Convert minimap coordinates to game world coordinates (considering offset)
    // Same game area size calculation as renderMinimap()
    const mapWidth = (config.gameAreaBounds.maxX - config.gameAreaBounds.minX) * PIXELS_PER_METER;

    // Use finish line height if available, otherwise use full height
    let effectiveMapHeight: number;
    if (config.finishLine > 0) {
      effectiveMapHeight = config.finishLine + FINISH_LINE_BUFFER; // Finish line + buffer
    } else {
      effectiveMapHeight = (config.gameAreaBounds.maxY - config.gameAreaBounds.minY) * PIXELS_PER_METER;
    }
    const mapHeight = effectiveMapHeight;
    const minimapCanvasWidth = minimapCanvas.width;
    const minimapCanvasHeight = minimapCanvas.height;

    // Entire minimap is map area, so direct conversion
    const relativeX = mouseX / minimapCanvasWidth;
    const relativeY = mouseY / minimapCanvasHeight;

    const gameX = relativeX * mapWidth;
    const gameY = relativeY * mapHeight;

    // Set camera to show the hovered area
    const visibleHeight = config.canvas.height / config.cameraZoom;
    const visibleWidth = config.canvas.width / config.cameraZoom;

    // Calculate camera offset: target position centered on screen
    const targetCameraX = -(
      gameX - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
    );
    const targetCameraY = -(
      gameY - visibleHeight * CAMERA_VIEWPORT_CENTER_RATIO
    );

    updateTargetCamera(targetCameraX, targetCameraY);
  });

  minimapCanvas.addEventListener('mouseleave', () => {
    setMinimapHover(false);
    // When not in game, restore original camera position
    // When in game, do nothing to let updateCameraTracking resume 1st place tracking
    if (getGameState() !== 'running') {
      restoreCamera();
    }
  });
}
