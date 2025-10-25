/**
 * Leaderboard UI management
 * Handles leaderboard rendering and updates
 */

import { Marble, Participant, LeaderboardItem, GameState } from '../../shared/types';
import { showToast } from './ToastManager';

interface LeaderboardContext {
  gameState: GameState;
  lastFinishedCount: number;
}

/**
 * Update the leaderboard during gameplay
 * @param marbles - Current marble states
 * @param context - Game context for leaderboard
 * @returns Updated finished count
 */
export function updateLeaderboard(marbles: Marble[], context: LeaderboardContext): number {
  const leaderboardItems: LeaderboardItem[] = marbles.map((marble, index) => ({
    name: marble.name,
    rank: index + 1,
    position: marble.position.y,
    finished: marble.finished,
    color: marble.color
  }));

  const leaderboardList = document.getElementById('leaderboard-list') as HTMLDivElement;
  if (!leaderboardList) return context.lastFinishedCount;
  leaderboardList.innerHTML = '';

  leaderboardItems.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = `leaderboard-item ${item.finished ? 'finished' : ''} ${
      index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''
    }`;

    itemElement.innerHTML = `
      <div class="leaderboard-rank">${item.rank}</div>
      <div class="leaderboard-name" style="color: ${item.color}">${item.name}</div>
      <div class="leaderboard-status">${item.finished ? 'Finished' : 'Racing'}</div>
    `;

    leaderboardList.appendChild(itemElement);
  });

  // Auto-scroll logic
  let updatedFinishedCount = context.lastFinishedCount;

  if (context.gameState === 'running') {
    const finishedCount = leaderboardItems.filter(item => item.finished).length;
    const racingCount = leaderboardItems.filter(item => !item.finished).length;
    const leaderboard = document.getElementById('leaderboard') as HTMLDivElement;

    if (finishedCount > context.lastFinishedCount && racingCount > 0 && leaderboard) {
      const leaderboardItem = leaderboard.querySelector('.leaderboard-item');
      const itemHeight = leaderboardItem ? leaderboardItem.getBoundingClientRect().height + 8 : 48;

      const firstRacingIndex = leaderboardItems.findIndex(item => !item.finished);

      if (firstRacingIndex >= 0) {
        const bufferItems = 3;
        const targetScrollTop = Math.max(0, (firstRacingIndex - bufferItems) * itemHeight);
        const currentScroll = leaderboard.scrollTop;

        if (targetScrollTop > currentScroll) {
          const duration = 300;
          const startTime = performance.now();
          const distance = targetScrollTop - currentScroll;

          const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 2);
            leaderboard.scrollTop = currentScroll + (distance * easeOut);

            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            }
          };

          requestAnimationFrame(animateScroll);

          if (context.lastFinishedCount === 0 && finishedCount > 0) {
            showToast('Auto-scrolling to keep racing players visible', 'info', 1500);
          }
        }
      }

      updatedFinishedCount = finishedCount;
    } else if (finishedCount !== context.lastFinishedCount) {
      updatedFinishedCount = finishedCount;
    }
  }

  return updatedFinishedCount;
}

/**
 * Update preview leaderboard before game starts
 * @param participants - List of participants
 * @param marbles - Preview marbles for colors
 */
export function updatePreviewLeaderboard(participants: Participant[], marbles: Marble[]): void {
  const sortedParticipants = [...participants].sort((a, b) => a.name.localeCompare(b.name));

  const leaderboardList = document.getElementById('leaderboard-list') as HTMLDivElement;
  if (!leaderboardList) {
    console.error('leaderboard-list element not found');
    return;
  }
  leaderboardList.innerHTML = '';

  sortedParticipants.forEach((participant, index) => {
    const marble = marbles.find(m => m.name === participant.name);
    const itemElement = document.createElement('div');
    itemElement.className = 'leaderboard-item preview';

    itemElement.innerHTML = `
      <div class="leaderboard-rank">${index + 1}</div>
      <div class="leaderboard-name" style="color: ${marble?.color || '#fff'}">${participant.name}</div>
      <div class="leaderboard-status">Ready</div>
    `;

    leaderboardList.appendChild(itemElement);
  });
}

/**
 * Clear the leaderboard display
 */
export function clearLeaderboard(): void {
  const leaderboardList = document.getElementById('leaderboard-list') as HTMLDivElement;
  leaderboardList.innerHTML = '';
}