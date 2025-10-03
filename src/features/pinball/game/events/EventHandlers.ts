/**
 * Event handling system
 * Manages all user input and DOM events
 */

import { GameState, GameSettings, Marble, Participant, WinnerMode } from '../../shared/types';
import { EditorMapJson } from '../../shared/types/editorMap';
import { World } from 'planck';
import { showToast } from '../ui/ToastManager';
import { updateSpeedUI } from '../ui/GameUiController';
import { DEFAULT_TIME_SCALE, TIME_SCALE_MIN, TIME_SCALE_MAX } from '../constants/ui';
import { CAMERA_ZOOM_SPEED, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX } from '../constants/camera';

export interface EventHandlerContext {
  canvas: HTMLCanvasElement;
  gameState: GameState;
  settings: GameSettings;
  targetZoom: number;
  baseZoom: number;
  targetCameraX: number;
  targetCameraY: number;
  participants: Participant[];
  marbles: Marble[];
  world: World;
  currentMap: EditorMapJson | null;
  mapManager: any;
  timeScale: number;
}

export interface EventHandlerCallbacks {
  startGame(): void;
  stopGame(): void;
  resetGame(): void | Promise<void>;
  // eslint-disable-next-line no-unused-vars
  loadMapCallback: (mapName: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  parseParticipants: (verbose: boolean) => boolean;
  onSettingsChange(): void;
  // eslint-disable-next-line no-unused-vars
  updateUserTimeScale: (newTimeScale: number) => void;
}

/**
 * Setup all event listeners
 */
export function setupEventListeners(
  context: EventHandlerContext,
  callbacks: EventHandlerCallbacks
): void {
  setupKeyboardEvents();
  setupMouseEvents(context);
  setupControlEvents(context, callbacks);
  setupSettingsEvents(context, callbacks);
}

/**
 * Setup keyboard events
 */
function setupKeyboardEvents(): void {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const settingsPopup = document.getElementById('settings-popup') as HTMLDivElement;
      const winnerDisplay = document.getElementById('winner-display') as HTMLDivElement;
      const modal = document.getElementById('editorModal') as HTMLDivElement;

      if (settingsPopup && !settingsPopup.classList.contains('hidden')) {
        settingsPopup.classList.add('hidden');
      } else if (winnerDisplay && !winnerDisplay.classList.contains('hidden')) {
        winnerDisplay.classList.add('hidden');
      } else if (modal && modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    } else if (e.key === 'F3') {
      // F3로 성능 모니터 토글
      e.preventDefault();
      const performanceMonitor = document.getElementById('performance-monitor') as HTMLDivElement;
      if (performanceMonitor) {
        performanceMonitor.classList.toggle('hidden');
      }
    }
  });
}

/**
 * Setup mouse events
 */
function setupMouseEvents(context: EventHandlerContext): void {
  context.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -CAMERA_ZOOM_SPEED : CAMERA_ZOOM_SPEED;

    // Calculate new zoom level
    const newZoom = Math.max(CAMERA_ZOOM_MIN, Math.min(CAMERA_ZOOM_MAX, context.targetZoom + delta));

    // Get mouse position relative to canvas
    const rect = context.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to world coordinates before zoom
    const worldX = (mouseX / context.targetZoom) - context.targetCameraX;
    const worldY = (mouseY / context.targetZoom) - context.targetCameraY;

    // Apply zoom
    context.targetZoom = newZoom;

    // Adjust camera to keep mouse position stable
    context.targetCameraX = (mouseX / newZoom) - worldX;
    context.targetCameraY = (mouseY / newZoom) - worldY;
  });

  // Pan with middle mouse button
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panStartCameraX = 0;
  let panStartCameraY = 0;

  context.canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartCameraX = context.targetCameraX;
      panStartCameraY = context.targetCameraY;
      context.canvas.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isPanning) {
      const deltaX = e.clientX - panStartX;
      const deltaY = e.clientY - panStartY;
      context.targetCameraX = panStartCameraX + deltaX / context.targetZoom;
      context.targetCameraY = panStartCameraY + deltaY / context.targetZoom;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 1 && isPanning) {
      isPanning = false;
      context.canvas.style.cursor = 'default';
    }
  });
}

/**
 * Setup control button events
 */
