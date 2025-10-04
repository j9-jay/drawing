/**
 * Local storage manager for game settings
 */

import { GameSettings, WinnerMode, MapType } from '../../shared/types';

export interface StorageData {
  names: string;
  winnerMode: WinnerMode;
  customRank: number;
  topNCount: number;
  mapType: MapType;
}

const STORAGE_KEY = 'pinballRouletteSettings';

/**
 * Save settings to localStorage
 * @param settings - Current game settings
 */
export function saveToStorage(settings: GameSettings): void {
  const data: StorageData = {
    names: (document.getElementById('names-input') as HTMLTextAreaElement).value,
    winnerMode: settings.winnerMode,
    customRank: settings.customRank,
    topNCount: settings.topNCount,
    mapType: settings.mapType,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Load settings from localStorage and apply to UI and game settings
 * @param settings - Game settings object to update
 */
export function loadFromStorage(settings: GameSettings): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data: StorageData = JSON.parse(saved);

      if (data.names && data.names.trim()) {
        (document.getElementById('names-input') as HTMLTextAreaElement).value = data.names;
      }

      (document.getElementById('winner-mode') as HTMLSelectElement).value = data.winnerMode || 'first';
      (document.getElementById('custom-rank') as HTMLInputElement).value = String(data.customRank || 1);
      (document.getElementById('top-n-count') as HTMLInputElement).value = String(data.topNCount || 5);
      // Map display is now handled differently
      const mapDisplay = document.getElementById('map-display') as HTMLInputElement;
      if (mapDisplay) {
        const mapName = data.mapType || 'classic';
        mapDisplay.value = mapName === 'default' ? 'Classic' : mapName;
      }

      settings.winnerMode = data.winnerMode || 'first';
      settings.customRank = data.customRank || 1;
      settings.topNCount = data.topNCount || 5;
      settings.mapType = data.mapType || 'classic';

      // 로드 후 UI 상태 업데이트
      const customRank = document.getElementById('custom-rank') as HTMLInputElement;
      const topNCount = document.getElementById('top-n-count') as HTMLInputElement;
      customRank.style.display = settings.winnerMode === 'custom' ? 'block' : 'none';
      topNCount.style.display = settings.winnerMode === 'topN' ? 'block' : 'none';
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
}