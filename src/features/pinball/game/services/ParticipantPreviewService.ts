import { Participant, Marble } from '../../../shared/types';
import { EditorMapJson } from '../../../shared/types/editorMap';
import { parseParticipants } from '../entities/ParticipantManager';
import { createPreviewMarbles, createTestMarbles } from '../entities/MarbleManager';
import { updatePreviewLeaderboard } from '../ui/LeaderboardUI';

export function initializeParticipants(silent: boolean = false): Participant[] {
  const textarea = document.getElementById('names-input') as HTMLTextAreaElement;
  if (textarea && textarea.value.trim() === '') {
    // If empty, fill with placeholder text
    const placeholder = textarea.getAttribute('placeholder');
    if (placeholder) {
      textarea.value = placeholder;
    }
  }
  return parseParticipants(silent) ?? [];
}

export function refreshPreviewMarbles(
  participants: Participant[],
  currentMap: EditorMapJson | null,
  canvasWidth: number
): Marble[] {
  const marbles = participants.length > 0
    ? createPreviewMarbles(participants, currentMap, canvasWidth)
    : createTestMarbles(canvasWidth);

  updatePreviewLeaderboard(participants, marbles);
  return marbles;
}

export function removeWinnersFromParticipants(
  textArea: HTMLTextAreaElement,
  winners: Marble[]
): void {
  const currentParticipants = textArea.value.split('\n').filter((line) => line.trim());
  const winnersSet = new Set(
    winners.map((winner) => winner.name.replace(/#\d+$/, ''))
  );

  const remaining = currentParticipants.filter((participant) => {
    const name = participant.trim().replace(/\*\d+$/, '');
    return !winnersSet.has(name);
  });

  textArea.value = remaining.join('\n');
}
