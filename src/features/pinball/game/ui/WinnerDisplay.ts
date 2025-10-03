/**
 * Winner display and fireworks effects
 */

import { Marble, GameSettings } from '../../shared/types';
import { generateColor } from '../utils/ColorUtils';
import { showToast } from './ToastManager';

/**
 * Create fireworks animation effect
 */
export function createFireworks(): void {
  const container = document.getElementById('fireworks-container') as HTMLDivElement;

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
 * Show single winner display
 * @param winner - The winning marble
 */
export function showWinner(winner: Marble): void {
  const winnerDisplay = document.getElementById('winner-display') as HTMLDivElement;
  const winnerName = document.getElementById('winner-name') as HTMLElement;

  winnerName.textContent = winner.name;
  winnerDisplay.classList.remove('hidden');

  createFireworks();
}

/**
 * Show top N winners display
 * @param winners - Array of winning marbles
 * @param settings - Game settings for topNCount
 * @param attachListeners - Callback to attach button listeners
 */
export function showTopNWinners(
  winners: Marble[],
  settings: GameSettings,
  attachListeners: () => void
): void {
  const winnerDisplay = document.getElementById('winner-display') as HTMLDivElement;
  const winnerContent = document.getElementById('winner-content') as HTMLDivElement;

  // Determine columns and font size based on winner count
  const winnerCount = winners.length;
  let columns = 1;
  let fontSize = '1.5rem';
  let lineHeight = '1.4';

  if (winnerCount <= 10) {
    columns = 1;
    fontSize = '1.5rem';
  } else if (winnerCount <= 20) {
    columns = 2;
    fontSize = '1.3rem';
  } else if (winnerCount <= 30) {
    columns = 3;
    fontSize = '1.1rem';
    lineHeight = '1.3';
  } else {
    columns = 4;
    fontSize = '1rem';
    lineHeight = '1.2';
  }

  const winnersPerColumn = Math.ceil(winnerCount / columns);

  let winnerContent_html = '';

  if (columns === 1) {
    // Single column display
    const winnerNames = winners.map((w, index) => `${index + 1}등: ${w.name}`).join('<br>');
    winnerContent_html = `
      <div id="winner-name" style="font-size: ${fontSize}; color: #ffd700; line-height: ${lineHeight}; margin-bottom: 30px;">
        ${winnerNames}
      </div>
    `;
  } else {
    // Multi-column display using grid
    winnerContent_html = `
      <div id="winner-name" style="
        display: grid;
        grid-template-columns: repeat(${columns}, 1fr);
        gap: 20px;
        font-size: ${fontSize};
        color: #ffd700;
        line-height: ${lineHeight};
        margin-bottom: 30px;
        max-width: 90vw;
        justify-items: center;
      ">
    `;

    for (let col = 0; col < columns; col++) {
      const startIndex = col * winnersPerColumn;
      const endIndex = Math.min(startIndex + winnersPerColumn, winnerCount);
      const columnWinners = winners.slice(startIndex, endIndex);

      winnerContent_html += `
        <div style="text-align: center;">
          ${columnWinners.map((w, index) => `${startIndex + index + 1}등: ${w.name}`).join('<br>')}
        </div>
      `;
    }

    winnerContent_html += '</div>';
  }

  winnerContent.innerHTML = `
    <h1>🎉 Top ${settings.topNCount} Winners! 🎉</h1>
    ${winnerContent_html}
    <div id="winner-buttons">
      <button id="play-again-btn" class="winner-btn">Play Again</button>
      <button id="play-without-winner-btn" class="winner-btn secondary">Play Without Winner</button>
    </div>
  `;
  winnerDisplay.classList.remove('hidden');

  // Create fireworks effect
  createFireworks();

  // Update start button text
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  startBtn.textContent = 'Stop';

  // Re-attach event listeners for the new buttons
  attachListeners();

  showToast(`Top ${settings.topNCount} Winners determined!`, 'success');
}