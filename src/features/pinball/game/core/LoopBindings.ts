import { World } from 'planck';
import { GameSettings, GameState, Marble } from '../../../shared/types';
import { GameWorld } from '../../../shared/types/gameObjects';
import { GameControlState } from '../control/GameController';
import { CameraConfig } from '../camera/CameraManager';
import { GameLoopCallbacks, GameLoopContext } from './GameLoop';

export interface LoopSnapshot {
  world: World;
  gameState: GameState;
  marbles: Marble[];
  gameWorld: GameWorld;
  finishLine: number;
  timeScale: number;
  userTimeScale: number;
  fixedTimeStep: number;
  gameStartTime: number;
  baseZoom: number;
  targetZoom: number;
  lastFinishedCount: number;
  winnerShown: boolean;
  cameraConfig: CameraConfig;
  controlState: GameControlState;
  settings: GameSettings;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export interface LoopStateUpdate {
  gameState: GameState;
  timeScale: number;
  userTimeScale: number;
  baseZoom: number;
  targetZoom: number;
  lastFinishedCount: number;
  winnerShown: boolean;
  marbles: Marble[];
  gameWorld: GameWorld;
  finishLine: number;
  gameStartTime: number;
  controlState: GameControlState;
  settings: GameSettings;
  cameraConfig: CameraConfig;
}

export interface LoopBindingHandlers {
  onRenderComplete(): void;
  onWinnerCheck(): void;
  onEndGame(): void;
  syncContext: (context: GameLoopContext) => void; // eslint-disable-line no-unused-vars
  onContextUpdated: (context: GameLoopContext) => void; // eslint-disable-line no-unused-vars
}

export function buildLoopContext(snapshot: LoopSnapshot): GameLoopContext {
  return { ...snapshot };
}

export function createLoopCallbacks(handlers: LoopBindingHandlers): GameLoopCallbacks {
  return {
    onRenderComplete: handlers.onRenderComplete,
    onWinnerCheck: handlers.onWinnerCheck,
    onEndGame: handlers.onEndGame,
    syncContext: handlers.syncContext,
    onContextUpdated: handlers.onContextUpdated
  };
}

export function syncLoopContext(context: GameLoopContext, snapshot: LoopSnapshot): void {
  context.world = snapshot.world;
  context.gameState = snapshot.gameState;
  context.marbles = snapshot.marbles;
  context.gameWorld = snapshot.gameWorld;
  context.finishLine = snapshot.finishLine;
  context.timeScale = snapshot.timeScale;
  context.userTimeScale = snapshot.userTimeScale;
  context.fixedTimeStep = snapshot.fixedTimeStep;
  context.gameStartTime = snapshot.gameStartTime;
  context.baseZoom = snapshot.baseZoom;
  context.targetZoom = snapshot.targetZoom;
  context.lastFinishedCount = snapshot.lastFinishedCount;
  context.winnerShown = snapshot.winnerShown;
  context.cameraConfig = snapshot.cameraConfig;
  context.controlState = snapshot.controlState;
  context.settings = snapshot.settings;
  context.canvas = snapshot.canvas;
  context.ctx = snapshot.ctx;
}

export function extractLoopState(context: GameLoopContext): LoopStateUpdate {
  return {
    gameState: context.gameState,
    timeScale: context.timeScale,
    userTimeScale: context.userTimeScale,
    baseZoom: context.baseZoom,
    targetZoom: context.targetZoom,
    lastFinishedCount: context.lastFinishedCount,
    winnerShown: context.winnerShown,
    marbles: context.marbles,
    gameWorld: context.gameWorld,
    finishLine: context.finishLine,
    gameStartTime: context.gameStartTime,
    controlState: context.controlState,
    settings: context.settings,
    cameraConfig: context.cameraConfig
  };
}
