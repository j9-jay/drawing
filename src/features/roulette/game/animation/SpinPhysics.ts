/**
 * Spin physics module
 * Handles physics-based rotation with friction-based deceleration
 *
 * Physics Model:
 * - Angular velocity decreases exponentially: v(t+Δt) = v(t) × (1 - friction × Δt)
 * - Angular position updates: θ(t+Δt) = θ(t) + v(t) × Δt
 * - Normalized angle: θ ∈ [0, 2π)
 * - Stop condition: v < STOP_THRESHOLD
 */

import { SpinConfig } from '../../shared/types/roulette';
import { STOP_THRESHOLD } from '../constants/spin';

/**
 * Update spin physics for one frame
 * Applies dynamic friction-based deceleration and updates angle
 *
 * Dynamic Friction Model:
 * - High velocity: Higher friction (fast deceleration)
 * - Low velocity: Lower friction (slow deceleration, sliding effect)
 * - This creates a natural "sliding to stop" feel
 *
 * @param angle - Current angle in radians
 * @param velocity - Current angular velocity in rad/s
 * @param config - Spin configuration (friction, etc.)
 * @param deltaTime - Time elapsed since last frame in seconds
 * @returns Updated physics state
 */
export function updateSpinPhysics(
  angle: number,
  velocity: number,
  config: SpinConfig,
  deltaTime: number
): { angle: number; velocity: number; stopped: boolean } {
  // Calculate dynamic friction based on current velocity
  // When velocity is high: use higher friction (fast deceleration)
  // When velocity is low: use lower friction (slow deceleration, sliding)
  const velocityRatio = Math.abs(velocity) / config.initialVelocity;

  // Friction range: from base friction to higher friction
  // velocityRatio = 1.0 (high speed) → use higher friction (0.985)
  // velocityRatio = 0.0 (low speed) → use lower friction (0.995)
  const frictionHigh = 0.985; // Fast deceleration at high speed
  const frictionLow = 0.995;  // Slow deceleration at low speed (sliding)

  // Interpolate friction based on velocity
  const dynamicFriction = frictionLow + (frictionHigh - frictionLow) * velocityRatio;

  // Apply friction: exponential decay with dynamic friction
  // v(t+Δt) = v(t) × friction^(Δt×60)
  // Note: 60 FPS normalization factor for consistent feel across frame rates
  const newVelocity = velocity * Math.pow(dynamicFriction, deltaTime * 60);

  // Update angle: θ(t+Δt) = θ(t) + v(t) × Δt
  const newAngle = angle + newVelocity * deltaTime;

  // Normalize angle to [0, 2π)
  const normalizedAngle = normalizeAngle(newAngle);

  // Check stop condition
  const stopped = newVelocity < STOP_THRESHOLD;

  return {
    angle: normalizedAngle,
    velocity: stopped ? 0 : newVelocity,
    stopped
  };
}

/**
 * Normalize angle to [0, 2π) range
 * Ensures consistent angle representation
 *
 * @param angle - Input angle in radians
 * @returns Normalized angle in [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  const TWO_PI = Math.PI * 2;

  // Use modulo and handle negative values
  let normalized = angle % TWO_PI;

  if (normalized < 0) {
    normalized += TWO_PI;
  }

  return normalized;
}

/**
 * Calculate target angle to ensure minimum rotations
 * Used for validation and testing
 *
 * @param minRotations - Minimum number of full rotations
 * @returns Target angle in radians (minRotations × 2π)
 */
export function calculateTargetAngle(minRotations: number): number {
  return minRotations * Math.PI * 2;
}

/**
 * Estimate total rotation distance based on initial velocity
 * Uses physics formula: θ_total = v₀ / (2 × friction_factor)
 *
 * This helps validate if the spin will meet minimum rotation requirements
 *
 * @param initialVelocity - Initial angular velocity in rad/s
 * @param friction - Friction coefficient (e.g., 0.98)
 * @returns Estimated total rotation in radians
 */
export function estimateTotalRotation(
  initialVelocity: number,
  friction: number
): number {
  // Simplified exponential decay integration
  // θ_total ≈ v₀ × time_constant
  // time_constant ≈ 1 / (1 - friction)
  const frictionFactor = 1 - friction;
  const timeConstant = 1 / (frictionFactor * 60); // 60 FPS adjustment

  return initialVelocity * timeConstant;
}

/**
 * Validate if spin configuration meets minimum rotation requirement
 *
 * @param config - Spin configuration
 * @returns True if spin will complete minimum rotations
 */
export function validateSpinConfig(config: SpinConfig): boolean {
  const estimatedRotation = estimateTotalRotation(
    config.initialVelocity,
    config.friction
  );

  const minRotationAngle = calculateTargetAngle(config.minRotations);

  return estimatedRotation >= minRotationAngle;
}

/**
 * Calculate friction coefficient to achieve target rotation distance
 * Useful for tuning physics parameters
 *
 * @param initialVelocity - Initial angular velocity in rad/s
 * @param targetRotation - Target total rotation in radians
 * @returns Required friction coefficient
 */
export function calculateFrictionForTarget(
  initialVelocity: number,
  targetRotation: number
): number {
  // Inverse of estimateTotalRotation
  const timeConstant = targetRotation / initialVelocity;
  const frictionFactor = 1 / (timeConstant * 60);

  return 1 - frictionFactor;
}
