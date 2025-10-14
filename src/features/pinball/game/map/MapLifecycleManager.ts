import { World } from 'planck';
import { Participant, Marble, GameState } from '../../shared/types';
import { GameWorld } from '../../shared/types/gameObjects';
import { EditorMapJson } from '../../shared/types/editorMap';
import { clearMarbles } from '../physics/PhysicsHelpers';
import { setupMapFromEditor, calculateCameraBounds } from './MapSetup';
import { StaticMapLoader } from '../../shared/map/StaticMapLoader';
import { PIXELS_PER_METER } from '../constants/physics';
import { FALLBACK_SPAWN_HEIGHT } from '../constants/map';
import { createPreviewMarbles, createTestMarbles } from '../entities/MarbleManager';
import { updatePreviewLeaderboard } from '../ui/LeaderboardUI';

const DEFAULT_MAP_NAME = 'default';

export function initializeMapSelect(selectElement: HTMLSelectElement): void {
  const mapInfoList = StaticMapLoader.getAllMapInfo();

  selectElement.innerHTML = '';

  mapInfoList.forEach((mapInfo) => {
    const option = document.createElement('option');
    option.value = mapInfo.name;
    option.textContent = mapInfo.displayName;
    selectElement.appendChild(option);
  });
}

export interface LoadMapInput {
  world: World;
  canvas: HTMLCanvasElement;
  participants: Participant[];
  marbles: Marble[];
  gameWorld: GameWorld;
  gameState: GameState;
  currentMap: EditorMapJson | null;
  mapName?: string;
  cameraZoom: number;
}

export interface LoadMapResult {
  map: EditorMapJson;
  gameWorld: GameWorld;
  finishLine: number;
  camera: {
    gameAreaBounds: { minX: number; maxX: number; minY: number; maxY: number };
    targetCameraX: number;
    targetCameraY: number;
  };
  marbles: Marble[];
}

export function loadMapIntoState(input: LoadMapInput): LoadMapResult {
  const { world, canvas, participants, marbles, gameState, gameWorld } = input;

  // Clear existing entities from physics world and GameWorld
  const allEntities = gameWorld.getAllEntities();
  allEntities.forEach(entity => {
    if (entity.body) {
      world.destroyBody(entity.body);
    }
  });
  gameWorld.clear();
  clearMarbles(marbles, world);

  const targetMapName = input.mapName ?? DEFAULT_MAP_NAME;
  const loadedMap = loadEditorMap(targetMapName);
  const editorMap = ensureSpawnPoint(loadedMap);

  const setup = setupMapFromEditor(world, editorMap);

  // Calculate camera configuration
  const visibleWidth = canvas.width / input.cameraZoom;
  const visibleHeight = canvas.height / input.cameraZoom;
  const camera = calculateCameraBounds(editorMap, visibleWidth, visibleHeight);

  let nextMarbles = marbles;
  if (gameState === 'idle') {
    nextMarbles = participants.length > 0
      ? createPreviewMarbles(participants, editorMap, canvas.width)
      : createTestMarbles(canvas.width);

    updatePreviewLeaderboard(participants, nextMarbles);
  }

  return {
    map: editorMap,
    gameWorld: setup.gameWorld,
    finishLine: setup.finishLine,
    camera,
    marbles: nextMarbles
  };
}

function loadEditorMap(mapName: string): EditorMapJson {
  const map = StaticMapLoader.getMapByName(mapName);

  if (map) {
    return map;
  }

  console.warn(`Map "${mapName}" not found, falling back to default`);
  return StaticMapLoader.getDefaultMap();
}

function ensureSpawnPoint(map: EditorMapJson): EditorMapJson {
  if (!map.meta.spawnPoint) {
    return {
      ...map,
      meta: {
        ...map.meta,
        spawnPoint: {
          x: map.meta.canvasSize.width / 2,
          y: FALLBACK_SPAWN_HEIGHT
        }
      }
    };
  }
  return map;
}
