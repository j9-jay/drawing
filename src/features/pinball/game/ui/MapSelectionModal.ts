/**
 * Map Selection Modal Manager
 * Handles the map selection UI modal functionality
 */

import { showToast } from './ToastManager';
import { thumbnailGenerator } from './MapThumbnailGenerator';

export interface MapData {
  name: string;
  lastModified?: string;
  size?: number;
  thumbnail?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface MapSelectionCallbacks {
  onSelect: (mapName: string) => void;
  onClose?: () => void;
}

class MapSelectionModalManager {
  private modal: HTMLElement | null = null;
  private grid: HTMLElement | null = null;
  private sortSelect: HTMLSelectElement | null = null;
  private closeBtn: HTMLElement | null = null;
  private selectBtn: HTMLElement | null = null;
  private mapDisplay: HTMLInputElement | null = null;

  private maps: MapData[] = [];
  private currentMap: string = 'default';
  private sortBy: 'name' | 'name-desc' | 'date' = 'name';
  private callbacks: MapSelectionCallbacks | null = null;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.modal = document.getElementById('map-selection-modal');
    this.grid = document.getElementById('map-grid');
    this.sortSelect = document.getElementById('map-sort-select') as HTMLSelectElement;
    this.closeBtn = document.getElementById('map-modal-close');
    this.selectBtn = document.getElementById('map-select-btn');
    this.mapDisplay = document.getElementById('map-display') as HTMLInputElement;
  }

  private setupEventListeners(): void {
    // Open modal button
    this.selectBtn?.addEventListener('click', () => this.open());

    // Close button
    this.closeBtn?.addEventListener('click', () => this.close());

    // Click outside to close
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Sort select
    this.sortSelect?.addEventListener('change', (e) => {
      this.sortBy = (e.target as HTMLSelectElement).value as 'name' | 'name-desc' | 'date';
      this.renderMaps();
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  public async open(): Promise<void> {
    if (!this.modal) return;

    // Load maps
    await this.loadMaps();

    // Show modal
    this.modal.classList.remove('hidden');

    // Render maps
    this.renderMaps();
  }

  public close(): void {
    if (!this.modal) return;

    this.modal.classList.add('hidden');
    this.callbacks?.onClose?.();
  }

  private async loadMaps(): Promise<void> {
    try {
      // Try to load from API
      const response = await fetch('/api/pinball/maps/list-game');
      if (response.ok) {
        const mapList = await response.json();
        this.maps = [
          { name: 'default', lastModified: '2024-01-01', size: 0 },
          ...mapList
        ];
      } else {
        // Fallback to default only
        this.maps = [{ name: 'default', lastModified: '2024-01-01', size: 0 }];
      }

      // Generate thumbnails
      const thumbnailPromises = this.maps.map(async (map) => {
        const thumbnail = await thumbnailGenerator.generateThumbnailFromName(map.name);
        return {
          ...map,
          thumbnail,
          difficulty: this.getMapDifficulty(map.name)
        };
      });

      this.maps = await Promise.all(thumbnailPromises);
    } catch (error) {
      console.warn('Failed to load maps:', error);
      this.maps = [{ name: 'default', lastModified: '2024-01-01', size: 0 }];
    }
  }

  private getMapDifficulty(mapName: string): 'easy' | 'medium' | 'hard' | undefined {
    // Placeholder logic - can be enhanced later
    if (mapName.toLowerCase().includes('easy')) return 'easy';
    if (mapName.toLowerCase().includes('hard')) return 'hard';
    if (mapName.toLowerCase().includes('medium')) return 'medium';
    return undefined;
  }

  private sortMaps(maps: MapData[]): MapData[] {
    const sorted = [...maps];

    switch (this.sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date':
        sorted.sort((a, b) => {
          const dateA = new Date(a.lastModified || 0).getTime();
          const dateB = new Date(b.lastModified || 0).getTime();
          return dateB - dateA; // Newest first
        });
        break;
    }

    return sorted;
  }

  private renderMaps(): void {
    if (!this.grid) return;

    const sortedMaps = this.sortMaps(this.maps);

    this.grid.innerHTML = '';

    sortedMaps.forEach(map => {
      const card = this.createMapCard(map);
      this.grid.appendChild(card);
    });
  }

  private createMapCard(map: MapData): HTMLElement {
    const card = document.createElement('div');
    card.className = `map-card ${map.name === this.currentMap ? 'selected' : ''}`;

    card.innerHTML = `
      <div class="map-thumbnail">
        ${map.thumbnail
          ? `<img src="${map.thumbnail}" alt="${map.name}">`
          : '<div class="placeholder-thumbnail">🗺️</div>'
        }
      </div>
      <div class="map-info">
        <h3>${this.formatMapName(map.name)}</h3>
        <div class="map-meta">
          ${map.difficulty ? `<span class="difficulty ${map.difficulty}">${map.difficulty}</span>` : ''}
          <span class="size">${this.formatSize(map.size || 0)}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => this.selectMap(map.name));

    return card;
  }

  private formatMapName(name: string): string {
    // Convert 'default' to 'Classic' or format other names
    if (name === 'default') return 'Classic';

    // Capitalize first letter and replace underscores/hyphens with spaces
    return name
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '';

    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private selectMap(mapName: string): void {
    this.currentMap = mapName;

    // Update display
    if (this.mapDisplay) {
      this.mapDisplay.value = this.formatMapName(mapName);
    }

    // Call the callback
    this.callbacks?.onSelect?.(mapName);

    // Close modal
    this.close();

    // Show toast
    showToast(`Map selected: ${this.formatMapName(mapName)}`, 'success');
  }

  public setCallbacks(callbacks: MapSelectionCallbacks): void {
    this.callbacks = callbacks;
  }

  public setCurrentMap(mapName: string): void {
    this.currentMap = mapName;
    if (this.mapDisplay) {
      this.mapDisplay.value = this.formatMapName(mapName);
    }
  }
}

// Export singleton instance
export const mapSelectionModal = new MapSelectionModalManager();