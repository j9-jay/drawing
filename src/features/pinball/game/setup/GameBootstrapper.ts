import { Vec2, World } from 'planck';
import { GameSettings } from '../../../shared/types';
import { GameControlState } from '../control/GameController';
import {
  GAME_GRAVITY_Y,
  SLEEP_LINEAR_TOLERANCE,
  SLEEP_ANGULAR_TOLERANCE,
  SLEEP_TIME_UNTIL_SLEEP
} from '../constants/physics';

export interface CanvasResources {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  minimapCanvas: HTMLCanvasElement;
  minimapCtx: CanvasRenderingContext2D;
}

export interface BootstrapResources extends CanvasResources {
  world: World;
  settings: GameSettings;
}

export function resolveCanvasResources(
  canvasId: string = 'game-canvas',
  minimapId: string = 'minimap-canvas'
): CanvasResources {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error(`Canvas element not found: ${canvasId}`);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not obtain 2D context from game canvas');
  }

  const minimapCanvas = document.getElementById(minimapId) as HTMLCanvasElement | null;
  if (!minimapCanvas) {
    throw new Error(`Minimap canvas element not found: ${minimapId}`);
  }

  const minimapCtx = minimapCanvas.getContext('2d');
  if (!minimapCtx) {
    throw new Error('Could not obtain 2D context from minimap canvas');
  }

  return {
    canvas,
    ctx,
    minimapCanvas,
    minimapCtx
  };
}

export function createWorld(): World {
  const world = new World(Vec2(0, GAME_GRAVITY_Y));

  // Sleep 시스템 활성화
  world.setAllowSleeping(true);

  // Sleep 매개변수 설정
  world.setWarmStarting(true); // 성능 향상
  world.setContinuousPhysics(false); // 빠른 객체도 Sleep 가능

  return world;
}

export function createDefaultSettings(): GameSettings {
  return {
    winnerMode: 'first',
    customRank: 1,
    topNCount: 5,
    mapType: 'classic',
    participants: []
  };
}

export function createInitialControlState(params: {
  gameState: GameControlState['gameState'];
  winnerShown: GameControlState['winnerShown'];
  lastFinishedCount: GameControlState['lastFinishedCount'];
  baseZoom: GameControlState['baseZoom'];
  targetZoom: GameControlState['targetZoom'];
  timeScale: GameControlState['timeScale'];
  gameStartTime: GameControlState['gameStartTime'];
}): GameControlState {
  return {
    gameState: params.gameState,
    winnerShown: params.winnerShown,
    lastFinishedCount: params.lastFinishedCount,
    baseZoom: params.baseZoom,
    targetZoom: params.targetZoom,
    timeScale: params.timeScale,
    gameStartTime: params.gameStartTime
  };
}

export function createBootstrapResources(): BootstrapResources {
  const canvasResources = resolveCanvasResources();
  return {
    ...canvasResources,
    world: createWorld(),
    settings: createDefaultSettings()
  };
}
