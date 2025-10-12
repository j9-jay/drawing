/**
 * Roulette game storage manager
 * Handles LocalStorage operations for game settings
 */

import { RouletteSettings, Participant, SpinSpeed } from '../../shared/types/roulette';

const STORAGE_KEY = 'rouletteGameSettings';

/**
 * Save game settings to localStorage
 */
export function saveSettings(settings: RouletteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save roulette settings:', error);
  }
}

/**
 * Load game settings from localStorage
 */
export function loadSettings(): RouletteSettings | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load roulette settings:', error);
  }
  return null;
}

/**
 * Save participants to localStorage
 */
export function saveParticipants(participants: Participant[]): void {
  const settings = loadSettings() || {
    participants: [],
    defaultSpeed: 'NORMAL' as SpinSpeed
  };
  settings.participants = participants;
  saveSettings(settings);
}

/**
 * Load participants from localStorage
 */
export function loadParticipants(): Participant[] {
  const settings = loadSettings();
  return settings?.participants || [];
}

/**
 * Save spin speed preference
 */
export function saveSpinSpeed(speed: SpinSpeed): void {
  const settings = loadSettings() || {
    participants: [],
    defaultSpeed: speed
  };
  settings.defaultSpeed = speed;
  saveSettings(settings);
}

/**
 * Load spin speed preference
 */
export function loadSpinSpeed(): SpinSpeed {
  const settings = loadSettings();
  return settings?.defaultSpeed || 'NORMAL';
}

/**
 * Clear all storage
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear roulette storage:', error);
  }
}
