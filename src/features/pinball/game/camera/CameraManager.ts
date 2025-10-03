/**
 * Camera management utilities
 * Handles camera tracking, zoom, and smooth transitions
 */

import { Marble, GameState } from '../../shared/types';
import { EditorMapJson } from '../../shared/types/editorMap';
import {
  FINISH_SLOWMO_DISTANCE,
  FINISH_TIME_SCALE_MULTIPLIER,
  MIN_FINISH_TIME_SCALE,
  FINISH_ZOOM_MULTIPLIER,
  LATE_RACE_COMPLETION_RATIO,
  LATE_RACE_TIME_SCALE_MULTIPLIER,
  LATE_RACE_TIME_SCALE_CAP,
  LATE_RACE_ZOOM_MULTIPLIER
} from '../constants/slowMotion';
import {
  CAMERA_LERP_RUNNING,
  CAMERA_LERP_IDLE,
  TARGET_ZOOM_SMOOTHING,
  CAMERA_VIEWPORT_CENTER_RATIO,
  LEADING_MARBLE_VERTICAL_OFFSET_RATIO,
  LEADING_MARBLE_PREDICTIVE_MULTIPLIER,
  MAP_DEFAULT_VERTICAL_FRACTION,
  ZOOM_ALIGNMENT_EPSILON
} from '../constants/camera';
import { PIXELS_PER_METER } from '../constants/physics';
import { DEFAULT_SPAWN_HEIGHT } from '../constants/map';

export interface CameraConfig {
  canvas: HTMLCanvasElement;
  cameraZoom: number;
  currentCameraX: number;
  currentCameraY: number;
  targetCameraX: number;
  targetCameraY: number;
  baseZoom: number;
  targetZoom: number;
  gameAreaBounds: { minX: number; maxX: number; minY: number; maxY: number };
  isMinimapHovered: boolean;
  originalCameraX: number;
  originalCameraY: number;
}

/**
 * Update camera tracking to follow leading marble
 */
export function updateCameraTracking(
  config: CameraConfig,
  marbles: Marble[],
  gameState: GameState
): void {
  if (gameState !== 'running') return;

  // Skip if minimap is hovered (minimap cursor has priority)
  if (config.isMinimapHovered) return;

  // Find leading marble among unfinished marbles (by position)
  const racingMarbles = marbles.filter(m => !m.finished);
  if (racingMarbles.length === 0) {
    // All marbles finished
    config.targetCameraX = 0;
    config.targetCameraY = 0;
    return;
  }

  const leadingMarble = racingMarbles[0]; // Already sorted by position

  const visibleHeight = config.canvas.height / config.cameraZoom;
  const visibleWidth = config.canvas.width / config.cameraZoom;

  // Calculate marble velocity (from physics body)
  let velocityY = 0;

  if (leadingMarble.body) {
    const velocity = leadingMarble.body.getLinearVelocity();
    velocityY = velocity.y * PIXELS_PER_METER; // Convert game coords to pixels
  }

  // Apply slight predictive offset on Y-axis (to keep marble on screen when falling fast)
  // Only apply when velocity is positive (moving down)
  const predictiveY = velocityY > 0
    ? velocityY * LEADING_MARBLE_PREDICTIVE_MULTIPLIER
    : 0; // Very small prediction factor

  // Y-axis tracking (position marble at top 35% of screen for bottom clearance)
  config.targetCameraY = -(
    leadingMarble.position.y + predictiveY - visibleHeight * LEADING_MARBLE_VERTICAL_OFFSET_RATIO
  );

  // X-axis tracking (center marble on screen, no prediction)
  config.targetCameraX = -(
    leadingMarble.position.x - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
  );
}

/**
 * Update camera position with smooth interpolation
 */
export function updateCameraPosition(
  config: CameraConfig,
  gameState: GameState
): void {
  // Smooth camera movement (lerp interpolation)
  // Faster when gaming, slower when idle
  const lerpFactor = gameState === 'running' ? CAMERA_LERP_RUNNING : CAMERA_LERP_IDLE;

  // X-axis camera movement
  const differenceX = config.targetCameraX - config.currentCameraX;
  if (Math.abs(differenceX) > 1) {
    config.currentCameraX += differenceX * lerpFactor;
  } else {
    config.currentCameraX = config.targetCameraX;
  }

  // Y-axis camera movement
  const differenceY = config.targetCameraY - config.currentCameraY;
  if (Math.abs(differenceY) > 1) {
    config.currentCameraY += differenceY * lerpFactor;
  } else {
    config.currentCameraY = config.targetCameraY;
  }
}

/**
 * Update camera zoom with smooth transition
 */
export function updateCameraZoom(config: CameraConfig): void {
  // Smooth zoom transition (lerp)
  config.cameraZoom = config.cameraZoom + (config.targetZoom - config.cameraZoom) * TARGET_ZOOM_SMOOTHING;

  // Ignore very small differences to prevent micro-jitter
  if (Math.abs(config.targetZoom - config.cameraZoom) < ZOOM_ALIGNMENT_EPSILON) {
    config.cameraZoom = config.targetZoom;
  }
}

/**
 * Adjust camera to fit map
 */