function setupControlEvents(
  context: EventHandlerContext,
  callbacks: EventHandlerCallbacks
): void {
  // Start/Stop button
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  startBtn?.addEventListener('click', () => {
    if (context.gameState === 'idle') {
      callbacks.startGame();
    } else {
      callbacks.stopGame();
    }
  });

  // Reset button
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
  resetBtn?.addEventListener('click', () => {
    callbacks.resetGame();
  });

  // Speed slider
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
  const speedValue = document.getElementById('speed-value') as HTMLSpanElement;

  // 초기 값 설정 - 기본값 0.3으로 설정 (세션 스토리지에서 나중에 덮어씀)
  if (speedSlider && speedValue) {
    const initialValue = DEFAULT_TIME_SCALE;
    context.timeScale = initialValue;
    updateSpeedUI(initialValue);
  }

  // 슬라이더 이벤트 리스너는 초기화 완료 후 추가 (초기화 중 자동 발생 방지)
  setTimeout(() => {
    speedSlider?.addEventListener('input', () => {
      const rawValue = parseFloat(speedSlider.value);
      const value = Math.max(TIME_SCALE_MIN, Math.min(TIME_SCALE_MAX, rawValue));
      context.timeScale = value;
      callbacks.updateUserTimeScale(value); // 사용자 설정 속도 업데이트
      // 속도 표시 텍스트 업데이트
      updateSpeedUI(value);
      // 설정 변경 콜백 호출
      callbacks.onSettingsChange();
    });
  }, 100);

  // Map selector
  const mapSelector = document.getElementById('map-select') as HTMLSelectElement;
  mapSelector?.addEventListener('change', async () => {
    const mapName = mapSelector.value;
    if (mapName && mapName !== 'none') {
      await callbacks.loadMapCallback(mapName);
    }
  });

  // Names input - real-time participant parsing
  const namesInput = document.getElementById('names-input') as HTMLTextAreaElement;
  namesInput?.addEventListener('input', () => {
    callbacks.parseParticipants(false);
  });
}

/**
 * Setup settings events
 */
function setupSettingsEvents(
  context: EventHandlerContext,
  callbacks: EventHandlerCallbacks
): void {
  // Settings toggle
  const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
  const settingsPopup = document.getElementById('settings-popup') as HTMLDivElement;
  settingsBtn?.addEventListener('click', () => {
    settingsPopup.classList.toggle('hidden');
  });

  // Close settings
  const closeSettingsBtn = document.getElementById('close-settings-btn') as HTMLButtonElement;
  closeSettingsBtn?.addEventListener('click', () => {
    settingsPopup.classList.add('hidden');
  });

  // Winner mode select
  const winnerModeSelect = document.getElementById('winner-mode') as HTMLSelectElement;
  winnerModeSelect?.addEventListener('change', () => {
    const mode = winnerModeSelect.value as WinnerMode;
    context.settings.winnerMode = mode;

    // Show/hide custom rank input
    const customRankInput = document.getElementById('custom-rank') as HTMLInputElement;
    const topNInput = document.getElementById('top-n-count') as HTMLInputElement;

    if (customRankInput) customRankInput.style.display = mode === 'custom' ? 'block' : 'none';
    if (topNInput) topNInput.style.display = mode === 'topN' ? 'block' : 'none';

    callbacks.onSettingsChange();
  });

  // Custom rank input
  const customRankInput = document.getElementById('custom-rank') as HTMLInputElement;
  customRankInput?.addEventListener('input', () => {
    context.settings.customRank = parseInt(customRankInput.value) || 1;
    callbacks.onSettingsChange();
  });

  // Top N input
  const topNInput = document.getElementById('top-n-count') as HTMLInputElement;
  topNInput?.addEventListener('input', () => {
    context.settings.topNCount = parseInt(topNInput.value) || 3;
    callbacks.onSettingsChange();
  });

  // Save/Load settings buttons
  const saveSettingsBtn = document.getElementById('save-settings-btn') as HTMLButtonElement;
  saveSettingsBtn?.addEventListener('click', () => {
    saveSettings(context.settings);
  });

  const loadSettingsBtn = document.getElementById('load-settings-btn') as HTMLButtonElement;
  loadSettingsBtn?.addEventListener('click', () => {
    loadSettings(context.settings, callbacks.onSettingsChange);
  });

  // Editor button
  const editorBtn = document.getElementById('editor-btn') as HTMLButtonElement;
  editorBtn?.addEventListener('click', () => {
    const modal = document.getElementById('editorModal') as HTMLDivElement;
    if (modal) modal.style.display = 'block';
  });
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem('pinball-settings', JSON.stringify(settings));
    showToast('Settings saved!', 'success');
  } catch (error) {
    showToast('Failed to save settings', 'error');
  }
}

/**
 * Load settings from localStorage
 */
function loadSettings(settings: GameSettings, onLoad: () => void): void {
  try {
    const saved = localStorage.getItem('pinball-settings');
    if (saved) {
      const loaded = JSON.parse(saved);
      Object.assign(settings, loaded);

      // Update UI
      const winnerModeRadios = document.querySelectorAll('input[name="winner-mode"]');
      winnerModeRadios.forEach(radio => {
        const input = radio as HTMLInputElement;
        input.checked = input.value === settings.winnerMode;
      });

      const customRankInput = document.getElementById('custom-rank-input') as HTMLInputElement;
      if (customRankInput) customRankInput.value = settings.customRank.toString();

      const topNInput = document.getElementById('topN-input') as HTMLInputElement;
      if (topNInput) topNInput.value = settings.topNCount.toString();

      // Show/hide custom inputs
      const customRankDiv = document.getElementById('custom-rank-div') as HTMLDivElement;
      const topNDiv = document.getElementById('topN-div') as HTMLDivElement;
      if (customRankDiv) customRankDiv.style.display = settings.winnerMode === 'custom' ? 'flex' : 'none';
      if (topNDiv) topNDiv.style.display = settings.winnerMode === 'topN' ? 'flex' : 'none';

      onLoad();
      showToast('Settings loaded!', 'success');
    }
  } catch (error) {
    showToast('Failed to load settings', 'error');
  }
}
