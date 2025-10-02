/**
 * Map setup utilities
 * Handles creating physics world from editor maps
 */

import { World } from 'planck';
import { GameWorld } from '../../../shared/types';
import { EditorMapJson } from '../../../shared/types/editorMap';
import {
  createEdgeFromEditor,
  createBubbleFromEditor,
  createRotatingBarFromEditor,
  createBounceCircleFromEditor,
  createJumppadFromEditor,
  createFinishLineFromEditor,
  calculateAutoFinishLine
} from './MapLoader';
import { PIXELS_PER_METER } from '../constants/physics';
import {
  CAMERA_VIEWPORT_CENTER_RATIO,
  MAP_DEFAULT_VERTICAL_FRACTION
} from '../constants/camera';

export interface MapSetupResult {
  gameWorld: GameWorld;
  finishLine: number;
}

/**
 * Setup map from editor JSON
 */
export function setupMapFromEditor(
  world: World,
  editorMap: EditorMapJson
): MapSetupResult {
  const gameWorld = new GameWorld();
  let finishLine = 0;

  const scale = PIXELS_PER_METER; // Pixel to physics unit conversion

  // Check if there's a finish line in the map
  const hasFinishLine = editorMap.objects.some(obj => obj.type === 'finishLine');

  editorMap.objects.forEach(obj => {
    switch (obj.type) {
      case 'edge': {
        createEdgeFromEditor(world, gameWorld, obj, scale);
        break;
      }

      case 'bubble': {
        createBubbleFromEditor(world, gameWorld, obj, scale);
        break;
      }

      case 'rotatingBar': {
        createRotatingBarFromEditor(world, gameWorld, obj, scale);
        break;
      }

      case 'bounceCircle': {
        createBounceCircleFromEditor(world, gameWorld, obj, scale);
        break;
      }

      case 'jumppad': {
        createJumppadFromEditor(world, gameWorld, obj, scale);
        break;
      }

      case 'finishLine': {
        const finishLineEntity = createFinishLineFromEditor(world, gameWorld, obj, scale);
        finishLine = finishLineEntity.y;
        break;
      }
    }
  });

  // If no finish line exists, set it to the bottom of the lowest object
  if (!hasFinishLine) {
    finishLine = calculateAutoFinishLine(editorMap);
  }

  return { gameWorld, finishLine };
}

/**
 * Calculate camera bounds and initial position
 */
export function calculateCameraBounds(
  editorMap: EditorMapJson,
  visibleWidth: number,
  visibleHeight: number
): {
  gameAreaBounds: { minX: number; maxX: number; minY: number; maxY: number };
  targetCameraX: number;
  targetCameraY: number;
} {
  // Map size to game area bounds
  const mapWidth = editorMap.meta.canvasSize.width;
  const mapHeight = editorMap.meta.canvasSize.height;
  const scale = PIXELS_PER_METER;

  // Game area bounds in game units
  const gameAreaBounds = {
    minX: 0,
    maxX: mapWidth / scale,
    minY: 0,
    maxY: mapHeight / scale
  };

  // Calculate camera target position
  let targetX: number;
  let targetY: number;

  if (editorMap.meta.spawnPoint) {
    // Use editor spawn point (in pixels)
    targetX = editorMap.meta.spawnPoint.x;
    targetY = editorMap.meta.spawnPoint.y;
  } else {
    // Default spawn point
    targetX = mapWidth * CAMERA_VIEWPORT_CENTER_RATIO;
    targetY = mapHeight * MAP_DEFAULT_VERTICAL_FRACTION;
  }

  // Camera offset calculation (negative for proper positioning)
  const targetCameraX = -(
    targetX - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
  );
  const targetCameraY = -(
    targetY - visibleHeight * CAMERA_VIEWPORT_CENTER_RATIO
  );

  return {
    gameAreaBounds,
    targetCameraX,
    targetCameraY
  };
}