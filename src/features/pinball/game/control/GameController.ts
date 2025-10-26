/**
 * Game control logic
 * Manages game state transitions and control flow
 */

import { GameState, GameSettings, Marble } from '../../shared/types';
import { EditorMapJson } from '../../shared/types/editorMap';
import { showToast } from '../ui/ToastManager';
import { showWinner, showTopNWinners } from '../ui/WinnerDisplay';
import { enableSettingsPopupOnClick } from '../ui/SettingsUI';
import { createGameMarbles, determineWinner } from '../entities/MarbleManager';
import { clearMarbles } from '../physics/PhysicsHelpers';
import { World } from 'planck';
import { DEFAULT_CAMERA_ZOOM, CAMERA_VIEWPORT_CENTER_RATIO } from '../constants/camera';
import { DEFAULT_SPAWN_HEIGHT } from '../constants/map';

export interface GameControlState {
  gameState: GameState;
  winnerShown: boolean;
  lastFinishedCount: number;
  baseZoom: number;
  targetZoom: number;
  timeScale: number;
  gameStartTime: number;
}

/**
 * Start the game
 */
export function startGame(
  state: GameControlState,
  settings: GameSettings,
  participants: unknown[],
  marbles: Marble[],
  world: World,
  currentMap: EditorMapJson | null,
  canvas: HTMLCanvasElement,
  cameraConfig: unknown,
  parseParticipantsFn: () => boolean
): Marble[] {
  if (!parseParticipantsFn()) return marbles;

  clearMarbles(marbles, world);
  const newMarbles = createGameMarbles(participants, world, currentMap, canvas.width);

  // Reset zoom to base level at game start
  state.baseZoom = DEFAULT_CAMERA_ZOOM;
  state.targetZoom = state.baseZoom;

  // Reformat textarea to show comma-separated entries as newline-separated and sorted
  const namesInput = document.getElementById('names-input') as HTMLTextAreaElement;
  if (namesInput) {
    const currentValue = namesInput.value;
    const entries: string[] = [];
    const lines = currentValue.split('\n');
    lines.forEach(line => {
      const items = line.split(',');
      items.forEach(item => {
        const trimmed = item.trim();
        if (trimmed) {
          entries.push(trimmed);
        }
      });
    });
    entries.sort((a, b) => a.localeCompare(b, 'ko'));
    namesInput.value = entries.join('\n');
  }

  state.gameState = 'running';
  state.gameStartTime = Date.now();
  state.winnerShown = false;
  state.lastFinishedCount = 0;

  // timeScale은 이미 state에 설정된 값을 유지 (EventHandlers에서 관리됨)

  // Set camera to spawn position
  const visibleHeight = canvas.height / cameraConfig.cameraZoom;
  const visibleWidth = canvas.width / cameraConfig.cameraZoom;

  let spawnX: number;
  let spawnY: number;

  if (currentMap && currentMap.meta.spawnPoint) {
    spawnX = currentMap.meta.spawnPoint.x;
    spawnY = currentMap.meta.spawnPoint.y;
  } else {
    spawnX = canvas.width * CAMERA_VIEWPORT_CENTER_RATIO;
    spawnY = DEFAULT_SPAWN_HEIGHT;
  }

  cameraConfig.targetCameraX = -(
    spawnX - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
  );
  cameraConfig.targetCameraY = -(
    spawnY - visibleHeight * CAMERA_VIEWPORT_CENTER_RATIO
  );
  cameraConfig.currentCameraX = cameraConfig.targetCameraX;
  cameraConfig.currentCameraY = cameraConfig.targetCameraY;

  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  startBtn.textContent = (window as any).pinballTranslations?.stop || 'Stop';

  const winnerDisplay = document.getElementById('winner-display') as HTMLDivElement;
  winnerDisplay.classList.add('hidden');

  const settingsPopup = document.getElementById('settings-popup') as HTMLDivElement;
  settingsPopup.classList.add('hidden');

  showToast((window as any).pinballTranslations?.gameStarted || 'Game Started!', 'success');

  return newMarbles;
}

/**
 * Stop the game
 */
export function stopGame(
  state: GameControlState,
  marbles: Marble[],
  world: World,
  currentMap: EditorMapJson | null,
  canvas: HTMLCanvasElement,
  cameraConfig: unknown
): void {
  state.gameState = 'idle';
  clearMarbles(marbles, world);

  const visibleHeight = canvas.height / cameraConfig.cameraZoom;
  const visibleWidth = canvas.width / cameraConfig.cameraZoom;

  let targetX: number;
  let targetY: number;

  if (currentMap && currentMap.meta.spawnPoint) {
    targetX = currentMap.meta.spawnPoint.x;
    targetY = currentMap.meta.spawnPoint.y;
  } else {
    targetX = canvas.width * CAMERA_VIEWPORT_CENTER_RATIO;
    targetY = DEFAULT_SPAWN_HEIGHT;
  }

  const stopCameraX = -(
    targetX - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
  );
  const stopCameraY = -(
    targetY - visibleHeight * CAMERA_VIEWPORT_CENTER_RATIO
  );

  cameraConfig.currentCameraX = stopCameraX;
  cameraConfig.currentCameraY = stopCameraY;
  cameraConfig.targetCameraX = stopCameraX;
  cameraConfig.targetCameraY = stopCameraY;
  cameraConfig.originalCameraX = stopCameraX;
  cameraConfig.originalCameraY = stopCameraY;

  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  startBtn.textContent = (window as any).pinballTranslations?.start || 'Start';

  showToast((window as any).pinballTranslations?.gameStopped || 'Game Stopped', 'error');
}

