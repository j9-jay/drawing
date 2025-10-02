import { getWinners } from '../entities/MarbleManager';
import { showToast } from '../ui/ToastManager';
import { formatSpeedLabel } from '../utils/SpeedUtils';

export function attachWinnerButtonListeners(
  onPlayAgain: () => void,
  onPlayWithoutWinner: () => void
): void {
  const playAgainBtn = document.getElementById('play-again-btn');
  if (playAgainBtn) {
    playAgainBtn.replaceWith(playAgainBtn.cloneNode(true));
    const newBtn = document.getElementById('play-again-btn');
    newBtn?.addEventListener('click', onPlayAgain);
  }

  const playWithoutWinnerBtn = document.getElementById('play-without-winner-btn');
  if (playWithoutWinnerBtn) {
    playWithoutWinnerBtn.replaceWith(playWithoutWinnerBtn.cloneNode(true));
    const newBtn = document.getElementById('play-without-winner-btn');
    newBtn?.addEventListener('click', onPlayWithoutWinner);
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
    speedValue.textContent = formatSpeedLabel(clampedValue);
  }
}
