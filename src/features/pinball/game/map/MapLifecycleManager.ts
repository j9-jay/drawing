import { World } from 'planck';
import { Participant, Marble, GameState } from '../../shared/types';
import { GameWorld } from '../../shared/types/gameObjects';
import { EditorMapJson } from '../../shared/types/editorMap';
import { clearMarbles } from '../physics/PhysicsHelpers';
import { setupMapFromEditor, calculateCameraBounds } from './MapSetup';
import { createDefaultMap } from './MapLoader';
import { PIXELS_PER_METER } from '../constants/physics';
import { FALLBACK_SPAWN_HEIGHT } from '../constants/map';
import { createPreviewMarbles, createTestMarbles } from '../entities/MarbleManager';
import { updatePreviewLeaderboard } from '../ui/LeaderboardUI';

const DEFAULT_MAP_NAME = 'default';

export async function initializeMapSelect(selectElement: HTMLSelectElement): Promise<void> {
  try {
    const response = await fetch('/api/pinball/maps/list-game');
    if (!response.ok) {
      return populateDefault(selectElement);
    }

    const mapList: Array<{ name: string; lastModified: string; size: number }> = await response.json();

    selectElement.innerHTML = '';

    populateDefault(selectElement);

    mapList.forEach((mapInfo) => {
      const option = document.createElement('option');
      option.value = mapInfo.name;
      option.textContent = mapInfo.name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.warn('Dev server not available, using default map only:', (error as Error).message);
    populateDefault(selectElement);
  }
}

function populateDefault(selectElement: HTMLSelectElement): void {
  selectElement.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = DEFAULT_MAP_NAME;
  defaultOption.textContent = 'Default Map';
  selectElement.appendChild(defaultOption);
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

export async function loadMapIntoState(input: LoadMapInput): Promise<LoadMapResult> {
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
  const editorMap = await loadEditorMap(targetMapName);

  ensureSpawnPoint(editorMap);

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

async function loadEditorMap(mapName: string): Promise<EditorMapJson> {
  try {
    const response = await fetch(`/api/pinball/maps/load-game/${mapName}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`Could not load map "${mapName}" from API:`, error);
  }

  return createDefaultMap();
}

function ensureSpawnPoint(map: EditorMapJson): void {
  if (!map.meta.spawnPoint) {
    map.meta.spawnPoint = {
      x: map.meta.canvasSize.width / 2,
      y: FALLBACK_SPAWN_HEIGHT
    };
}
}
