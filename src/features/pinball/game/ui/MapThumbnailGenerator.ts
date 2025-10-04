/**
 * Map Thumbnail Generator
 * Generates thumbnail images for maps
 */

import { EditorMapJson } from '../../shared/types/editorMap';

export class MapThumbnailGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly WIDTH = 200;
  private readonly HEIGHT = 150;
  private cache: Map<string, string> = new Map();
  private readonly CACHE_KEY = 'mapThumbnailCache';
  private readonly CACHE_EXPIRY_DAYS = 7;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.ctx = this.canvas.getContext('2d')!;
    this.loadCache();
  }

  private loadCache(): void {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const expiry = new Date(data.expiry);
        if (expiry > new Date()) {
          this.cache = new Map(data.cache);
        } else {
          localStorage.removeItem(this.CACHE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load thumbnail cache:', error);
    }
  }

  private saveCache(): void {
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + this.CACHE_EXPIRY_DAYS);
      const data = {
        cache: Array.from(this.cache.entries()),
        expiry: expiry.toISOString()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save thumbnail cache:', error);
    }
  }

  /**
   * Generate thumbnail for a map
   */
  public async generateThumbnail(mapData: EditorMapJson): Promise<string> {
    // Generate cache key based on map content
    const cacheKey = this.generateCacheKey(mapData);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    // Background
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    // Calculate scale
    const mapWidth = mapData.meta.canvasSize.width;
    const mapHeight = mapData.meta.canvasSize.height;
    const scaleX = this.WIDTH / mapWidth;
    const scaleY = this.HEIGHT / mapHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some margin

    // Center the map
    const offsetX = (this.WIDTH - mapWidth * scale) / 2;
    const offsetY = (this.HEIGHT - mapHeight * scale) / 2;

    // Save context state
    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);
    this.ctx.scale(scale, scale);

    // Draw map elements
    this.drawMapElements(mapData);

    // Restore context
    this.ctx.restore();

    // Add border
    this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, this.WIDTH, this.HEIGHT);

    // Convert to data URL
    const thumbnail = this.canvas.toDataURL('image/png');

    // Cache the result
    this.cache.set(cacheKey, thumbnail);
    this.saveCache();

    return thumbnail;
  }

  private generateCacheKey(mapData: EditorMapJson): string {
    // Create a simple hash based on map content
    const content = JSON.stringify({
      walls: mapData.walls?.length || 0,
      bubbles: mapData.bubbles?.length || 0,
      triangles: mapData.triangles?.length || 0,
      rotatingBars: mapData.rotatingBars?.length || 0,
      bounceCircles: mapData.bounceCircles?.length || 0,
      finishLineY: mapData.finishLine?.y || 0,
      spawnPoint: mapData.meta?.spawnPoint || null
    });
    return btoa(content).substring(0, 20);
  }

  private drawMapElements(mapData: EditorMapJson): void {
    const ctx = this.ctx;

    // Draw walls
    if (mapData.walls) {
      ctx.strokeStyle = '#4A9EFF';
      ctx.lineWidth = 3;
      mapData.walls.forEach(wall => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.stroke();
      });
    }

    // Draw bubbles
    if (mapData.bubbles) {
      mapData.bubbles.forEach(bubble => {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.3)';
        ctx.strokeStyle = '#4A9EFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw triangles
    if (mapData.triangles) {
      ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 1;
      mapData.triangles.forEach(triangle => {
        ctx.beginPath();
        ctx.moveTo(triangle.x1, triangle.y1);
        ctx.lineTo(triangle.x2, triangle.y2);
        ctx.lineTo(triangle.x3, triangle.y3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw rotating bars
    if (mapData.rotatingBars) {
      ctx.strokeStyle = '#F44336';
      ctx.lineWidth = 2;
      mapData.rotatingBars.forEach(bar => {
        ctx.save();
        ctx.translate(bar.centerX, bar.centerY);
        ctx.rotate(bar.angle || 0);
        ctx.beginPath();
        ctx.moveTo(-bar.width / 2, -bar.height / 2);
        ctx.lineTo(bar.width / 2, -bar.height / 2);
        ctx.lineTo(bar.width / 2, bar.height / 2);
        ctx.lineTo(-bar.width / 2, bar.height / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });
    }

    // Draw bounce circles
    if (mapData.bounceCircles) {
      mapData.bounceCircles.forEach(circle => {
        ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Draw finish line
    if (mapData.finishLine) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, mapData.finishLine.y);
      ctx.lineTo(mapData.meta.canvasSize.width, mapData.finishLine.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw spawn point
    if (mapData.meta?.spawnPoint) {
      ctx.fillStyle = '#4A9EFF';
      ctx.beginPath();
      ctx.arc(mapData.meta.spawnPoint.x, mapData.meta.spawnPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Generate thumbnail from map name by loading it first
   */
  public async generateThumbnailFromName(mapName: string): Promise<string | undefined> {
    // Check name-based cache first
    const nameCacheKey = `name_${mapName}`;
    if (this.cache.has(nameCacheKey)) {
      return this.cache.get(nameCacheKey)!;
    }

    try {
      const response = await fetch(`/api/pinball/maps/load-game/${mapName}`);
      if (!response.ok) {
        return undefined;
      }

      const mapData = await response.json();
      const thumbnail = await this.generateThumbnail(mapData);

      // Also cache by name for quick lookup
      this.cache.set(nameCacheKey, thumbnail);
      this.saveCache();

      return thumbnail;
    } catch (error) {
      console.error(`Failed to generate thumbnail for ${mapName}:`, error);
      return undefined;
    }
  }

  /**
   * Clear the thumbnail cache
   */
  public clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
  }
}

// Export singleton instance
export const thumbnailGenerator = new MapThumbnailGenerator();