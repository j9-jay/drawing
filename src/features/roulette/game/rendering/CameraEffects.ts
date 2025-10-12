/**
 * Camera effects module
 * Handles zoom and camera shake effects
 */

import { CameraState } from '../../shared/types/roulette';
import {
  ZOOM_DEFAULT,
  ZOOM_WIN,
  ZOOM_TRANSITION_SPEED,
  ZOOM_LERP_THRESHOLD,
  ZOOM_START_VELOCITY,
  CAMERA_SHAKE_DURATION,
  CAMERA_SHAKE_INTENSITY,
  CAMERA_SHAKE_FREQUENCY
} from '../constants/camera';

/**
 * Shake state for tracking shake animation
 */
interface ShakeState {
  startTime: number;
  duration: number;
  intensity: number;
}

let shakeState: ShakeState | null = null;

/**
 * Linear interpolation
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Ease-in-out cubic function
 * Provides smooth acceleration and deceleration
 * @param t - Progress value (0-1)
 * @returns Eased value (0-1)
 */
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Update camera zoom based on spin velocity
 *
 * Zoom behavior:
 * - High velocity (> ZOOM_START_VELOCITY): Default zoom (1.0x)
 * - Low velocity (< ZOOM_START_VELOCITY): Gradual zoom in
 * - Near stop: Maximum zoom (1.5x) for winner highlight
 *
 * Uses ease-in-out curve for smooth zoom transition
 *
 * @param cameraState - Current camera state (mutated)
 * @param velocity - Current angular velocity (rad/s)
 * @param deltaTime - Time elapsed since last frame (unused, kept for API consistency)
 */
export function updateCameraZoom(
  cameraState: CameraState,
  velocity: number,
  deltaTime: number
): void {
  // Determine target zoom based on velocity
  let targetZoom: number;

  if (velocity > ZOOM_START_VELOCITY) {
    // High speed: Default zoom
    targetZoom = ZOOM_DEFAULT;
  } else {
    // Low speed: Zoom in progressively
    // progress: 0 (at ZOOM_START_VELOCITY) → 1 (at velocity 0)
    const progress = 1 - (velocity / ZOOM_START_VELOCITY);

    // Apply ease-in-out for smooth zoom curve
    const easedProgress = easeInOutCubic(progress);

    // Interpolate between default and win zoom
    targetZoom = lerp(ZOOM_DEFAULT, ZOOM_WIN, easedProgress);
  }

  // Update target zoom
  cameraState.targetZoom = targetZoom;

  // Smoothly transition current zoom towards target
  const zoomDelta = targetZoom - cameraState.zoom;

  // Use lerp threshold to snap to target when close enough
  if (Math.abs(zoomDelta) < ZOOM_LERP_THRESHOLD) {
    cameraState.zoom = targetZoom;
  } else {
    cameraState.zoom = lerp(
      cameraState.zoom,
      targetZoom,
      ZOOM_TRANSITION_SPEED
    );
  }
}

/**
 * Trigger camera shake effect
 * Call this when winner is determined
 *
 * @param intensity - Shake intensity in pixels (default: CAMERA_SHAKE_INTENSITY)
 * @param duration - Shake duration in milliseconds (default: CAMERA_SHAKE_DURATION)
 */
export function triggerCameraShake(
  intensity: number = CAMERA_SHAKE_INTENSITY,
  duration: number = CAMERA_SHAKE_DURATION
): void {
  shakeState = {
    startTime: performance.now(),
    duration,
    intensity
  };
}

/**
 * Apply camera shake effect
 * Updates shake offset based on elapsed time
 *
 * Shake algorithm:
 * - Uses sin/cos waves with different frequencies for natural movement
 * - Exponential decay over time (starts strong, fades smoothly)
 * - Clears shake state when complete
 *
 * @param cameraState - Current camera state (mutated)
 * @param timestamp - Current timestamp from performance.now()
 */
export function applyCameraShake(
  cameraState: CameraState,
  timestamp: number
): void {
  if (!shakeState) {
    // No active shake: Reset offset to zero
    cameraState.shakeOffset.x = 0;
    cameraState.shakeOffset.y = 0;
    return;
  }

  // Calculate elapsed time since shake start
  const elapsed = timestamp - shakeState.startTime;

  // Check if shake is complete
  if (elapsed >= shakeState.duration) {
    // Clear shake state and reset offset
    shakeState = null;
    cameraState.shakeOffset.x = 0;
    cameraState.shakeOffset.y = 0;
    return;
  }

  // Calculate progress (0 → 1)
  const progress = elapsed / shakeState.duration;

  // Exponential decay: intensity fades over time
  // (1 - progress)^2 creates smooth fade-out
  const decay = Math.pow(1 - progress, 2);

  // Current shake intensity with decay
  const currentIntensity = shakeState.intensity * decay;

  // Generate shake offset using sin/cos waves
  // Different frequencies (1.0x and 1.5x) create more natural shake
  const frequency = CAMERA_SHAKE_FREQUENCY;
  const time = elapsed / 1000; // Convert to seconds

  cameraState.shakeOffset.x =
    Math.sin(time * frequency * Math.PI * 2) * currentIntensity;

  cameraState.shakeOffset.y =
    Math.cos(time * frequency * 1.5 * Math.PI * 2) * currentIntensity;
}

/**
 * Reset camera shake state
 * Useful for testing or manual reset
 */
export function resetCameraShake(): void {
  shakeState = null;
}
