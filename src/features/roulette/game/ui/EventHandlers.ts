/**
 * Event handlers module
 * Manages all UI event listeners and interactions
 */

import { RouletteGame } from '../RouletteGame';
import { Participant } from '../../shared/types/roulette';
import { getSelectedSpeed, updateParticipantsPreview } from './SettingsUI';
import { hideWinner } from './WinnerDisplay';
import { showToast } from './ToastManager';
import { loadSpinSpeed, saveSpinSpeed } from '../storage/RouletteStorage';

/**
 * Setup all event listeners for roulette game
 * @param game - RouletteGame instance
 */
export function setupEventListeners(game: RouletteGame): void {
  setupCanvasClickListener(game);
  setupSpinButtonListener(game);
  setupResetButtonListener(game);
  setupWinnerButtonListeners(game);
  setupParticipantInputListener(game);
  setupSpeedPreference();
}

/**
 * Canvas click listener - start spin
 */
function setupCanvasClickListener(game: RouletteGame): void {
  const canvas = document.getElementById('roulette-canvas');

  if (!canvas) {
    console.warn('Canvas element not found for click listener');
    return;
  }

  canvas.addEventListener('click', () => {
    const state = game.getState();

    // Only allow spin when idle or stopped
    if (state === 'spinning' || state === 'decelerating') {
      showToast('이미 회전 중입니다', 'info');
      return;
    }

    // Get participants before spinning
    const participants = game.getParticipants();
    if (participants.length < 2) {
      showToast('최소 2명의 참가자가 필요합니다', 'error');
      return;
    }

    // Hide previous winner
    hideWinner();

    // Start spin with selected speed
    const speed = getSelectedSpeed();
    game.startSpinning(speed);
  });
}

/**
 * Spin button listener
 */
function setupSpinButtonListener(game: RouletteGame): void {
  const spinBtn = document.getElementById('roulette-spin-btn');

  if (!spinBtn) {
    console.warn('Spin button not found');
    return;
  }

  spinBtn.addEventListener('click', () => {
    const state = game.getState();

    // Only allow spin when idle or stopped
    if (state === 'spinning' || state === 'decelerating') {
      showToast('이미 회전 중입니다', 'info');
      return;
    }

    // Parse and validate participants from textarea
    const participants = parseParticipantsFromInput();

    if (participants.length < 2) {
      showToast('최소 2명의 참가자가 필요합니다', 'error');
      return;
    }

    // Update game participants
    game.setParticipants(participants);

    // Hide previous winner
    hideWinner();

    // Start spin with selected speed
    const speed = getSelectedSpeed();
    game.startSpinning(speed);

    showToast(`${speed === 'WEAK' ? '약하게' : speed === 'STRONG' ? '세게' : '보통'} 회전 시작!`, 'success');
  });
}

/**
 * Reset button listener
 */
function setupResetButtonListener(game: RouletteGame): void {
  const resetBtn = document.getElementById('roulette-reset-btn');

  if (!resetBtn) {
    console.warn('Reset button not found');
    return;
  }

  resetBtn.addEventListener('click', () => {
    // Parse participants from input
    const participants = parseParticipantsFromInput();

    if (participants.length < 2) {
      showToast('최소 2명의 참가자가 필요합니다', 'error');
      return;
    }

    // Update game participants (this also resets the game)
    game.setParticipants(participants);

    // Hide winner display
    hideWinner();

    showToast('게임이 리셋되었습니다', 'info');
  });
}

/**
 * Winner display button listeners
 */
