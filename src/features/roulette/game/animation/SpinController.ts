/**
 * Spin controller module
 * Controls spin start, stop, and winner determination
 *
 * Winner Determination Logic:
 * - Pinset position: 3 o'clock (90°, π/2 radians)
 * - Sectors are drawn counter-clockwise from 3 o'clock
 * - Winner is the sector under the pinset when stopped
 */

import { Participant, SpinSpeed, SpinConfig } from '../../shared/types/roulette';
import { SPIN_SPEEDS, FRICTION_COEFFICIENT, MIN_ROTATION_CYCLES } from '../constants/spin';
import { normalizeAngle } from './SpinPhysics';

/**
 * Start a new spin with selected speed
 * Returns initial angular velocity for the physics engine
 *
 * @param speed - Selected spin speed preset
 * @returns Initial angular velocity in rad/s
 */
export function startSpin(speed: SpinSpeed): number {
  return SPIN_SPEEDS[speed];
}

/**
 * Create spin configuration from speed preset
 *
 * @param speed - Selected spin speed
 * @returns Complete spin configuration
 */
export function createSpinConfig(speed: SpinSpeed): SpinConfig {
  return {
    speed,
    initialVelocity: SPIN_SPEEDS[speed],
    friction: FRICTION_COEFFICIENT,
    minRotations: MIN_ROTATION_CYCLES
  };
}

/**
 * Determine winner based on final roulette angle
 *
 * Algorithm:
 * 1. Pinset is at 3 o'clock position (π/2 radians)
 * 2. Calculate relative angle: (pinset angle - roulette angle)
 * 3. Normalize to [0, 2π) range
 * 4. Determine which sector falls under the pinset
 *
 * Example (4 participants):
 * - Sector 0 (홍길동): [0°, 90°)
 * - Sector 1 (김철수): [90°, 180°)
 * - Sector 2 (이영희): [180°, 270°)
 * - Sector 3 (박민수): [270°, 360°)
 *
 * @param angle - Final roulette angle in radians
 * @param participants - List of participants
 * @returns Winning participant
 */
export function determineWinner(
  angle: number,
  participants: Participant[]
): Participant | null {
  if (participants.length === 0) {
    return null;
  }

  // Pinset position: 3 o'clock (90°)
  const PINSET_ANGLE = Math.PI / 2;

  // Calculate angle from pinset's perspective
  // Subtract roulette rotation to find which sector is under the pinset
  const relativeAngle = PINSET_ANGLE - angle;

  // Normalize to [0, 2π)
  const normalizedAngle = normalizeAngle(relativeAngle);

  // Calculate sector size
  const sectorAngle = (Math.PI * 2) / participants.length;

  // Determine winner index
  // Floor division to get sector number
  // Ensure angle is strictly less than 2π to prevent edge case overflow
  const safeAngle = normalizedAngle >= Math.PI * 2 ? normalizedAngle - Math.PI * 2 : normalizedAngle;
  const winnerIndex = Math.floor(safeAngle / sectorAngle);

  // Clamp to valid range (safety check)
  const safeIndex = Math.max(0, Math.min(winnerIndex, participants.length - 1));

  return participants[safeIndex];
}

/**
 * Get sector bounds for a specific participant
 * Useful for debugging and visualization
 *
 * @param index - Participant index
 * @param totalParticipants - Total number of participants
 * @returns Sector angle range [start, end) in radians
 */
export function getSectorBounds(
  index: number,
  totalParticipants: number
): { start: number; end: number; center: number } {
  const sectorAngle = (Math.PI * 2) / totalParticipants;
  const start = index * sectorAngle;
  const end = (index + 1) * sectorAngle;
  const center = start + sectorAngle / 2;

  return { start, end, center };
}

/**
 * Calculate which sector is currently under the pinset
 * Used for real-time highlighting during spin
 *
 * @param angle - Current roulette angle in radians
 * @param totalParticipants - Total number of participants
 * @returns Current sector index under pinset
 */
export function getCurrentSector(
  angle: number,
  totalParticipants: number
): number {
  const PINSET_ANGLE = Math.PI / 2;
  const relativeAngle = normalizeAngle(PINSET_ANGLE - angle);
  const sectorAngle = (Math.PI * 2) / totalParticipants;

  return Math.floor(relativeAngle / sectorAngle) % totalParticipants;
}

/**
 * Validate participants before starting spin
 *
 * @param participants - List of participants
 * @returns True if valid, false otherwise
 */
export function validateParticipants(participants: Participant[]): boolean {
  // Must have at least 2 participants
  if (participants.length < 2) {
    console.warn('At least 2 participants required');
    return false;
  }

  // Check for duplicate names
  const names = participants.map(p => p.name);
  const uniqueNames = new Set(names);

  if (names.length !== uniqueNames.size) {
    console.warn('Duplicate participant names detected');
    return false;
  }

  // Check for valid weights
  const hasInvalidWeight = participants.some(
    p => p.weight <= 0 || !Number.isFinite(p.weight)
  );

  if (hasInvalidWeight) {
    console.warn('Invalid participant weight detected');
    return false;
  }

  return true;
}

/**
 * Calculate weighted random winner (for future weighted roulette)
 * Currently not used, but prepared for Phase 6 enhancements
 *
 * @param participants - List of participants with weights
 * @returns Randomly selected participant based on weights
 */
export function selectWeightedWinner(participants: Participant[]): Participant | null {
  if (participants.length === 0) {
    return null;
  }

  // Calculate total weight
  const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);

  // Random selection
  let random = Math.random() * totalWeight;

  for (const participant of participants) {
    random -= participant.weight;
    if (random <= 0) {
      return participant;
    }
  }

  // Fallback (should never reach here)
  return participants[participants.length - 1];
}
