/**
 * Game initialization utilities
 */

import { World, Vec2 } from 'planck';
import { GameSettings, Participant, Marble } from '../../shared/types';
import { EditorMapJson } from '../../shared/types/editorMap';
import { loadFromStorage } from '../storage/GameStorage';
import { parseParticipants } from '../entities/ParticipantManager';
import { createPreviewMarbles, createTestMarbles } from '../entities/MarbleManager';
import { updatePreviewLeaderboard } from '../ui/LeaderboardUI';
import { createDefaultMap } from '../map/MapLoader';
import { FALLBACK_SPAWN_HEIGHT } from '../constants/map';
import { INITIALIZER_GRAVITY_Y } from '../constants/physics';

/**
 * Initialize game settings
 */
export function initializeSettings(): GameSettings {
  const settings: GameSettings = {
    winnerMode: 'first',
    customRank: 1,
    topNCount: 5,
    mapType: 'default',
    participants: []
  };

  // Load saved settings
  loadFromStorage(settings);

  return settings;
}

/**
 * Initialize physics world
 */
export function initializePhysicsWorld(): World {
  const gravity = Vec2(0, INITIALIZER_GRAVITY_Y);
  return new World(gravity);
}

/**
 * Setup canvas and get contexts
 * @throws {Error} When called in server-side environment (SSR)
 */
export function setupCanvas(): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  minimapCanvas: HTMLCanvasElement;
  minimapCtx: CanvasRenderingContext2D;
} {
  // SSR guard: Ensure this function is only called in browser environment
  if (typeof window === 'undefined') {
    throw new Error('setupCanvas must be called in browser environment');
  }

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const minimapCanvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
  const minimapCtx = minimapCanvas.getContext('2d')!;

  // Setup resize handler
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  return { canvas, ctx, minimapCanvas, minimapCtx };
}

/**
 * Initialize participants and marbles
 */
export function initializeParticipantsAndMarbles(
  canvas: HTMLCanvasElement,
  currentMap: EditorMapJson | null
): {
  participants: Participant[];
  marbles: Marble[];
} {
  // Parse participants with verbose logging
  const parsedParticipants = parseParticipants(true);
  const participants = parsedParticipants || [];

  // Create preview marbles
  const marbles = participants.length > 0
    ? createPreviewMarbles(participants, currentMap, canvas.width)
    : createTestMarbles(canvas.width);

  updatePreviewLeaderboard(participants, marbles);

  return { participants, marbles };
}

/**
 * Load initial map
 */
export async function loadInitialMap(): Promise<EditorMapJson> {
  try {
    // Try to load default map from API
    // Use relative path for same-origin requests
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${API_URL}/api/pinball/maps/default`);
    if (response.ok) {
      const editorMap = await response.json();

      // Ensure spawn point exists
      if (!editorMap.meta.spawnPoint) {
        editorMap.meta.spawnPoint = {
          x: editorMap.meta.canvasSize.width / 2,
          y: FALLBACK_SPAWN_HEIGHT
        };
      }

      return editorMap;
    }
  } catch (error) {
    console.warn('Could not load map from API during initialization:', error);
  }

  // Fall back to default map
  return createDefaultMap();
}
