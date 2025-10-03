import { SessionStorageUtil, STORAGE_KEYS } from '../../shared/utils/sessionStorage';
import { GameSettings } from '../../shared/types';
import { initializeParticipants, refreshPreviewMarbles } from '../services/ParticipantPreviewService';
import { clearMarbles } from '../physics/PhysicsHelpers';
import { World } from 'planck';
import { Marble } from '../../shared/types';
import { TIME_SCALE_MIN, TIME_SCALE_MAX } from '../constants/ui';

interface LoadResult {
  participants: ReturnType<typeof initializeParticipants>;
  marbles: Marble[];
  mapType: string | null;
  timeScale: number | null;
}

export function saveGameSession(
  settings: GameSettings,
  userTimeScale: number
): void {
  try {
    const namesInput = document.getElementById('names-input') as HTMLTextAreaElement | null;
    if (namesInput?.value) {
      SessionStorageUtil.save(STORAGE_KEYS.PARTICIPANTS, namesInput.value);
    }

    const mapSelect = document.getElementById('map-select') as HTMLSelectElement | null;
    if (mapSelect?.value) {
      SessionStorageUtil.save(STORAGE_KEYS.SELECTED_MAP, mapSelect.value);
    }

    SessionStorageUtil.save(STORAGE_KEYS.GAME_SETTINGS, {
      winnerMode: settings.winnerMode,
      customRank: settings.customRank,
      topNCount: settings.topNCount,
      timeScale: userTimeScale
    });
  } catch (error) {
    console.warn('Failed to save game state to session storage:', error);
  }
}

// TODO: Refactor - SRP violation (DOM + Storage + Entity creation)
// Consider splitting into: loadParticipantsFromStorage, loadMapFromStorage
export function loadGameSession(
  world: World,
  canvas: HTMLCanvasElement,
  currentMap: any
): LoadResult {
  let participants = initializeParticipants(true);
  let marbles: Marble[] = [];
  let mapType: string | null = null;
  let timeScale: number | null = null;

  try {
    const savedParticipants = SessionStorageUtil.load<string>(STORAGE_KEYS.PARTICIPANTS);
    const namesInput = document.getElementById('names-input') as HTMLTextAreaElement | null;

    if (savedParticipants && namesInput) {
      namesInput.value = savedParticipants;
      participants = initializeParticipants(true);
    } else if (namesInput && namesInput.value.trim() === '') {
      // No saved data and textarea is empty - use placeholder
      const placeholder = namesInput.getAttribute('placeholder');
      if (placeholder) {
        namesInput.value = placeholder.replace(/&#10;/g, '\n');
      }
      participants = initializeParticipants(true);
    }

    const savedMap = SessionStorageUtil.load<string>(STORAGE_KEYS.SELECTED_MAP);
    if (savedMap) {
      const mapSelect = document.getElementById('map-select') as HTMLSelectElement | null;
      if (mapSelect) {
        mapSelect.value = savedMap;
      }
      mapType = savedMap;
    }
    const savedSettings = SessionStorageUtil.load<any>(STORAGE_KEYS.GAME_SETTINGS);
    if (savedSettings?.timeScale) {
      timeScale = Math.max(TIME_SCALE_MIN, Math.min(TIME_SCALE_MAX, savedSettings.timeScale));
    }
  } catch (error) {
    console.warn('Failed to load game state from session storage:', error);
  }

 marbles = refreshPreviewMarbles(participants, currentMap, canvas.width);

  return { participants, marbles, mapType, timeScale };
}

export function loadSavedSettings(): GameSettings | null {
  const savedSettings = SessionStorageUtil.load<GameSettings>(STORAGE_KEYS.GAME_SETTINGS);
  return savedSettings ?? null;
}
