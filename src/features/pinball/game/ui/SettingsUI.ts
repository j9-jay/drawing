/**
 * Settings UI management
 * Handles settings popup visibility and interactions
 */

import { GameState } from '../../../shared/types';

/**
 * Setup initial settings popup visibility
 */
export function setupSettingsPopup(): void {
  const settingsPopup = document.getElementById('settings-popup') as HTMLDivElement;
  // 초기에는 팝업을 보이게 설정
  settingsPopup.classList.remove('hidden');
}

/**
 * Enable settings popup to show on click when game is idle
 * @param gameState - Current game state
 * @returns Function to remove the event listener
 */
export function enableSettingsPopupOnClick(gameState: GameState): () => void {
  const gameArea = document.getElementById('game-area') as HTMLDivElement;
  const settingsPopup = document.getElementById('settings-popup') as HTMLDivElement;

  const showSettingsHandler = () => {
    if (gameState === 'idle') {
      settingsPopup.classList.remove('hidden');
      gameArea.removeEventListener('click', showSettingsHandler);
    }
  };

  gameArea.addEventListener('click', showSettingsHandler);

  // Return cleanup function
  return () => {
    gameArea.removeEventListener('click', showSettingsHandler);
  };
}