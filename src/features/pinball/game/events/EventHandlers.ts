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
  mapManager: unknown;
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

// Store keyboard event handler to allow cleanup
let documentKeyDownHandler: ((e: KeyboardEvent) => void) | null = null;

/**
 * Setup keyboard events
 */
function setupKeyboardEvents(): void {
  // Remove previous listener if exists
  if (documentKeyDownHandler) {
    document.removeEventListener('keydown', documentKeyDownHandler);
  }

  documentKeyDownHandler = (e: KeyboardEvent) => {
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
  };

  document.addEventListener('keydown', documentKeyDownHandler);
}

// Store mouse event handlers to allow cleanup
let canvasWheelHandler: ((e: WheelEvent) => void) | null = null;
let canvasMouseDownHandler: ((e: MouseEvent) => void) | null = null;
let windowMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
let windowMouseUpHandler: ((e: MouseEvent) => void) | null = null;

// Pan state (shared across handler re-registrations)
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartCameraX = 0;
let panStartCameraY = 0;

/**
 * Setup mouse events
 */
function setupMouseEvents(context: EventHandlerContext): void {
  // Remove previous listeners if exist
  if (context.canvas && canvasWheelHandler) {
    context.canvas.removeEventListener('wheel', canvasWheelHandler);
  }
  if (context.canvas && canvasMouseDownHandler) {
    context.canvas.removeEventListener('mousedown', canvasMouseDownHandler);
  }
  if (windowMouseMoveHandler) {
    window.removeEventListener('mousemove', windowMouseMoveHandler);
  }
  if (windowMouseUpHandler) {
    window.removeEventListener('mouseup', windowMouseUpHandler);
  }

  // Wheel event for zoom
  canvasWheelHandler = (e: WheelEvent) => {
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
  };

  context.canvas.addEventListener('wheel', canvasWheelHandler);

  // Pan with middle mouse button
  canvasMouseDownHandler = (e: MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartCameraX = context.targetCameraX;
      panStartCameraY = context.targetCameraY;
      context.canvas.style.cursor = 'grabbing';
    }
  };

  context.canvas.addEventListener('mousedown', canvasMouseDownHandler);

  windowMouseMoveHandler = (e: MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - panStartX;
      const deltaY = e.clientY - panStartY;
      context.targetCameraX = panStartCameraX + deltaX / context.targetZoom;
      context.targetCameraY = panStartCameraY + deltaY / context.targetZoom;
    }
  };

  window.addEventListener('mousemove', windowMouseMoveHandler);

  windowMouseUpHandler = (e: MouseEvent) => {
    if (e.button === 1 && isPanning) {
      isPanning = false;
      context.canvas.style.cursor = 'default';
    }
  };

  window.addEventListener('mouseup', windowMouseUpHandler);
}

// Store event handlers to allow cleanup
let speedSliderHandler: ((event: Event) => void) | null = null;
let startBtnHandler: (() => void) | null = null;
let resetBtnHandler: (() => void) | null = null;
let namesInputHandler: (() => void) | null = null;

/**
 * Setup control button events
 */
function setupControlEvents(
  context: EventHandlerContext,
  callbacks: EventHandlerCallbacks
): void {
  // Start/Stop button
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

  // Remove previous listener if exists
  if (startBtn && startBtnHandler) {
    startBtn.removeEventListener('click', startBtnHandler);
  }

  startBtnHandler = () => {
    if (context.gameState === 'idle') {
      callbacks.startGame();
    } else {
      callbacks.stopGame();
    }
  };

  startBtn?.addEventListener('click', startBtnHandler);

  // Reset button
  const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

  // Remove previous listener if exists
  if (resetBtn && resetBtnHandler) {
    resetBtn.removeEventListener('click', resetBtnHandler);
  }

  resetBtnHandler = () => {
    callbacks.resetGame();
  };

  resetBtn?.addEventListener('click', resetBtnHandler);

  // Speed slider
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
  const speedValue = document.getElementById('speed-value') as HTMLSpanElement;

  // 초기 값 설정 - 기본값 0.3으로 설정 (세션 스토리지에서 나중에 덮어씀)
  if (speedSlider && speedValue) {
    const initialValue = DEFAULT_TIME_SCALE;
    context.timeScale = initialValue;
    updateSpeedUI(initialValue);
  }

  // Remove previous listener if exists
  if (speedSlider && speedSliderHandler) {
    speedSlider.removeEventListener('input', speedSliderHandler);
  }

  // 슬라이더 이벤트 리스너는 초기화 완료 후 추가 (초기화 중 자동 발생 방지)
  setTimeout(() => {
    speedSliderHandler = () => {
      const rawValue = parseFloat(speedSlider.value);
      const value = Math.max(TIME_SCALE_MIN, Math.min(TIME_SCALE_MAX, rawValue));
      context.timeScale = value;
      callbacks.updateUserTimeScale(value); // 사용자 설정 속도 업데이트
      // 속도 표시 텍스트 업데이트
      updateSpeedUI(value);
      // 설정 변경 콜백 호출
      callbacks.onSettingsChange();
    };

    speedSlider?.addEventListener('input', speedSliderHandler);
  }, 100);

  // Map selector - now handled by MapSelectionModal
  // Old select element no longer exists

  // Names input - real-time participant parsing
  const namesInput = document.getElementById('names-input') as HTMLTextAreaElement;

  // Remove previous listener if exists
  if (namesInput && namesInputHandler) {
    namesInput.removeEventListener('input', namesInputHandler);
  }

  namesInputHandler = () => {
    callbacks.parseParticipants(false);
  };

  namesInput?.addEventListener('input', namesInputHandler);
}

