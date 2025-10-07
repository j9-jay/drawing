/**
 * Map Thumbnail Generator
 * Generates thumbnail images for maps
 */

import { EditorMapJson } from '../../shared/types/editorMap';

export class MapThumbnailGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly WIDTH = 150;
  private readonly HEIGHT = 250;
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

    // Calculate bounds of all elements
    const bounds = this.calculateMapBounds(mapData);

    // Use bounds or fallback to canvas size
    const mapWidth = bounds.width > 0 ? bounds.width : (mapData.meta?.canvasSize?.width || 800);
    const mapHeight = bounds.height > 0 ? bounds.height : (mapData.meta?.canvasSize?.height || 600);
    const mapLeft = bounds.minX !== Infinity ? bounds.minX : 0;
    const mapTop = bounds.minY !== Infinity ? bounds.minY : 0;

    // Calculate scale
    const padding = 10;
    const scaleX = (this.WIDTH - padding * 2) / mapWidth;
    const scaleY = (this.HEIGHT - padding * 2) / mapHeight;
    const scale = Math.min(scaleX, scaleY, 0.5); // Cap at 0.5 to ensure visibility

    // Save context state
    this.ctx.save();

    // Center and scale
    this.ctx.translate(this.WIDTH / 2, this.HEIGHT / 2);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-mapLeft - mapWidth / 2, -mapTop - mapHeight / 2);

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
    const typeCounts: Record<string, number> = {};
    mapData.objects.forEach(obj => {
      typeCounts[obj.type] = (typeCounts[obj.type] || 0) + 1;
    });

    const content = JSON.stringify({
      objectCount: mapData.objects.length,
      types: typeCounts,
      spawnPoint: mapData.meta?.spawnPoint || null
    });
    return btoa(content).substring(0, 20);
  }

  private calculateMapBounds(mapData: EditorMapJson): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  } {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    mapData.objects.forEach(obj => {
      switch (obj.type) {
        case 'edge':
          obj.vertices.forEach(v => {
            minX = Math.min(minX, v.x);
            maxX = Math.max(maxX, v.x);
            minY = Math.min(minY, v.y);
            maxY = Math.max(maxY, v.y);
          });
          break;

        case 'bubble':
          minX = Math.min(minX, obj.center.x - obj.radius);
          maxX = Math.max(maxX, obj.center.x + obj.radius);
          minY = Math.min(minY, obj.center.y - obj.radius);
          maxY = Math.max(maxY, obj.center.y + obj.radius);
          break;

        case 'rotatingBar':
          const halfLen = obj.length / 2;
          minX = Math.min(minX, obj.pivot.x - halfLen);
          maxX = Math.max(maxX, obj.pivot.x + halfLen);
          minY = Math.min(minY, obj.pivot.y - halfLen);
          maxY = Math.max(maxY, obj.pivot.y + halfLen);
          break;

        case 'bounceCircle':
          minX = Math.min(minX, obj.position.x - obj.radius);
          maxX = Math.max(maxX, obj.position.x + obj.radius);
          minY = Math.min(minY, obj.position.y - obj.radius);
          maxY = Math.max(maxY, obj.position.y + obj.radius);
          break;

        case 'jumppad':
          const hw = obj.shape.width / 2;
          const hh = obj.shape.height / 2;
          minX = Math.min(minX, obj.position.x - hw);
          maxX = Math.max(maxX, obj.position.x + hw);
          minY = Math.min(minY, obj.position.y - hh);
          maxY = Math.max(maxY, obj.position.y + hh);
          break;

        case 'finishLine':
          minX = Math.min(minX, obj.a.x, obj.b.x);
          maxX = Math.max(maxX, obj.a.x, obj.b.x);
          minY = Math.min(minY, obj.a.y, obj.b.y);
          maxY = Math.max(maxY, obj.a.y, obj.b.y);
          break;
      }
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private drawMapElements(mapData: EditorMapJson): void {
    const ctx = this.ctx;

    mapData.objects.forEach(obj => {
      switch (obj.type) {
        case 'edge':
          ctx.strokeStyle = '#4A9EFF';
          ctx.lineWidth = 4;
          ctx.beginPath();
          obj.vertices.forEach((v, i) => {
            if (i === 0) {
              ctx.moveTo(v.x, v.y);
            } else {
              ctx.lineTo(v.x, v.y);
            }
          });
          ctx.stroke();
          break;

        case 'bubble':
          ctx.fillStyle = '#4A9EFF';
          ctx.strokeStyle = '#6BB6FF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obj.center.x, obj.center.y, obj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;

        case 'rotatingBar':
          ctx.fillStyle = '#F44336';
          ctx.strokeStyle = '#FF6659';
          ctx.lineWidth = 2;
          ctx.save();
          ctx.translate(obj.pivot.x, obj.pivot.y);
          ctx.beginPath();
          ctx.moveTo(-obj.length / 2, -obj.thickness / 2);
          ctx.lineTo(obj.length / 2, -obj.thickness / 2);
          ctx.lineTo(obj.length / 2, obj.thickness / 2);
          ctx.lineTo(-obj.length / 2, obj.thickness / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
          break;

        case 'bounceCircle':
          ctx.fillStyle = '#4CAF50';
          ctx.strokeStyle = '#6FD573';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;

        case 'jumppad':
          ctx.fillStyle = '#FF9800';
          ctx.strokeStyle = '#FFB333';
          ctx.lineWidth = 2;
          const hw = obj.shape.width / 2;
          const hh = obj.shape.height / 2;
          ctx.beginPath();
          ctx.rect(obj.position.x - hw, obj.position.y - hh, obj.shape.width, obj.shape.height);
          ctx.fill();
          ctx.stroke();
          break;

        case 'finishLine':
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(obj.a.x, obj.a.y);
          ctx.lineTo(obj.b.x, obj.b.y);
          ctx.stroke();
          ctx.setLineDash([]);
          break;
      }
    });

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
      const response = await fetch(`/api/pinball/maps/load/${mapName}`);
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