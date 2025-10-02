/**
 * Game loop management that bridges update and render flows.
 */

import { World } from 'planck';
import { GameSettings, GameState, Marble } from '../../../shared/types';
import { GameWorld } from '../../../shared/types/gameObjects';
import { RenderContext, render } from '../rendering/GameRenderer';
import { CameraConfig } from '../camera/CameraManager';
import { GameControlState } from '../control/GameController';
import { updateGameState, UpdateCallbacks, UpdateContext } from './UpdateManager';

export interface GameLoopContext {
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
  // Legacy properties for compatibility (will be removed)
  walls?: any[];
  obstacles?: any[];
  sensors?: any[];
}

export interface GameLoopCallbacks {
  onRenderComplete(): void;
  onWinnerCheck(): void;
  onEndGame(): void;
  syncContext(context: GameLoopContext): void;
  onContextUpdated(context: GameLoopContext): void;
}

export function startGameLoop(
  context: GameLoopContext,
  callbacks: GameLoopCallbacks
): void {
  const loop = () => {
    gameLoop(context, callbacks);
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}

function gameLoop(
  context: GameLoopContext,
  callbacks: GameLoopCallbacks
): void {
  callbacks.syncContext?.(context);
  updateContext(context, callbacks);
  callbacks.onContextUpdated?.(context);
  renderFrame(context, callbacks);
}

function updateContext(
  context: GameLoopContext,
  callbacks: GameLoopCallbacks
): void {
  const updateCallbacks: UpdateCallbacks = {
    onGameStateChange: state => {
      context.gameState = state;
    },
    onWinnerCheck: callbacks.onWinnerCheck,
    onEndGame: callbacks.onEndGame
  };

  const payload: UpdateContext = {
    world: context.world,
    gameState: context.gameState,
    marbles: context.marbles,
    gameWorld: context.gameWorld,
    finishLine: context.finishLine,
    timeScale: context.timeScale,
    userTimeScale: context.userTimeScale,
    fixedTimeStep: context.fixedTimeStep,
    gameStartTime: context.gameStartTime,
    lastFinishedCount: context.lastFinishedCount,
    winnerShown: context.winnerShown,
    baseZoom: context.baseZoom,
    targetZoom: context.targetZoom,
    cameraConfig: context.cameraConfig,
    controlState: context.controlState,
    settings: context.settings
  };

  const updated = updateGameState(payload, updateCallbacks);

  context.gameState = updated.gameState;
  context.timeScale = updated.timeScale;
  context.userTimeScale = updated.userTimeScale;
  context.baseZoom = updated.baseZoom;
  context.targetZoom = updated.targetZoom;
  context.lastFinishedCount = updated.lastFinishedCount;
  context.winnerShown = updated.winnerShown;
  context.cameraConfig = updated.cameraConfig;
  context.controlState = updated.controlState;
  context.settings = updated.settings;
  context.gameWorld = updated.gameWorld;
  context.marbles = updated.marbles;
  context.finishLine = updated.finishLine;
  context.gameStartTime = updated.gameStartTime;
}

function renderFrame(
  context: GameLoopContext,
  callbacks: GameLoopCallbacks
): void {
  const renderContext: RenderContext = {
    ctx: context.ctx,
    canvas: context.canvas,
    cameraZoom: context.cameraConfig.cameraZoom,
    currentCameraX: context.cameraConfig.currentCameraX,
    currentCameraY: context.cameraConfig.currentCameraY,
    timeScale: context.timeScale
  };

  render(
    renderContext,
    context.gameWorld,
    context.marbles,
    context.finishLine,
    callbacks.onRenderComplete
  );
}
