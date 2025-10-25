/**
 * Settings UI manager
 * Handles settings popup and user input
 */

import { Participant, SpinSpeed } from '../../shared/types/roulette';

/**
 * Show settings popup
 */
export function showSettings(): void {
  const popup = document.getElementById('roulette-settings-popup');
  if (popup) {
    popup.classList.remove('hidden');
  }
}

/**
 * Hide settings popup
 */
export function hideSettings(): void {
  const popup = document.getElementById('roulette-settings-popup');
  if (popup) {
    popup.classList.add('hidden');
  }
}

/**
 * Get selected spin speed from radio buttons
 */
export function getSelectedSpeed(): SpinSpeed {
  const selected = document.querySelector('input[name="spin-speed"]:checked') as HTMLInputElement;
  return (selected?.value as SpinSpeed) || 'NORMAL';
}

/**
 * Update participants preview
 * Shows participant count and validation state
 *
 * @param participants - Parsed participants array
 */
export function updateParticipantsPreview(participants: Participant[]): void {
  const textarea = document.getElementById('roulette-names-input') as HTMLTextAreaElement;

  if (!textarea) {
    return;
  }

  // Validation: minimum 2 participants
  const isValid = participants.length >= 2;

  // Visual feedback
  if (isValid) {
    textarea.classList.remove('invalid');
    textarea.classList.add('valid');
  } else {
    textarea.classList.remove('valid');
    textarea.classList.add('invalid');
  }

  // Update title with participant count
  const label = textarea.parentElement?.querySelector('label');
  if (label) {
    const baseText = window.rouletteTranslations?.participants || '참가자 (줄바꿈 또는 쉼표로 구분, *숫자로 가중치, 최대 8자)';
    const countText = participants.length > 0
      ? ` - ${participants.length}${window.rouletteTranslations?.participantsCount || '명'}`
      : '';
    const validationText = participants.length < 2 && participants.length > 0
      ? ` ${window.rouletteTranslations?.participantsMin || '⚠️ 최소 2명 필요'}`
      : '';

    label.textContent = baseText + countText + validationText;
  }
}
