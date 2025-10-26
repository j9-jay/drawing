'use client';

/**
 * Map Selection Modal Manager
 * Handles the map selection UI modal functionality
 */

import { showToast } from './ToastManager';
import { thumbnailGenerator } from './MapThumbnailGenerator';
import { StaticMapLoader } from '../../shared/map/StaticMapLoader';
import { formatDate } from '../../shared/utils/formatting';

export interface MapData {
  name: string;
  displayName: string;
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

  // Event handler references for proper cleanup
  private openHandler = () => this.open();
  private closeHandler = () => this.close();
  private sortChangeHandler = (e: Event) => {
    this.sortBy = (e.target as HTMLSelectElement).value as 'name' | 'name-desc' | 'date';
    this.renderMaps();
  };
  private modalClickHandler = (e: Event) => {
    if (e.target === this.modal) {
      this.close();
    }
  };
  private escKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
      this.close();
    }
  };

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
    // Remove existing listeners first to prevent duplicates
    this.selectBtn?.removeEventListener('click', this.openHandler);
    this.closeBtn?.removeEventListener('click', this.closeHandler);
    this.modal?.removeEventListener('click', this.modalClickHandler);
    this.sortSelect?.removeEventListener('change', this.sortChangeHandler);
    document.removeEventListener('keydown', this.escKeyHandler);

    // Add event listeners
    // Open modal button
    this.selectBtn?.addEventListener('click', this.openHandler);

    // Close button
    this.closeBtn?.addEventListener('click', this.closeHandler);

    // Click outside to close
    this.modal?.addEventListener('click', this.modalClickHandler);

    // Sort select
    this.sortSelect?.addEventListener('change', this.sortChangeHandler);

    // ESC key to close
    document.addEventListener('keydown', this.escKeyHandler);
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
      const mapInfoList = this.loadMapInfoList();
      this.maps = await this.generateThumbnails(mapInfoList);
    } catch (error) {
      this.handleLoadMapsError(error);
    }
  }

  private loadMapInfoList(): MapData[] {
    const mapInfoList = StaticMapLoader.getAllMapInfo();

    return mapInfoList.map(info => ({
      name: info.name,
      displayName: info.displayName,
      lastModified: new Date().toISOString(),
      size: 0,
      difficulty: info.difficulty
    }));
  }

  private async generateThumbnails(maps: MapData[]): Promise<MapData[]> {
    const thumbnailPromises = maps.map(async (map) => {
      const thumbnail = await thumbnailGenerator.generateThumbnailFromName(map.name);
      return {
        ...map,
        thumbnail
      };
    });

    return Promise.all(thumbnailPromises);
  }

  private handleLoadMapsError(error: unknown): void {
    console.error('Failed to load maps:', error);

    this.maps = [{
      name: 'default',
      displayName: 'Default Map',
      lastModified: new Date().toISOString(),
      size: 0
    }];
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

    // Create fallback thumbnail if none exists
    const fallbackThumbnail = `data:image/svg+xml;base64,${btoa(`
      <svg width="150" height="250" xmlns="http://www.w3.org/2000/svg">
        <rect width="150" height="250" fill="#1a1a1a"/>
        <rect width="150" height="250" fill="none" stroke="rgba(74, 158, 255, 0.3)" stroke-width="2"/>
        <text x="50%" y="50%" fill="#666" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14">
          Map
        </text>
      </svg>
    `)}`;

    card.innerHTML = `
      <div class="map-thumbnail">
        <img
          src="${map.thumbnail || fallbackThumbnail}"
          alt="${map.displayName}"
          onerror="this.src='${fallbackThumbnail}'"
        >
      </div>
      <div class="map-info">
        <h3>${map.displayName}</h3>
        <div class="map-meta">
          ${map.difficulty ? `<span class="difficulty ${map.difficulty}">${map.difficulty}</span>` : ''}
          <span class="date">${formatDate(map.lastModified)}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => this.selectMap(map.name));

    return card;
  }

  private selectMap(mapName: string): void {
    this.currentMap = mapName;

    // Find map to get displayName
    const map = this.maps.find(m => m.name === mapName);
    const displayName = map?.displayName || mapName;

    // Update display
    if (this.mapDisplay) {
      this.mapDisplay.value = displayName;
    }

    // Call the callback
    this.callbacks?.onSelect?.(mapName);

    // Close modal
    this.close();

    // Show toast
    showToast(`Map selected: ${displayName}`, 'success');
  }

  public setCallbacks(callbacks: MapSelectionCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Reinitialize DOM elements and event listeners
   * Call this when React component remounts to ensure event listeners are properly attached
   */
  public reinitialize(): void {
    this.initializeElements();
    this.setupEventListeners();
  }

  public setCurrentMap(mapName: string): void {
    this.currentMap = mapName;
    if (this.mapDisplay) {
      const map = this.maps.find(m => m.name === mapName);
      this.mapDisplay.value = map?.displayName || mapName;
    }
  }
}

// Export singleton instance
export const mapSelectionModal = new MapSelectionModalManager();