/**
 * Event handlers module
 * Manages all UI event listeners and interactions
 */

import { RouletteGame } from '../RouletteGame';
import { Participant, SpinSpeed } from '../../shared/types/roulette';
import { getSelectedSpeed, updateParticipantsPreview } from './SettingsUI';
import { hideWinner } from './WinnerDisplay';
import { showToast } from './ToastManager';
import { loadSpinSpeed, saveSpinSpeed } from '../storage/RouletteStorage';

/**
 * Helper: Check if spin can be started
 */
function canStartSpin(game: RouletteGame): boolean {
  const state = game.getState();

  if (state === 'spinning' || state === 'decelerating') {
    showToast('이미 회전 중입니다', 'info');
    return false;
  }

  return true;
}

/**
 * Helper: Validate minimum participants
 */
function validateMinParticipants(participants: Participant[]): boolean {
  if (participants.length < 2) {
    showToast('최소 2명의 참가자가 필요합니다', 'error');
    return false;
  }

  return true;
}

/**
 * Helper: Start new spin with current settings
 */
function startNewSpin(game: RouletteGame): void {
  hideWinner();
  const speed = getSelectedSpeed();
  game.startSpinning(speed);
}

/**
 * Helper: Get spin speed text for toast
 */
function getSpinSpeedText(speed: SpinSpeed): string {
  switch (speed) {
    case 'WEAK': return '약하게';
    case 'STRONG': return '세게';
    default: return '보통';
  }
}

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
    if (!canStartSpin(game)) return;

    const participants = game.getParticipants();
    if (!validateMinParticipants(participants)) return;

    startNewSpin(game);
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
    if (!canStartSpin(game)) return;

    const participants = parseParticipantsFromInput();
    if (!validateMinParticipants(participants)) return;

    game.setParticipants(participants);

    const speed = getSelectedSpeed();
    startNewSpin(game);

    showToast(`${getSpinSpeedText(speed)} 회전 시작!`, 'success');
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
    const participants = parseParticipantsFromInput();
    if (!validateMinParticipants(participants)) return;

    game.setParticipants(participants);
    hideWinner();

    showToast('게임이 리셋되었습니다', 'info');
  });
}

/**
 * Helper: Remove winner and restart with remaining participants
 */
function removeWinnerAndRestart(game: RouletteGame, winnerName: string): void {
  if (!winnerName) {
    showToast('당첨자 정보를 찾을 수 없습니다', 'error');
    return;
  }

  const currentParticipants = game.getParticipants();
  const newParticipants = currentParticipants.filter(p => p.name !== winnerName);

  if (!validateMinParticipants(newParticipants)) {
    showToast('참가자가 부족하여 당첨자를 제외할 수 없습니다 (최소 2명 필요)', 'error');
    return;
  }

  game.setParticipants(newParticipants);
  updateTextareaFromParticipants(newParticipants);
  startNewSpin(game);

  showToast(`${winnerName}님이 제외되었습니다`, 'info');
}

/**
 * Setup play again button
 */
function setupPlayAgainButton(game: RouletteGame): void {
  const playAgainBtn = document.getElementById('roulette-play-again-btn');
  if (!playAgainBtn) return;

  playAgainBtn.addEventListener('click', () => {
    startNewSpin(game);
  });
}

/**
 * Setup play without winner button
 */
function setupPlayWithoutWinnerButton(game: RouletteGame): void {
  const playWithoutWinnerBtn = document.getElementById('roulette-play-without-winner-btn');
  if (!playWithoutWinnerBtn) return;

  playWithoutWinnerBtn.addEventListener('click', () => {
    hideWinner();

    const winnerNameElement = document.getElementById('roulette-winner-name');
    const winnerName = winnerNameElement?.textContent || '';

    removeWinnerAndRestart(game, winnerName);
  });
}

/**
 * Winner display button listeners
 */
function setupWinnerButtonListeners(game: RouletteGame): void {
  setupPlayAgainButton(game);
  setupPlayWithoutWinnerButton(game);
}

/**
 * Helper: Initialize participant input with saved or default data
 */
function initializeParticipantInput(game: RouletteGame): void {
  const loadedParticipants = game.getParticipants();

  if (loadedParticipants.length >= 2) {
    updateTextareaFromParticipants(loadedParticipants);
    updateParticipantsPreview(loadedParticipants);
  } else {
    const initialParticipants = parseParticipantsFromInput();
    updateParticipantsPreview(initialParticipants);
    game.setParticipants(initialParticipants);
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

  initializeParticipantInput(game);
}

/**
 * Helper: Get participant input value from textarea
 */
function getParticipantInputValue(): string {
  const textarea = document.getElementById('roulette-names-input') as HTMLTextAreaElement;

  if (!textarea) {
    console.warn('Participant input textarea not found');
    return '';
  }

  return textarea.value;
}

/**
 * Helper: Parse single participant entry
 * @param entry - Entry string (e.g., "홍길동" or "홍길동*3")
 * @returns Participant object or null if invalid
 */
function parseParticipantEntry(entry: string): Participant | null {
  const trimmed = entry.trim();
  if (trimmed.length === 0) return null;

  // Check for weight syntax: "name*weight"
  const match = trimmed.match(/^(.+?)\*(\d+)$/);

  if (match) {
    const name = match[1].trim();
    const weight = parseInt(match[2], 10);

    if (name.length > 0 && weight > 0) {
      return { name, weight };
    }
    return null;
  }

  // Regular participant (weight = 1)
  return { name: trimmed, weight: 1 };
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
  const input = getParticipantInputValue();

  // Split by line breaks or commas
  const entries = input.split(/[\n,]/);

  const participants: Participant[] = [];

  for (const entry of entries) {
    const participant = parseParticipantEntry(entry);
    if (participant) {
      participants.push(participant);
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
