/**
 * Marble management utilities
 * Functions for creating and managing marbles
 */

import { World, Vec2, Circle } from 'planck';
import { Marble, Participant } from '../../shared/types';
import { EditorMapJson } from '../../shared/types/editorMap';
import { generateColor } from '../utils/ColorUtils';
import {
  MARBLE_PREVIEW_SIZE,
  MARBLE_GAME_SIZE,
  MARBLE_BODY_DENSITY,
  MARBLE_FRICTION,
  MARBLE_RESTITUTION,
  PIXELS_PER_METER,
  SLEEP_LINEAR_TOLERANCE,
  SLEEP_ANGULAR_TOLERANCE,
  SLEEP_TIME_UNTIL_SLEEP
} from '../constants/physics';
import {
  PREVIEW_BASE_OFFSET_Y,
  PREVIEW_GROUP_WIDTH_MAX,
  PREVIEW_VERTICAL_SPACING_MULTIPLIER,
  PREVIEW_RANDOM_OFFSET_RATIO,
  TEST_PARTICIPANTS
} from '../constants/participants';
import { DEFAULT_SPAWN_HEIGHT } from '../constants/map';
import { CAMERA_VIEWPORT_CENTER_RATIO } from '../constants/camera';

/**
 * Create preview marbles for display before game starts
 */
export function createPreviewMarbles(
  participants: Participant[],
  currentMap: EditorMapJson | null,
  canvasWidth: number
): Marble[] {
  const marbles: Marble[] = [];
  const marbleSize = MARBLE_PREVIEW_SIZE;

  // Use map spawn point or default position
  let centerX: number;
  let baseY: number;

  if (currentMap && currentMap.meta.spawnPoint) {
    centerX = currentMap.meta.spawnPoint.x;
    baseY = currentMap.meta.spawnPoint.y - PREVIEW_BASE_OFFSET_Y; // Place preview marbles above spawn point
  } else {
    centerX = canvasWidth / 2;
    baseY = PREVIEW_BASE_OFFSET_Y - MARBLE_PREVIEW_SIZE;
  }

  // Place marbles close together in center (overlapping)
  const groupWidth = Math.min(PREVIEW_GROUP_WIDTH_MAX, canvasWidth * 0.3); // Narrower area
  const cols = Math.ceil(Math.sqrt(participants.length));
  const rows = Math.ceil(participants.length / cols);

  // Generate positions array
  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const spacingX = groupWidth / (cols + 1);
      const spacingY = marbleSize * PREVIEW_VERTICAL_SPACING_MULTIPLIER; // Reduced vertical spacing
      const x = centerX - (groupWidth / 2) + spacingX * (col + 1);
      const y = baseY + row * spacingY;

      // Add slight random offset (overlapping effect)
      const randomOffsetX = (Math.random() - 0.5) * marbleSize * PREVIEW_RANDOM_OFFSET_RATIO;
      const randomOffsetY = (Math.random() - 0.5) * marbleSize * PREVIEW_RANDOM_OFFSET_RATIO;

      positions.push({ x: x + randomOffsetX, y: y + randomOffsetY });
    }
  }

  // Shuffle positions array for randomized placement
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  participants.forEach((participant, index) => {
    if (index < positions.length) {
      const pos = positions[index];
      const marble: Marble = {
        name: participant.name,
        position: pos,
        size: marbleSize,
        color: generateColor(index),
        isPreview: true,
        finished: false
      };
      marbles.push(marble);
    }
  });

  return marbles;
}

/**
 * Create test marbles for demonstration
 */
export function createTestMarbles(canvasWidth: number): Marble[] {
  const marbles: Marble[] = [];
  const testParticipants = TEST_PARTICIPANTS;

  testParticipants.forEach((name, index) => {
    const x = (canvasWidth / (testParticipants.length + 1)) * (index + 1);
    const y = PREVIEW_BASE_OFFSET_Y;

    const marble: Marble = {
      name,
      position: { x, y },
      size: MARBLE_PREVIEW_SIZE,
      color: generateColor(index),
      isPreview: true,
      finished: false
    };

    marbles.push(marble);
  });

  return marbles;
}

/**
 * Create game marbles with physics bodies
 */
