import { CameraConfig } from './CameraManager';

export interface CameraBindingSnapshot {
  canvas: HTMLCanvasElement;
  cameraZoom: number;
  currentCameraX: number;
  currentCameraY: number;
  targetCameraX: number;
  targetCameraY: number;
  baseZoom: number;
  targetZoom: number;
  gameAreaBounds: { minX: number; maxX: number; minY: number; maxY: number };
  isMinimapHovered: boolean;
  originalCameraX: number;
  originalCameraY: number;
  cameraConfig: CameraConfig | null;
}

export interface CameraProjectionState {
  cameraZoom: number;
  currentCameraX: number;
  currentCameraY: number;
  targetCameraX: number;
  targetCameraY: number;
  baseZoom: number;
  targetZoom: number;
  gameAreaBounds: { minX: number; maxX: number; minY: number; maxY: number };
  isMinimapHovered: boolean;
  originalCameraX: number;
  originalCameraY: number;
}

export function ensureCameraConfig(snapshot: CameraBindingSnapshot): CameraConfig {
  const config = snapshot.cameraConfig ?? {
    canvas: snapshot.canvas,
    cameraZoom: snapshot.cameraZoom,
    currentCameraX: snapshot.currentCameraX,
    currentCameraY: snapshot.currentCameraY,
    targetCameraX: snapshot.targetCameraX,
    targetCameraY: snapshot.targetCameraY,
    baseZoom: snapshot.baseZoom,
    targetZoom: snapshot.targetZoom,
    gameAreaBounds: { ...snapshot.gameAreaBounds },
    isMinimapHovered: snapshot.isMinimapHovered,
    originalCameraX: snapshot.originalCameraX,
    originalCameraY: snapshot.originalCameraY
  };

  config.canvas = snapshot.canvas;
  config.cameraZoom = snapshot.cameraZoom;
  config.currentCameraX = snapshot.currentCameraX;
  config.currentCameraY = snapshot.currentCameraY;
  config.targetCameraX = snapshot.targetCameraX;
  config.targetCameraY = snapshot.targetCameraY;
  config.baseZoom = snapshot.baseZoom;
  config.targetZoom = snapshot.targetZoom;
  config.gameAreaBounds = { ...snapshot.gameAreaBounds };
  config.isMinimapHovered = snapshot.isMinimapHovered;
  config.originalCameraX = snapshot.originalCameraX;
  config.originalCameraY = snapshot.originalCameraY;

  return config;
}

export function cameraStateFromConfig(config: CameraConfig): CameraProjectionState {
  return {
    cameraZoom: config.cameraZoom,
    currentCameraX: config.currentCameraX,
    currentCameraY: config.currentCameraY,
    targetCameraX: config.targetCameraX,
    targetCameraY: config.targetCameraY,
    baseZoom: config.baseZoom,
    targetZoom: config.targetZoom,
    gameAreaBounds: { ...config.gameAreaBounds },
    isMinimapHovered: config.isMinimapHovered,
    originalCameraX: config.originalCameraX,
    originalCameraY: config.originalCameraY
  };
}
