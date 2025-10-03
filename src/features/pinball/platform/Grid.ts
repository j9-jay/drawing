import { Vec2 } from '../../shared/types/editorMap';
import { EditorCamera } from '../editor/state/slices/cameraSlice';

export class Grid {
  static render(
    ctx: CanvasRenderingContext2D,
    gridSize: number,
    camera: EditorCamera,
    canvasWidth: number,
    canvasHeight: number,
    visible: boolean = true,
    mapWidth: number = 1500,
    mapHeight: number = 10000
  ) {
    if (!visible || gridSize <= 0) return;
    
    // Calculate visible bounds in world space
    const worldLeft = camera.x;
    const worldTop = camera.y;
    const worldRight = camera.x + canvasWidth / camera.zoom;
    const worldBottom = camera.y + canvasHeight / camera.zoom;
    
    // Constrain grid to map boundaries (map coordinates are 0 to mapWidth/mapHeight)
    const mapLeft = 0;
    const mapTop = 0;
    const mapRight = mapWidth;
    const mapBottom = mapHeight;
    
    // Calculate grid line positions within map bounds only (ignore visible area)
    const startX = Math.floor(mapLeft / gridSize) * gridSize;
    const endX = Math.ceil(mapRight / gridSize) * gridSize;
    const startY = Math.floor(mapTop / gridSize) * gridSize;
    const endY = Math.ceil(mapBottom / gridSize) * gridSize;
    
    // Calculate center of the map
    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;
    
    // Major grid size (5x5 of normal grid)
    const majorGridSize = gridSize * 5;
    
    // Draw minor grid lines (normal grid)
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
    ctx.lineWidth = 0.5 / camera.zoom;
    ctx.beginPath();
    
    // Vertical minor lines
    for (let x = startX; x <= endX; x += gridSize) {
      // Skip if it's a major grid line
      if (x % majorGridSize !== 0 && x !== centerX) {
        ctx.moveTo(x, mapTop);
        ctx.lineTo(x, mapBottom);
      }
    }
    
    // Horizontal minor lines
    for (let y = startY; y <= endY; y += gridSize) {
      // Skip if it's a major grid line
      if (y % majorGridSize !== 0 && y !== centerY) {
        ctx.moveTo(mapLeft, y);
        ctx.lineTo(mapRight, y);
      }
    }
    ctx.stroke();
    
    // Draw major grid lines (5x5 grid) - slightly lighter
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.25)';
    ctx.lineWidth = 1.5 / camera.zoom;
    ctx.beginPath();
    
    // Vertical major lines
    for (let x = 0; x <= mapWidth; x += majorGridSize) {
      if (x !== centerX) { // Skip center line, we'll draw it separately
        ctx.moveTo(x, mapTop);
        ctx.lineTo(x, mapBottom);
      }
    }
    
    // Horizontal major lines
    for (let y = 0; y <= mapHeight; y += majorGridSize) {
      if (y !== centerY) { // Skip center line, we'll draw it separately
        ctx.moveTo(mapLeft, y);
        ctx.lineTo(mapRight, y);
      }
    }
    ctx.stroke();
    
    // Draw center lines (thickest) - slightly lighter
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.25)';
    ctx.lineWidth = 2 / camera.zoom;
    ctx.beginPath();
    
    // Vertical center line
    ctx.moveTo(centerX, mapTop);
    ctx.lineTo(centerX, mapBottom);
    
    // Horizontal center line (optional - you might not want this for a vertical scrolling game)
    // ctx.moveTo(mapLeft, centerY);
    // ctx.lineTo(mapRight, centerY);
    
    ctx.stroke();
  }
  
  static snapToGrid(point: Vec2, gridSize: number): Vec2 {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }
  
  // Screen coordinates to world coordinates
  static screenToWorld(screenPoint: Vec2, camera: EditorCamera, canvasWidth: number = 800, canvasHeight: number = 600): Vec2 {
    // Canvas transform: scale(zoom, zoom) then translate(-camera.x, -camera.y)
    // To reverse: divide by zoom to get to scaled space, then add camera position
    return {
      x: screenPoint.x / camera.zoom + camera.x,
      y: screenPoint.y / camera.zoom + camera.y
    };
  }
  
  // World coordinates to screen coordinates
  static worldToScreen(worldPoint: Vec2, camera: EditorCamera, canvasWidth: number = 800, canvasHeight: number = 600): Vec2 {
    // Apply same transform as canvas: subtract camera position, then multiply by zoom
    return {
      x: (worldPoint.x - camera.x) * camera.zoom,
      y: (worldPoint.y - camera.y) * camera.zoom
    };
  }
  
  // Get bounds of visible area in world coordinates
  static getVisibleBounds(camera: EditorCamera, canvasWidth: number, canvasHeight: number) {
    const worldLeft = camera.x / camera.zoom;
    const worldTop = camera.y / camera.zoom;
    const worldRight = (camera.x + canvasWidth) / camera.zoom;
    const worldBottom = (camera.y + canvasHeight) / camera.zoom;
    
    return {
      left: worldLeft,
      top: worldTop,
      right: worldRight,
      bottom: worldBottom,
      width: worldRight - worldLeft,
      height: worldBottom - worldTop
    };
  }
}