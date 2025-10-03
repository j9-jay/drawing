/**
 * Participant management
 * Handles parsing and managing game participants
 */

import { Participant, GameSettings } from '../../shared/types';
import { showToast } from '../ui/ToastManager';
import { MAX_PARTICIPANT_NAME_LENGTH } from '../constants/ui';

/**
 * Parse participants from input textarea
 * @param silent - Whether to suppress error toasts
 * @returns Array of parsed participants or null if invalid
 */
export function parseParticipants(silent: boolean = false): Participant[] | null {
  const textarea = document.getElementById('names-input') as HTMLTextAreaElement;
  if (!textarea) {
    console.error('names-input element not found');
    if (!silent) showToast('Names input field not found', 'error');
    return null;
  }

  const input = textarea.value.trim();
  if (!input) {
    if (!silent) showToast('Please enter participants', 'error');
    return null;
  }

  const participants: Participant[] = [];

  // Split by both commas and newlines
  const entries: string[] = [];
  const lines = input.split('\n');
  lines.forEach(line => {
    // Split each line by commas
    const items = line.split(',');
    items.forEach(item => {
      const trimmed = item.trim();
      if (trimmed) {
        entries.push(trimmed);
      }
    });
  });

  entries.forEach(entry => {
    const trimmed = entry.trim();
    const match = trimmed.match(/^(.+?)\*(\d+)$/);

    if (match) {
      const name = match[1].trim().substring(0, MAX_PARTICIPANT_NAME_LENGTH);
      const weight = parseInt(match[2]);
      // Create marbles based on weight
      for (let i = 0; i < weight; i++) {
        participants.push({ name: `${name}#${i + 1}`, weight: 1 });
      }
    } else {
      const name = trimmed.substring(0, MAX_PARTICIPANT_NAME_LENGTH);
      participants.push({ name: name, weight: 1 });
    }
  });

  return participants.length > 0 ? participants : null;
}

/**
 * Update settings with parsed participants
 * @param settings - Game settings to update
 * @param silent - Whether to suppress error toasts
 * @returns Whether participants were successfully parsed and set
 */
export function updateParticipants(settings: GameSettings, silent: boolean = false): boolean {
  const participants = parseParticipants(silent);
  if (participants) {
    settings.participants = participants;
    return true;
  }
  return false;
}