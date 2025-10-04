/**
 * Update manager for game state updates
 */

import { World } from 'planck';
import { Marble, GameState } from '../../shared/types';
import { GameWorld } from '../../shared/types/gameObjects';
import {
  updateMarblePositions,
  checkFinishLine
} from '../physics/PhysicsHelpers';
import { updateBubbles, updateRotatingBars, updateBounceCircles } from '../entities/ObstacleUpdater';
import {
  PHYSICS_VELOCITY_ITERATIONS,
  PHYSICS_POSITION_ITERATIONS,
  PERFORMANCE_MARBLE_THRESHOLD,
  HIGH_PERFORMANCE_VELOCITY_ITERATIONS,
  HIGH_PERFORMANCE_POSITION_ITERATIONS,
  FPS_THRESHOLD_CRITICAL,
  FPS_THRESHOLD_LOW,
  FPS_THRESHOLD_HIGH,
  CRITICAL_VELOCITY_ITERATIONS,
  CRITICAL_POSITION_ITERATIONS,
  LOW_VELOCITY_ITERATIONS,
  LOW_POSITION_ITERATIONS
} from '../constants/physics';
import {
  updateCameraTracking,
  updateCameraPosition,
  updateCameraZoom,
  CameraConfig
} from '../camera/CameraManager';
import { updateLeaderboard } from '../ui/LeaderboardUI';
import { checkSlowMotion } from '../camera/CameraManager';
import { TIME_SCALE_SMOOTHING, TARGET_ZOOM_SMOOTHING } from '../constants/camera';
import { GameControlState, checkWinnerCondition, endGame } from '../control/GameController';
import { fpsMonitor } from '../utils/FPSMonitor';
import { adaptiveQuality } from '../utils/AdaptiveQuality';
import { sleepMonitor } from '../utils/SleepMonitor';
import { aggressiveSleep } from '../utils/AggressiveSleep';

export interface UpdateContext {
  world: World;
  gameState: GameState;
  marbles: Marble[];
  gameWorld: GameWorld;
  finishLine: number;
  timeScale: number;
  userTimeScale: number;
  fixedTimeStep: number;
  gameStartTime: number;
  lastFinishedCount: number;
  winnerShown: boolean;
  baseZoom: number;
  targetZoom: number;
  cameraConfig: CameraConfig;
  controlState: GameControlState;
  settings: unknown;
}

export interface UpdateCallbacks {
  // eslint-disable-next-line no-unused-vars
  onGameStateChange(state: GameState): void;
  onWinnerCheck(): void;
  onEndGame(): void;
}

/**
 * Main update orchestrator
 */
export function updateGameState(
  context: UpdateContext,
  callbacks: UpdateCallbacks
): UpdateContext {
  const previousState = context.gameState;

  // FPS 모니터링 업데이트
  fpsMonitor.update();

  // Always update camera (for minimap preview)
  updateCameraPosition(context.cameraConfig, context.gameState);

  if (context.gameState !== 'running') {
    return context;
  }

  // Update physics
  const scaledTimeStep = context.fixedTimeStep * context.timeScale;

  // 적응형 품질 시스템으로 iteration 결정
  const marbleCount = context.marbles.length;
  const currentFps = fpsMonitor.getFPS();
  const physicsIterations = adaptiveQuality.getPhysicsIterations(currentFps, marbleCount);

  context.world.step(scaledTimeStep, physicsIterations.velocityIterations, physicsIterations.positionIterations);

  // Sleep 모니터링
  sleepMonitor.update(context.marbles);

  // 공격적 Sleep 최적화
  const gameTime = (performance.now() - context.gameStartTime) / 1000;
  let gamePhase: 'early' | 'middle' | 'late';

  if (gameTime < 10) {
    gamePhase = 'early';
  } else if (gameTime < 30) {
    gamePhase = 'middle';
  } else {
    gamePhase = 'late';
  }

  // 게임 단계별 + 응급 Sleep 적용
  aggressiveSleep.optimizeByGameState(context.marbles, gamePhase);
  aggressiveSleep.emergencySleep(context.marbles, currentFps);

  // Update entities
  const bubbles = context.gameWorld.getBubbles();
  const bubblesToRemove = updateBubbles(bubbles as any, context.world);

  // GameWorld에서 완료된 버블 제거
  bubblesToRemove.forEach(id => {
    context.gameWorld.removeEntity(id);
  });

  const rotatingBars = context.gameWorld.getRotatingBars();
  updateRotatingBars(rotatingBars as any, context.timeScale);

  const bounceCircles = context.gameWorld.getBounceCircles();
  updateBounceCircles(bounceCircles as any);

  updateMarblePositions(context.marbles);

  // Check finish line
  const newlyFinished = checkFinishLine(
    context.marbles,
    context.finishLine,
    context.gameStartTime,
    context.world
  );

  // Update leaderboard
  context.lastFinishedCount = updateLeaderboard(context.marbles, {
    gameState: context.gameState,
    lastFinishedCount: context.lastFinishedCount
  });

  // Check winner condition if new finishers
  if (newlyFinished.length > 0) {
    checkWinnerCondition(
      context.controlState,
      context.marbles,
      context.settings,
      callbacks.onWinnerCheck
    );
  }

  // Update camera tracking
  updateCameraTracking(context.cameraConfig, context.marbles, context.gameState);

  // Check slow motion
  const slowMotionResult = checkSlowMotion(
    context.marbles,
    context.finishLine,
    context.winnerShown,
    context.baseZoom,
    context.userTimeScale
  );
  context.timeScale += (slowMotionResult.timeScale - context.timeScale) * TIME_SCALE_SMOOTHING;
  context.targetZoom += (slowMotionResult.targetZoom - context.targetZoom) * TARGET_ZOOM_SMOOTHING;
  context.cameraConfig.targetZoom = context.targetZoom;

  // Update camera zoom
  updateCameraZoom(context.cameraConfig);

  // Sync control state updates
  context.winnerShown = context.controlState.winnerShown;
  context.gameState = context.controlState.gameState;

  if (previousState !== context.gameState) {
    callbacks.onGameStateChange?.(context.gameState);
  }

  // Check if all marbles finished
  const finishedCount = context.marbles.filter(m => m.finished).length;
  if (finishedCount === context.marbles.length && finishedCount > 0 && context.gameState === 'running') {
    context.gameState = 'finished';
    endGame(context.controlState, context.marbles, context.settings);
    callbacks.onEndGame();
  }

  return context;
}
