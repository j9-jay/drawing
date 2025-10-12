/**
 * Winner display and fireworks effects for roulette game
 */

import { Participant } from '../../shared/types/roulette';
import { generateColor } from '../../shared/utils/colorUtils';
import { showToast } from './ToastManager';

/**
 * Create fireworks animation effect
 */
export function createFireworks(): void {
  const container = document.getElementById('roulette-fireworks-container') as HTMLDivElement;

  if (!container) {
    console.warn('Fireworks container not found');
    return;
  }

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const firework = document.createElement('div');
      firework.className = 'firework';
      firework.style.left = Math.random() * 100 + '%';
      firework.style.top = Math.random() * 100 + '%';
      firework.style.backgroundColor = generateColor(i);

      container.appendChild(firework);

      setTimeout(() => {
        if (container.contains(firework)) {
          container.removeChild(firework);
        }
      }, 1000);
    }, i * 100);
  }
}

/**
 * Show winner display
 * @param winner - The winning participant
 */
export function showWinner(winner: Participant): void {
  const winnerDisplay = document.getElementById('roulette-winner-display') as HTMLDivElement;
  const winnerName = document.getElementById('roulette-winner-name') as HTMLElement;

  if (!winnerDisplay || !winnerName) {
    console.warn('Winner display elements not found');
    return;
  }

  winnerName.textContent = winner.name;
  winnerDisplay.classList.remove('hidden');

  createFireworks();
  showToast(`${winner.name} 당첨!`, 'success');
}

/**
 * Hide winner display
 */
export function hideWinner(): void {
  const winnerDisplay = document.getElementById('roulette-winner-display') as HTMLDivElement;

  if (winnerDisplay) {
    winnerDisplay.classList.add('hidden');
  }
}