export function createGameMarbles(
  participants: Participant[],
  world: World,
  currentMap: EditorMapJson | null,
  canvasWidth: number
): Marble[] {
  const marbles: Marble[] = [];
  const marbleSize = MARBLE_GAME_SIZE; // Pixel units (visible size in rendering)

  // Set spawn position based on screen center (game world coordinates)
  let spawnX = (canvasWidth * CAMERA_VIEWPORT_CENTER_RATIO) / PIXELS_PER_METER; // Screen center X (game coords)
  let spawnY = DEFAULT_SPAWN_HEIGHT / PIXELS_PER_METER; // Near screen top Y (game coords)

  if (currentMap && currentMap.meta.spawnPoint) {
    spawnX = currentMap.meta.spawnPoint.x / PIXELS_PER_METER; // Convert pixels to game coords
    spawnY = currentMap.meta.spawnPoint.y / PIXELS_PER_METER;
  }

  // Place marbles around spawn position (game world coordinate system)
  const groupWidth = 4; // Game world units
  const cols = Math.ceil(Math.sqrt(participants.length));
  const rows = Math.ceil(participants.length / cols);

  // Generate possible positions array (game world coordinate basis)
  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const spacingX = groupWidth / (cols + 1);
      const spacingY = (marbleSize / PIXELS_PER_METER) * 2; // Vertical spacing (convert to game world units)
      const x = spawnX - (groupWidth / 2) + spacingX * (col + 1);
      const y = spawnY + row * spacingY;

      // Add slight random offset (game world units)
      const randomOffsetX = (Math.random() - 0.5) * (marbleSize / PIXELS_PER_METER) * 0.5;
      const randomOffsetY = (Math.random() - 0.5) * (marbleSize / PIXELS_PER_METER) * 0.5;

      const finalX = x + randomOffsetX;
      const finalY = y + randomOffsetY;

      positions.push({ x: finalX, y: finalY });
    }
  }

  // Shuffle position array
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  participants.forEach((participant, index) => {
    if (index < positions.length) {
      const pos = positions[index];

      const body = world.createBody({
        type: 'dynamic',
        position: Vec2(pos.x, pos.y) // pos is already in game world coordinates
      });

      body.createFixture(Circle(marbleSize / PIXELS_PER_METER), {
        density: MARBLE_BODY_DENSITY,
        friction: MARBLE_FRICTION,
        restitution: MARBLE_RESTITUTION
      });

      // Sleep 시스템 활성화
      body.setSleepingAllowed(true);

      const marble: Marble = {
        name: participant.name,
        body,
        position: {
          x: pos.x * PIXELS_PER_METER,
          y: pos.y * PIXELS_PER_METER
        }, // Store in pixel units
        size: marbleSize,
        color: generateColor(index),
        isPreview: false,
        finished: false
      };

      marbles.push(marble);
    }
  });

  return marbles;
}

/**
 * Determine winner based on game settings
 */
export function determineWinner(
  marbles: Marble[],
  winnerMode: string,
  customRank?: number
): Marble | null {
  const finishedMarbles = marbles.filter(m => m.finished)
    .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));

  switch (winnerMode) {
    case 'first':
      return finishedMarbles[0] || null;
    case 'last':
      return finishedMarbles[finishedMarbles.length - 1] || null;
    case 'custom': {
      const rank = (customRank || 1) - 1;
      return finishedMarbles[rank] || finishedMarbles[0] || null;
    }
    default:
      return finishedMarbles[0] || null;
  }
}

/**
 * Get winners based on winner mode
 */
export function getWinners(
  marbles: Marble[],
  winnerMode: string,
  customRank: number,
  topNCount: number
): Marble[] {
  const finishedMarbles = marbles.filter(m => m.finished)
    .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0));

  switch (winnerMode) {
    case 'first':
      return finishedMarbles.length >= 1 ? [finishedMarbles[0]] : [];
    case 'last':
      return finishedMarbles.length === marbles.length
        ? [finishedMarbles[finishedMarbles.length - 1]]
        : [];
    case 'custom': {
      const rank = customRank - 1;
      return finishedMarbles.length > rank ? [finishedMarbles[rank]] : [];
    }
    case 'topN':
      return finishedMarbles.slice(0, Math.min(topNCount, finishedMarbles.length));
    default:
      return [];
  }
}
