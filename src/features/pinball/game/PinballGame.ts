import { World } from 'planck';
import { Participant, Marble, GameState, MapType, GameSettings } from '../shared/types';
import { GameWorld, GameEntity, Wall } from '../shared/types/gameObjects';
import { EditorMapJson } from '../shared/types/editorMap';
import {
  MinimapConfig,
  renderMinimap,
  setupMinimapEvents
} from './minimap/MinimapManager';
import {
  setupEventListeners,
  EventHandlerContext,
  EventHandlerCallbacks
} from './events/EventHandlers';
import {
  GameLoopContext
} from './core/GameLoop';
import {
  LoopSnapshot,
  LoopStateUpdate
} from './core/LoopBindings';
import { showToast } from './ui/ToastManager';
import { saveToStorage, loadFromStorage } from './storage/GameStorage';
import { setupSettingsPopup } from './ui/SettingsUI';
import { CameraConfig } from './camera/CameraManager';
import { CameraBindingSnapshot, cameraStateFromConfig, ensureCameraConfig } from './camera/CameraBindings';
import { clearMarbles } from './physics/PhysicsHelpers';
import { setupContactListener } from './physics/ContactHandler';
import { getWinners } from './entities/MarbleManager';
import {
  DEFAULT_CAMERA_ZOOM
} from './constants/camera';
import {
  FIXED_TIME_STEP
} from './constants/physics';
import {
  DEFAULT_TIME_SCALE,
  TIME_SCALE_MIN,
  TIME_SCALE_MAX
} from './constants/ui';
import {
  GameControlState,
  startGame,
  stopGame,
  resetGame
} from './control/GameController';
import {
  createBootstrapResources,
  createInitialControlState
} from './setup/GameBootstrapper';
import { CanvasResizeHandle, registerCanvasResize } from './setup/CanvasResizer';
import {
  initializeMapSelect,
  loadMapIntoState
} from './map/MapLifecycleManager';
import {
  initializeParticipants,
  refreshPreviewMarbles,
  removeWinnersFromParticipants
} from './services/ParticipantPreviewService';
import {
  saveGameSession,
  loadGameSession,
  loadSavedSettings
} from './storage/GameSessionStorage';
import { startLoopWithBindings } from './loop/GameLoopAdapter';
import { createCameraStateAdapter } from './camera/CameraStateAdapter';
import {
  attachWinnerButtonListeners,
  hideWinnerDisplay,
  showWinnerToast,
  updateSpeedUI
} from './ui/GameUiController';