export function adjustCameraToMap(
  config: CameraConfig,
  editorMap: EditorMapJson
): void {
  // Update game area bounds based on map size
  const mapWidth = editorMap.meta.canvasSize.width;
  const mapHeight = editorMap.meta.canvasSize.height;
  const scale = PIXELS_PER_METER; // Editor pixels to game units conversion scale

  // Set game area bounds to match map size
  config.gameAreaBounds = {
    minX: 0,
    maxX: mapWidth / scale,
    minY: 0,
    maxY: mapHeight / scale
  };

  // Set camera to spawn position or center of map
  const visibleHeight = config.canvas.height / config.cameraZoom;
  const visibleWidth = config.canvas.width / config.cameraZoom;

  // Set target to spawn point or map top-center
  let targetX: number;
  let targetY: number;

  if (editorMap.meta.spawnPoint) {
    // Use spawn point from editor (pixel units)
    targetX = editorMap.meta.spawnPoint.x;
    targetY = editorMap.meta.spawnPoint.y;
  } else {
    // Use map top-center if no spawn point
    targetX = mapWidth * CAMERA_VIEWPORT_CENTER_RATIO;
    targetY = mapHeight * MAP_DEFAULT_VERTICAL_FRACTION; // Top-position spawn when missing
  }

  // Calculate camera offset to center target position on screen
  // Camera offset is negative (move camera left to move screen right)
  config.targetCameraX = -(
    targetX - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
  );
  config.targetCameraY = -(
    targetY - visibleHeight * CAMERA_VIEWPORT_CENTER_RATIO
  );
  config.currentCameraX = config.targetCameraX;
  config.currentCameraY = config.targetCameraY;
  config.originalCameraX = config.targetCameraX;
  config.originalCameraY = config.targetCameraY;
}

/**
 * Reset camera to spawn position
 */
export function resetCameraToSpawn(
  config: CameraConfig,
  currentMap: EditorMapJson | null
): void {
  const visibleHeight = config.canvas.height / config.cameraZoom;
  const visibleWidth = config.canvas.width / config.cameraZoom;

  let targetX: number;
  let targetY: number;

  if (currentMap && currentMap.meta.spawnPoint) {
    // Use editor map spawn point
    targetX = currentMap.meta.spawnPoint.x;
    targetY = currentMap.meta.spawnPoint.y;
  } else {
    // Use default position
    targetX = config.canvas.width * CAMERA_VIEWPORT_CENTER_RATIO;
    targetY = DEFAULT_SPAWN_HEIGHT;
  }

  // Camera offset: calculate so target position is centered on screen
  const resetCameraX = -(
    targetX - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
  );
  const resetCameraY = -(
    targetY - visibleHeight * CAMERA_VIEWPORT_CENTER_RATIO
  );

  config.currentCameraX = resetCameraX;
  config.currentCameraY = resetCameraY;
  config.targetCameraX = resetCameraX;
  config.targetCameraY = resetCameraY;
  config.originalCameraX = resetCameraX;
  config.originalCameraY = resetCameraY;
}

/**
 * Check and apply slow motion near finish line
 */
export function checkSlowMotion(
  marbles: Marble[],
  finishLine: number,
  winnerShown: boolean,
  baseZoom: number,
  userTimeScale: number
): { timeScale: number; targetZoom: number } {
  if (!finishLine) return { timeScale: userTimeScale, targetZoom: baseZoom };

  // Base speed (user-set speed) - 매개변수로 받은 값 사용
  const baseSpeed = userTimeScale;

  // Check for marbles near finish line (450px before, considering zoom)
  const racingMarbles = marbles.filter(m => !m.finished);
  const marblesNearFinish = racingMarbles.filter(marble => {
    const distanceToFinish = finishLine - marble.position.y;
    return distanceToFinish > 0 && distanceToFinish < FINISH_SLOWMO_DISTANCE;
  });

  // After winner is decided, no slow motion effect, proceed at normal speed
  if (winnerShown) {
    return {
      timeScale: baseSpeed,
      targetZoom: baseZoom
    };
  } else if (marblesNearFinish.length > 0) {
    const targetTimeScale = Math.max(baseSpeed * FINISH_TIME_SCALE_MULTIPLIER, MIN_FINISH_TIME_SCALE);
    return {
      timeScale: targetTimeScale,
      targetZoom: baseZoom * FINISH_ZOOM_MULTIPLIER
    };
  } else {
    // Normal speed when no marbles near finish
    const finishedCount = marbles.filter(m => m.finished).length;
    const totalCount = marbles.length;

    if (finishedCount > totalCount * LATE_RACE_COMPLETION_RATIO) {
      const easedTimeScale = Math.min(
        baseSpeed,
        Math.max(baseSpeed * LATE_RACE_TIME_SCALE_MULTIPLIER, LATE_RACE_TIME_SCALE_CAP)
      );
      return {
        timeScale: easedTimeScale,
        targetZoom: baseZoom * LATE_RACE_ZOOM_MULTIPLIER
      };
    } else {
      // Normal speed
      return {
        timeScale: baseSpeed,
        targetZoom: baseZoom // Base zoom
      };
    }
  }
}