/**
 * Reset the game
 */
export function resetGame(
  state: GameControlState,
  currentMap: EditorMapJson | null,
  canvas: HTMLCanvasElement,
  cameraConfig: unknown
): void {
  state.gameState = 'idle';
  state.winnerShown = false;
  state.lastFinishedCount = 0;

  state.baseZoom = DEFAULT_CAMERA_ZOOM;
  state.targetZoom = state.baseZoom;

  const leaderboard = document.getElementById('leaderboard') as HTMLDivElement;
  if (leaderboard) {
    leaderboard.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  const visibleHeight = canvas.height / cameraConfig.cameraZoom;
  const visibleWidth = canvas.width / cameraConfig.cameraZoom;

  let targetX: number;
  let targetY: number;

  if (currentMap && currentMap.meta.spawnPoint) {
    targetX = currentMap.meta.spawnPoint.x;
    targetY = currentMap.meta.spawnPoint.y;
  } else {
    targetX = canvas.width * CAMERA_VIEWPORT_CENTER_RATIO;
    targetY = DEFAULT_SPAWN_HEIGHT;
  }

  const resetCameraX = -(
    targetX - visibleWidth * CAMERA_VIEWPORT_CENTER_RATIO
  );
  const resetCameraY = -(
    targetY - visibleHeight * CAMERA_VIEWPORT_CENTER_RATIO
  );

  cameraConfig.currentCameraX = resetCameraX;
  cameraConfig.currentCameraY = resetCameraY;
  cameraConfig.targetCameraX = resetCameraX;
  cameraConfig.targetCameraY = resetCameraY;
  cameraConfig.originalCameraX = resetCameraX;
  cameraConfig.originalCameraY = resetCameraY;

  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  startBtn.textContent = (window as any).pinballTranslations?.start || 'Start';

  // 리셋 후 설정 팝업 표시
  const settingsPopup = document.getElementById('settings-popup') as HTMLDivElement;
  if (settingsPopup) {
    settingsPopup.classList.remove('hidden');
  }

  const winnerDisplay = document.getElementById('winner-display') as HTMLDivElement;
  winnerDisplay.classList.add('hidden');

  showToast((window as any).pinballTranslations?.gameReset || 'Game Reset', 'success');
}

/**
 * End the game
 */
export function endGame(
  state: GameControlState,
  marbles: Marble[],
  settings: GameSettings
): void {
  state.gameState = 'idle';

  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  startBtn.textContent = (window as any).pinballTranslations?.start || 'Start';

  const winnerDisplay = document.getElementById('winner-display') as HTMLDivElement;
  if (winnerDisplay.classList.contains('hidden')) {
    const winner = determineWinner(marbles, settings.winnerMode, settings.customRank);
    if (winner) {
      showWinner(winner);
    }
  }

  enableSettingsPopupOnClick(state.gameState);
}

/**
 * Check winner condition and show winner if met
 */
export function checkWinnerCondition(
  state: GameControlState,
  marbles: Marble[],
  settings: GameSettings,
  attachWinnerButtonListeners: () => void
): void {
  if (state.winnerShown) return;

  const finishedMarbles = marbles.filter(m => m.finished)
    .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));

  let winner: Marble | null = null;
  let shouldEndGame = false;

  switch (settings.winnerMode) {
    case 'first':
      if (finishedMarbles.length >= 1) {
        winner = finishedMarbles[0];
      }
      break;
    case 'last':
      if (finishedMarbles.length === marbles.length) {
        winner = finishedMarbles[finishedMarbles.length - 1];
        shouldEndGame = true;
      }
      break;
    case 'custom': {
      const rank = settings.customRank - 1;
      if (finishedMarbles.length > rank) {
        winner = finishedMarbles[rank];
      }
      break;
    }
    case 'topN': {
      if (finishedMarbles.length >= settings.topNCount) {
        const topNWinners = finishedMarbles.slice(0, settings.topNCount);
        state.winnerShown = true;
        showTopNWinners(topNWinners, settings, attachWinnerButtonListeners);
        enableSettingsPopupOnClick(state.gameState);
        return;
      }
      break;
    }
  }

  if (winner) {
    state.winnerShown = true;
    if (shouldEndGame) {
      state.gameState = 'finished';
    }
    showWinner(winner);
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    startBtn.textContent = (window as any).pinballTranslations?.stop || 'Stop';
    enableSettingsPopupOnClick(state.gameState);
  }
}