export class PinballRoulette {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private minimapCanvas: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;
  private world: World;
  private marbles: Marble[] = [];
  private gameWorld: GameWorld = new GameWorld();
  private participants: Participant[] = [];
  private gameState: GameState = 'idle';
  private settings: GameSettings;
  private finishLine: number = 0;
  private currentMap: EditorMapJson | null = null;
  private lastFinishedCount: number = 0; // 마지막으로 확인한 완주자 수
  private gameStartTime: number = 0;
  private timeScale: number = DEFAULT_TIME_SCALE; // 현재 게임 속도 (슬로우모션 포함)
  private userTimeScale: number = DEFAULT_TIME_SCALE; // 사용자 설정 속도 (슬로우모션 영향 없음)
  private currentCameraX: number = 0;
  private currentCameraY: number = 0;
  private targetCameraX: number = 0;
  private targetCameraY: number = 0;
  private cameraZoom: number = DEFAULT_CAMERA_ZOOM; // 카메라 줌 - setCameraZoom()에서 관리
  private baseZoom: number = DEFAULT_CAMERA_ZOOM; // 기본 줌 레벨
  private targetZoom: number = DEFAULT_CAMERA_ZOOM; // 목표 줌 레벨 (부드러운 전환용)
  private gameAreaBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 }; // 에디터 맵에 따라 동적으로 설정
  private winnerShown: boolean = false;
  private minimapMouseX: number = 0;
  private minimapMouseY: number = 0;
  private isMinimapHovered: boolean = false;
  private originalCameraX: number = 0;
  private originalCameraY: number = 0;
  private controlState: GameControlState;
  private cameraConfig: CameraConfig | null = null;
  private gameLoopContext: GameLoopContext | null = null;
  private readonly fixedTimeStep = FIXED_TIME_STEP;
  private canvasResizeHandle?: CanvasResizeHandle;
  private isResetting: boolean = false;
  private loadMapAbortController?: AbortController;

  constructor() {
    const {
      canvas,
      ctx,
      minimapCanvas,
      minimapCtx,
      world,
      settings
    } = createBootstrapResources();

    this.canvas = canvas;
    this.ctx = ctx;
    this.minimapCanvas = minimapCanvas;
    this.minimapCtx = minimapCtx;
    this.world = world;
    this.settings = settings;

    // Setup contact listener for physics collisions
    setupContactListener(this.world);

    this.controlState = createInitialControlState({
      gameState: this.gameState,
      winnerShown: this.winnerShown,
      lastFinishedCount: this.lastFinishedCount,
      baseZoom: this.baseZoom,
      targetZoom: this.targetZoom,
      timeScale: this.timeScale,
      gameStartTime: this.gameStartTime
    });

    this.init();
    setupSettingsPopup();
    this.setupMinimapEvents();
  }

  private async init(): Promise<void> {
    this.setupEventListeners();
    loadFromStorage(this.settings);

    const mapSelect = document.getElementById('map-select') as HTMLSelectElement | null;
    if (mapSelect) {
      await initializeMapSelect(mapSelect);
    }

    // 맵 목록 로딩 완료 후 세션 스토리지에서 설정 복원
    this.loadFromSessionStorage();

    this.canvasResizeHandle = registerCanvasResize(this.canvas, () => {
      // 게임이 진행 중이 아닐 때만 맵 재로드
      if (this.gameState !== 'running') {
        return this.loadEditorMap();
      }
    });
    await this.canvasResizeHandle.triggerResize();

    this.participants = initializeParticipants(true);
    this.settings.participants = this.participants;
    this.marbles = refreshPreviewMarbles(this.participants, this.currentMap, this.canvas.width);

    // 카메라 줌 설정
    this.cameraZoom = DEFAULT_CAMERA_ZOOM;
    this.targetZoom = DEFAULT_CAMERA_ZOOM;
    this.baseZoom = DEFAULT_CAMERA_ZOOM;

    this.startGameLoop();
  }

  private setupEventListeners(): void {
    const context: EventHandlerContext = {
      canvas: this.canvas,
      gameState: this.gameState,
      settings: this.settings,
      targetZoom: this.targetZoom,
      baseZoom: this.baseZoom,
      targetCameraX: this.targetCameraX,
      targetCameraY: this.targetCameraY,
      participants: this.participants,
      marbles: this.marbles,
      world: this.world,
      currentMap: this.currentMap,
      mapManager: null as any,
      timeScale: this.timeScale
    };

    const callbacks: EventHandlerCallbacks = {
      startGame: () => this.startGame(),
      stopGame: () => this.stopGame(),
      resetGame: async () => await this.resetGame(),
      loadMapCallback: async (mapName: string) => {
        this.settings.mapType = mapName as MapType;
        await this.loadEditorMap(mapName);
        showToast(`Map changed: ${mapName}`, 'success');
      },
      parseParticipants: (verbose: boolean) => {
        this.participants = initializeParticipants(verbose);
        this.settings.participants = this.participants;
        return this.participants.length > 0;
      },
      onSettingsChange: () => {
        saveToStorage(this.settings);
        this.saveToSessionStorage();
      },
      updateUserTimeScale: (newTimeScale: number) => {
        this.userTimeScale = newTimeScale;
        if (this.gameState === 'idle') {
          this.timeScale = newTimeScale;
        }
      }
    };

    setupEventListeners(context, callbacks);

    // Map selector specific setup
    const mapSelect = document.getElementById('map-select') as HTMLSelectElement;
    mapSelect?.addEventListener('change', async (e) => {
      const target = e.target as HTMLSelectElement;
      this.settings.mapType = target.value as MapType;
      await this.loadEditorMap(target.value);
      showToast(`Map changed: ${target.value}`, 'success');
      this.saveToSessionStorage();
    });

    // Real-time participant updates
    const namesInput = document.getElementById('names-input') as HTMLTextAreaElement;
    namesInput?.addEventListener('input', () => {
      if (this.gameState === 'idle') {
        this.participants = initializeParticipants(true);
        this.settings.participants = this.participants;
        clearMarbles(this.marbles, this.world);
        this.marbles = refreshPreviewMarbles(this.participants, this.currentMap, this.canvas.width);
        this.saveToSessionStorage();
      }
    });

    // Winner display buttons (initial setup)
    this.attachWinnerButtons();
  }

  private attachWinnerButtons(): void {
    attachWinnerButtonListeners(
      async () => {
        this.hideWinner();
        await this.resetGame();
      },
      () => this.removeWinnersAndReset()
    );
  }

  private async loadEditorMap(mapName?: string): Promise<void> {
    // Cancel any ongoing map loading
    if (this.loadMapAbortController) {
      this.loadMapAbortController.abort();
    }

    // Create new abort controller for this operation
    this.loadMapAbortController = new AbortController();
    const signal = this.loadMapAbortController.signal;

    try {
      const mapSelect = document.getElementById('map-select') as HTMLSelectElement | null;
      const targetMapName = mapName ?? mapSelect?.value ?? 'default';

      // Check if operation was aborted before async call
      if (signal.aborted) return;

      const result = await loadMapIntoState({
        world: this.world,
        canvas: this.canvas,
        participants: this.participants,
        marbles: this.marbles,
        gameWorld: this.gameWorld,
        gameState: this.gameState,
        currentMap: this.currentMap,
        mapName: targetMapName,
        cameraZoom: this.cameraZoom
      });

      // Check if operation was aborted after async call
      if (signal.aborted) return;

      this.currentMap = result.map;
      this.gameWorld = result.gameWorld;
      this.finishLine = result.finishLine;

      this.gameAreaBounds = result.camera.gameAreaBounds;
      this.targetCameraX = result.camera.targetCameraX;
      this.targetCameraY = result.camera.targetCameraY;
      this.currentCameraX = result.camera.targetCameraX;
      this.currentCameraY = result.camera.targetCameraY;
      this.originalCameraX = result.camera.targetCameraX;
      this.originalCameraY = result.camera.targetCameraY;

      this.marbles = result.marbles;
    } catch (error) {
      // Ignore abort errors
      if ((error as any)?.name !== 'AbortError') {
        console.error('Failed to load editor map:', error);
      }
    }
  }





  private startGame(): void {
    // Prevent starting game during reset
    if (this.isResetting) return;

    const cameraConfig = this.getCameraConfig();
    this.marbles = startGame(
      this.controlState,
      this.settings,
      this.participants,
      this.marbles,
      this.world,
      this.currentMap,
      this.canvas,
      cameraConfig,
      () => {
        this.participants = initializeParticipants();
        this.settings.participants = this.participants;
        return this.participants.length > 0;
      }
    );
    
    // Sync state back
    this.gameState = this.controlState.gameState;
    this.winnerShown = this.controlState.winnerShown;
    this.lastFinishedCount = this.controlState.lastFinishedCount;
    this.baseZoom = this.controlState.baseZoom;
    this.targetZoom = this.controlState.targetZoom;
    this.timeScale = this.controlState.timeScale;
    this.gameStartTime = this.controlState.gameStartTime;
    this.cameraZoom = this.baseZoom;
    this.targetCameraX = cameraConfig.targetCameraX;
    this.targetCameraY = cameraConfig.targetCameraY;
    this.currentCameraX = cameraConfig.currentCameraX;
    this.currentCameraY = cameraConfig.currentCameraY;

  }

  private stopGame(): void {
    const cameraConfig = this.getCameraConfig();
    stopGame(
      this.controlState,
      this.marbles,
      this.world,
      this.currentMap,
      this.canvas,
      cameraConfig
    );
    // Sync state back
    this.gameState = this.controlState.gameState;
    this.currentCameraX = cameraConfig.currentCameraX;
    this.currentCameraY = cameraConfig.currentCameraY;
    this.targetCameraX = cameraConfig.targetCameraX;
    this.targetCameraY = cameraConfig.targetCameraY;
    this.originalCameraX = cameraConfig.originalCameraX;
    this.originalCameraY = cameraConfig.originalCameraY;

    // Clear and recreate preview marbles
    clearMarbles(this.marbles, this.world);
    this.participants = initializeParticipants(true);
    this.settings.participants = this.participants;
    this.marbles = refreshPreviewMarbles(this.participants, this.currentMap, this.canvas.width);
  }

  private hideWinner(): void {
    hideWinnerDisplay();
  }


  private async removeWinnersAndReset(): Promise<void> {
    // Get current winners based on winner mode
    const winners = getWinners(this.marbles, this.settings.winnerMode, this.settings.customRank, this.settings.topNCount);
    
    if (winners.length > 0) {
      const namesInput = document.getElementById('names-input') as HTMLTextAreaElement | null;
      if (namesInput) {
        removeWinnersFromParticipants(namesInput, winners);
        showWinnerToast(winners);
      }
    }
    
    // Hide winner display and reset the game
    this.hideWinner();
    await this.resetGame();
  }

  private async resetGame(): Promise<void> {
    // Prevent multiple concurrent resets
    if (this.isResetting) return;
    this.isResetting = true;

    try {
      // Reset zoom first
      this.baseZoom = DEFAULT_CAMERA_ZOOM;
      this.targetZoom = this.baseZoom;
      this.cameraZoom = this.baseZoom;

      // Clear ALL bodies from World before loading new map
      // This ensures no duplicate bodies remain from interrupted loadEditorMap calls
      let body = this.world.getBodyList();
      while (body) {
        const next = body.getNext();
        this.world.destroyBody(body);
        body = next;
      }

      // 맵을 다시 로드하여 터진 버블 등 모든 오브젝트를 초기화
      await this.loadEditorMap();

      const cameraConfig = this.getCameraConfig();
      resetGame(
        this.controlState,
        this.currentMap,
        this.canvas,
        cameraConfig
      );
      // Sync state back
      this.gameState = this.controlState.gameState;
      this.winnerShown = this.controlState.winnerShown;
      this.lastFinishedCount = this.controlState.lastFinishedCount;
      this.currentCameraX = cameraConfig.currentCameraX;
      this.currentCameraY = cameraConfig.currentCameraY;
      this.targetCameraX = cameraConfig.targetCameraX;
      this.targetCameraY = cameraConfig.targetCameraY;
      this.originalCameraX = cameraConfig.originalCameraX;
      this.originalCameraY = cameraConfig.originalCameraY;

      // Clear and recreate preview marbles
      clearMarbles(this.marbles, this.world);
      this.participants = initializeParticipants(true);
      this.settings.participants = this.participants;
      this.marbles = refreshPreviewMarbles(this.participants, this.currentMap, this.canvas.width);
    } finally {
      this.isResetting = false;
    }
  }


  private startGameLoop(): void {
    const cameraAdapter = createCameraStateAdapter(
      () => this.createCameraSnapshot(),
      (state) => this.applyCameraState(state),
      (config) => { this.cameraConfig = config; }
    );

    this.gameLoopContext = startLoopWithBindings({
      createSnapshot: () => this.createLoopSnapshot(cameraAdapter),
      applyState: (update) => this.applyLoopState(update, cameraAdapter),
      onRenderComplete: () => this.renderMinimap(),
      onWinnerCheck: () => this.attachWinnerButtons(),
      onEndGame: () => {
        /* handled externally */
      }
    });
  }

  private createLoopSnapshot(cameraAdapter: ReturnType<typeof createCameraStateAdapter>): LoopSnapshot {
    return {
      world: this.world,
      gameState: this.gameState,
      marbles: this.marbles,
      gameWorld: this.gameWorld,
      finishLine: this.finishLine,
      timeScale: this.timeScale,
      userTimeScale: this.userTimeScale,
      fixedTimeStep: this.fixedTimeStep,
      gameStartTime: this.gameStartTime,
      baseZoom: this.baseZoom,
      targetZoom: this.targetZoom,
      lastFinishedCount: this.lastFinishedCount,
      winnerShown: this.winnerShown,
      cameraConfig: cameraAdapter.getConfig(),
      controlState: this.controlState,
      settings: this.settings,
      canvas: this.canvas,
      ctx: this.ctx
    };
  }

  private applyLoopState(
    update: LoopStateUpdate,
    cameraAdapter: ReturnType<typeof createCameraStateAdapter>
  ): void {
    this.gameState = update.gameState;
    this.timeScale = update.timeScale;
    this.userTimeScale = update.userTimeScale;
    this.baseZoom = update.baseZoom;
    this.targetZoom = update.targetZoom;
    this.lastFinishedCount = update.lastFinishedCount;
    this.winnerShown = update.winnerShown;
    this.marbles = update.marbles;
    this.gameWorld = update.gameWorld;
    this.finishLine = update.finishLine;
    this.gameStartTime = update.gameStartTime;
    this.controlState = update.controlState;
    this.settings = update.settings;
    this.cameraConfig = update.cameraConfig;
    cameraAdapter.applyConfig(update.cameraConfig);
  }

  private getCameraConfig(): CameraConfig {
    const config = ensureCameraConfig(this.createCameraSnapshot());
    this.cameraConfig = config;
    return config;
  }

  private createCameraSnapshot(): CameraBindingSnapshot {
    return {
      canvas: this.canvas,
      cameraZoom: this.cameraZoom,
      currentCameraX: this.currentCameraX,
      currentCameraY: this.currentCameraY,
      targetCameraX: this.targetCameraX,
      targetCameraY: this.targetCameraY,
      baseZoom: this.baseZoom,
      targetZoom: this.targetZoom,
      gameAreaBounds: this.gameAreaBounds,
      isMinimapHovered: this.isMinimapHovered,
      originalCameraX: this.originalCameraX,
      originalCameraY: this.originalCameraY,
      cameraConfig: this.cameraConfig
    };
  }

  private applyCameraState(state: ReturnType<typeof cameraStateFromConfig>): void {
    this.cameraZoom = state.cameraZoom;
    this.currentCameraX = state.currentCameraX;
    this.currentCameraY = state.currentCameraY;
    this.targetCameraX = state.targetCameraX;
    this.targetCameraY = state.targetCameraY;
    this.baseZoom = state.baseZoom;
    this.targetZoom = state.targetZoom;
    this.gameAreaBounds = state.gameAreaBounds;
    this.isMinimapHovered = state.isMinimapHovered;
    this.originalCameraX = state.originalCameraX;
    this.originalCameraY = state.originalCameraY;
  }


  private getMinimapConfig(): MinimapConfig {
    return {
      minimapCanvas: this.minimapCanvas,
      minimapCtx: this.minimapCtx,
      gameAreaBounds: this.gameAreaBounds,
      finishLine: this.finishLine,
      cameraZoom: this.cameraZoom,
      currentCameraX: this.currentCameraX,
      currentCameraY: this.currentCameraY,
      canvas: this.canvas,
      minimapMouseX: this.minimapMouseX,
      minimapMouseY: this.minimapMouseY,
      isMinimapHovered: this.isMinimapHovered,
      originalCameraX: this.originalCameraX,
      originalCameraY: this.originalCameraY,
      targetCameraX: this.targetCameraX,
      targetCameraY: this.targetCameraY
    };
  }

  private renderMinimap(): void {
    const config = this.getMinimapConfig();
    renderMinimap(
      config,
      this.gameWorld,
      this.marbles
    );
  }

  private setupMinimapEvents(): void {
    setupMinimapEvents(
      this.minimapCanvas,
      () => this.getMinimapConfig(),
      () => this.gameState,
      (x: number, y: number) => {
        this.targetCameraX = x;
        this.targetCameraY = y;
      },
      () => {
        this.targetCameraX = this.originalCameraX;
        this.targetCameraY = this.originalCameraY;
      },
      (hovered: boolean, mouseX?: number, mouseY?: number) => {
        // Store original camera position when starting hover
        if (hovered && !this.isMinimapHovered) {
          this.originalCameraX = this.targetCameraX;
          this.originalCameraY = this.targetCameraY;
        }
        this.isMinimapHovered = hovered;
        if (mouseX !== undefined && mouseY !== undefined) {
          this.minimapMouseX = mouseX;
          this.minimapMouseY = mouseY;
        }
      }
    );
  }

  /**
   * 현재 게임 설정을 세션 스토리지에 저장
   */
  private saveToSessionStorage(): void {
    saveGameSession(this.settings, this.userTimeScale);
  }

  /**
   * 세션 스토리지에서 게임 설정 복원
   */
  private loadFromSessionStorage(): void {
    const result = loadGameSession(this.world, this.canvas, this.currentMap);
    this.participants = result.participants;
    this.settings.participants = result.participants;
    if (result.mapType) {
      this.settings.mapType = result.mapType as MapType;
    }

    clearMarbles(this.marbles, this.world);
    this.marbles = result.marbles;

    if (result.timeScale !== null) {
      const clamped = Math.max(TIME_SCALE_MIN, Math.min(TIME_SCALE_MAX, result.timeScale));
      this.userTimeScale = clamped;
      this.timeScale = clamped;
      updateSpeedUI(clamped);
    }

    const savedSettings = loadSavedSettings();
    if (savedSettings) {
      this.settings.winnerMode = savedSettings.winnerMode;
      this.settings.customRank = savedSettings.customRank;
      this.settings.topNCount = savedSettings.topNCount;

      const winnerModeSelect = document.getElementById('winner-mode') as HTMLSelectElement | null;
      if (winnerModeSelect) {
        winnerModeSelect.value = savedSettings.winnerMode;
      }

      const customRankInput = document.getElementById('custom-rank') as HTMLInputElement | null;
      if (customRankInput) {
        customRankInput.value = savedSettings.customRank.toString();
      }

      const topNInput = document.getElementById('top-n-count') as HTMLInputElement | null;
      if (topNInput) {
        topNInput.value = savedSettings.topNCount.toString();
      }

      const savedTimeScale = Math.max(
        TIME_SCALE_MIN,
        Math.min(TIME_SCALE_MAX, (savedSettings as any).timeScale ?? this.userTimeScale)
      );
      this.userTimeScale = savedTimeScale;
      this.timeScale = savedTimeScale;
      updateSpeedUI(savedTimeScale);
    }
  }
}
