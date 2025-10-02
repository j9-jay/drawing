/**
 * Camera related defaults and smoothing parameters.
 */

export const DEFAULT_CAMERA_ZOOM = 1.2;
export const CAMERA_LERP_RUNNING = 0.04;
export const CAMERA_LERP_IDLE = 0.02;
export const CAMERA_ZOOM_SPEED = 0.1;
export const CAMERA_ZOOM_MIN = 0.5;
export const CAMERA_ZOOM_MAX = 3;
export const CAMERA_VIEWPORT_CENTER_RATIO = 0.5;
export const LEADING_MARBLE_VERTICAL_OFFSET_RATIO = 0.35;
export const LEADING_MARBLE_PREDICTIVE_MULTIPLIER = 0.05;
export const MAP_DEFAULT_VERTICAL_FRACTION = 0.25;
export const ZOOM_ALIGNMENT_EPSILON = 0.001;
export const TIME_SCALE_SMOOTHING = 0.05;  // Slower time scale transition
export const TARGET_ZOOM_SMOOTHING = 0.04;  // Much slower zoom transition for less dizziness
