import { getWinners } from '../entities/MarbleManager';
import { showToast } from '../ui/ToastManager';
import { formatSpeedLabel } from '../utils/SpeedUtils';

export function attachWinnerButtonListeners(
  onPlayAgain: () => void,
  onPlayWithoutWinner: () => void
): void {
  const playAgainBtn = document.getElementById('play-again-btn');
  if (playAgainBtn) {
    // Remove cloneNode to preserve React component reference
    // Use { once: true } to prevent duplicate listeners
    playAgainBtn.addEventListener('click', onPlayAgain, { once: true });
  }

  const playWithoutWinnerBtn = document.getElementById('play-without-winner-btn');
  if (playWithoutWinnerBtn) {
    // Remove cloneNode to preserve React component reference
    // Use { once: true } to prevent duplicate listeners
    playWithoutWinnerBtn.addEventListener('click', onPlayWithoutWinner, { once: true });
  }
}

export function hideWinnerDisplay(): void {
  const winnerDisplay = document.getElementById('winner-display') as HTMLDivElement | null;
  winnerDisplay?.classList.add('hidden');

  const fireworksContainer = document.getElementById('fireworks-container');
  if (fireworksContainer) {
    while (fireworksContainer.firstChild) {
      fireworksContainer.removeChild(fireworksContainer.firstChild);
    }
  }
}

export function showWinnerToast(winners: ReturnType<typeof getWinners>): void {
  if (winners.length === 0) return;
  const winnerNames = winners.map((winner) => winner.name.replace(/#\d+$/, '')).join(', ');
  showToast(`Removed winner(s): ${winnerNames}`, 'success');
}

export function updateSpeedUI(clampedValue: number): void {
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement | null;
  if (speedSlider) {
    speedSlider.value = clampedValue.toString();
  }

  const speedValue = document.getElementById('speed-value') as HTMLSpanElement | null;
  if (speedValue) {
    const translationKey = formatSpeedLabel(clampedValue);
    const translations = (window as any).pinballTranslations;
    speedValue.textContent = translations?.[translationKey] || translationKey;
  }
}