function setupWinnerButtonListeners(game: RouletteGame): void {
  // Play Again button
  const playAgainBtn = document.getElementById('roulette-play-again-btn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      hideWinner();

      // Start new spin with same participants
      const speed = getSelectedSpeed();
      game.startSpinning(speed);
    });
  }

  // Play Without Winner button
  const playWithoutWinnerBtn = document.getElementById('roulette-play-without-winner-btn');
  if (playWithoutWinnerBtn) {
    playWithoutWinnerBtn.addEventListener('click', () => {
      hideWinner();

      // Get current participants
      const currentParticipants = game.getParticipants();

      // Get winner name from display
      const winnerNameElement = document.getElementById('roulette-winner-name');
      const winnerName = winnerNameElement?.textContent || '';

      // Remove winner from participants
      const newParticipants = currentParticipants.filter(p => p.name !== winnerName);

      if (newParticipants.length < 2) {
        showToast('참가자가 부족하여 당첨자를 제외할 수 없습니다 (최소 2명 필요)', 'error');
        return;
      }

      // Update game with new participants
      game.setParticipants(newParticipants);

      // Update textarea
      updateTextareaFromParticipants(newParticipants);

      // Start new spin
      const speed = getSelectedSpeed();
      game.startSpinning(speed);

      showToast(`${winnerName}님이 제외되었습니다`, 'info');
    });
  }
}

/**
 * Participant input listener - real-time preview
 */
function setupParticipantInputListener(game: RouletteGame): void {
  const textarea = document.getElementById('roulette-names-input') as HTMLTextAreaElement;

  if (!textarea) {
    console.warn('Participant input textarea not found');
    return;
  }

  textarea.addEventListener('input', () => {
    const participants = parseParticipantsFromInput();
    updateParticipantsPreview(participants);
  });

  // Check if game already has loaded participants from storage
  const loadedParticipants = game.getParticipants();

  if (loadedParticipants.length >= 2) {
    // Update textarea to reflect loaded participants
    updateTextareaFromParticipants(loadedParticipants);
    updateParticipantsPreview(loadedParticipants);
  } else {
    // No saved data - use textarea default value
    const initialParticipants = parseParticipantsFromInput();
    updateParticipantsPreview(initialParticipants);
    game.setParticipants(initialParticipants);
  }
}

/**
 * Parse participants from textarea input
 * Supports formats:
 * - "홍길동, 김철수, 이영희"
 * - "홍길동*2, 김철수*3, 이영희" (weighted)
 * - Line breaks or commas as separators
 *
 * @returns Parsed participants array
 */
export function parseParticipantsFromInput(): Participant[] {
  const textarea = document.getElementById('roulette-names-input') as HTMLTextAreaElement;

  if (!textarea) {
    console.warn('Participant input textarea not found');
    return [];
  }

  const input = textarea.value;

  // Split by line breaks or commas
  const entries = input
    .split(/[\n,]/)
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0);

  const participants: Participant[] = [];

  for (const entry of entries) {
    // Check for weight syntax: "name*weight"
    const match = entry.match(/^(.+?)\*(\d+)$/);

    if (match) {
      // Weighted participant
      const name = match[1].trim();
      const weight = parseInt(match[2], 10);

      if (name.length > 0 && weight > 0) {
        participants.push({ name, weight });
      }
    } else {
      // Regular participant (weight = 1)
      const name = entry.trim();
      if (name.length > 0) {
        participants.push({ name, weight: 1 });
      }
    }
  }

  return participants;
}

/**
 * Update textarea from participants array
 * Used when winner is removed
 *
 * @param participants - Participants array
 */
function updateTextareaFromParticipants(participants: Participant[]): void {
  const textarea = document.getElementById('roulette-names-input') as HTMLTextAreaElement;

  if (!textarea) {
    return;
  }

  const text = participants
    .map(p => p.weight > 1 ? `${p.name}*${p.weight}` : p.name)
    .join(', ');

  textarea.value = text;

  // Trigger input event to update preview
  textarea.dispatchEvent(new Event('input'));
}

/**
 * Setup speed preference saving and loading
 * Loads saved speed on init and saves on change
 */
function setupSpeedPreference(): void {
  // Load saved speed preference
  const savedSpeed = loadSpinSpeed();

  // Set the radio button to match saved preference
  const radioButton = document.getElementById(`speed-${savedSpeed.toLowerCase()}`) as HTMLInputElement;
  if (radioButton) {
    radioButton.checked = true;
  }

  // Add change listeners to all speed radio buttons
  const speedRadios = document.querySelectorAll('input[name="spin-speed"]');
  speedRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        const speed = target.value as 'WEAK' | 'NORMAL' | 'STRONG';
        saveSpinSpeed(speed);
      }
    });
  });
}