// Store settings event handlers to allow cleanup
let settingsBtnHandler: (() => void) | null = null;
let closeSettingsBtnHandler: (() => void) | null = null;
let winnerModeSelectHandler: (() => void) | null = null;
let customRankInputHandler: (() => void) | null = null;
let topNInputHandler: (() => void) | null = null;
let saveSettingsBtnHandler: (() => void) | null = null;
let loadSettingsBtnHandler: (() => void) | null = null;
let editorBtnHandler: (() => void) | null = null;

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

  if (settingsBtn && settingsBtnHandler) {
    settingsBtn.removeEventListener('click', settingsBtnHandler);
  }

  settingsBtnHandler = () => {
    settingsPopup.classList.toggle('hidden');
  };

  settingsBtn?.addEventListener('click', settingsBtnHandler);

  // Close settings
  const closeSettingsBtn = document.getElementById('close-settings-btn') as HTMLButtonElement;

  if (closeSettingsBtn && closeSettingsBtnHandler) {
    closeSettingsBtn.removeEventListener('click', closeSettingsBtnHandler);
  }

  closeSettingsBtnHandler = () => {
    settingsPopup.classList.add('hidden');
  };

  closeSettingsBtn?.addEventListener('click', closeSettingsBtnHandler);

  // Winner mode select
  const winnerModeSelect = document.getElementById('winner-mode') as HTMLSelectElement;

  if (winnerModeSelect && winnerModeSelectHandler) {
    winnerModeSelect.removeEventListener('change', winnerModeSelectHandler);
  }

  winnerModeSelectHandler = () => {
    const mode = winnerModeSelect.value as WinnerMode;
    context.settings.winnerMode = mode;

    // Show/hide custom rank input
    const customRankInput = document.getElementById('custom-rank') as HTMLInputElement;
    const topNInput = document.getElementById('top-n-count') as HTMLInputElement;

    if (customRankInput) customRankInput.style.display = mode === 'custom' ? 'block' : 'none';
    if (topNInput) topNInput.style.display = mode === 'topN' ? 'block' : 'none';

    callbacks.onSettingsChange();
  };

  winnerModeSelect?.addEventListener('change', winnerModeSelectHandler);

  // Custom rank input
  const customRankInput = document.getElementById('custom-rank') as HTMLInputElement;

  if (customRankInput && customRankInputHandler) {
    customRankInput.removeEventListener('input', customRankInputHandler);
  }

  customRankInputHandler = () => {
    context.settings.customRank = parseInt(customRankInput.value) || 1;
    callbacks.onSettingsChange();
  };

  customRankInput?.addEventListener('input', customRankInputHandler);

  // Top N input
  const topNInput = document.getElementById('top-n-count') as HTMLInputElement;

  if (topNInput && topNInputHandler) {
    topNInput.removeEventListener('input', topNInputHandler);
  }

  topNInputHandler = () => {
    context.settings.topNCount = parseInt(topNInput.value) || 3;
    callbacks.onSettingsChange();
  };

  topNInput?.addEventListener('input', topNInputHandler);

  // Save/Load settings buttons
  const saveSettingsBtn = document.getElementById('save-settings-btn') as HTMLButtonElement;

  if (saveSettingsBtn && saveSettingsBtnHandler) {
    saveSettingsBtn.removeEventListener('click', saveSettingsBtnHandler);
  }

  saveSettingsBtnHandler = () => {
    saveSettings(context.settings);
  };

  saveSettingsBtn?.addEventListener('click', saveSettingsBtnHandler);

  const loadSettingsBtn = document.getElementById('load-settings-btn') as HTMLButtonElement;

  if (loadSettingsBtn && loadSettingsBtnHandler) {
    loadSettingsBtn.removeEventListener('click', loadSettingsBtnHandler);
  }

  loadSettingsBtnHandler = () => {
    loadSettings(context.settings, callbacks.onSettingsChange);
  };

  loadSettingsBtn?.addEventListener('click', loadSettingsBtnHandler);

  // Editor button
  const editorBtn = document.getElementById('editor-btn') as HTMLButtonElement;

  if (editorBtn && editorBtnHandler) {
    editorBtn.removeEventListener('click', editorBtnHandler);
  }

  editorBtnHandler = () => {
    const modal = document.getElementById('editorModal') as HTMLDivElement;
    if (modal) modal.style.display = 'block';
  };

  editorBtn?.addEventListener('click', editorBtnHandler);
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
