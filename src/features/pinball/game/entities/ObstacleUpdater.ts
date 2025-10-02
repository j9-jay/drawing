/**
 * Obstacle update logic
 * Handles bubble pop animations, rotating bar updates, and bounce circle animations
 */

import { World } from 'planck';
import { Bubble, RotatingBar, BounceCircle } from '../../../shared/types/gameObjects';
import {
  BUBBLE_POP_INCREMENT,
  BUBBLE_POP_COMPLETION,
  BOUNCE_CIRCLE_ANIMATION_INCREMENT,
  BOUNCE_CIRCLE_ANIMATION_COMPLETION,
  ROTATING_BAR_DEFAULT_SPEED,
  ROTATING_BAR_BASE_TIMESTEP
} from '../constants/physics';

/**
 * Update bubbles array - removes popped bubbles after animation
 * @param bubbles - Current bubbles array
 * @param world - Physics world
 * @returns Bubbles to remove (IDs)
 */
export function updateBubbles(bubbles: Bubble[], world: World): string[] {
  const toRemove: string[] = [];

  bubbles.forEach(bubble => {
    if (bubble.popped) {
      bubble.popAnimation = (bubble.popAnimation || 0) + BUBBLE_POP_INCREMENT;
      if (bubble.popAnimation >= BUBBLE_POP_COMPLETION) {
        // Remove from physics world
        if (bubble.body) {
          world.destroyBody(bubble.body);
        }
        toRemove.push(bubble.id);
      }
    }
  });

  return toRemove;
}

/**
 * Update rotating bars angle
 * @param rotatingBars - Current rotating bars array
 * @param timeScale - Time scale for slow motion
 */
export function updateRotatingBars(rotatingBars: RotatingBar[], timeScale: number): void {
  // Update angle for rotating bars - runs regardless of game state, but affected by timeScale
  rotatingBars.forEach(bar => {
    const angularSpeed = bar.angularSpeed || ROTATING_BAR_DEFAULT_SPEED;
    bar.angle = (bar.angle || 0) + angularSpeed * ROTATING_BAR_BASE_TIMESTEP * timeScale; // Apply timeScale for slow motion
    if (bar.body) {
      bar.body.setAngle(bar.angle);
    }
  });
}

/**
 * Update bounce circles animation
 * @param bounceCircles - Current bounce circles array
 */
export function updateBounceCircles(bounceCircles: BounceCircle[]): void {
  bounceCircles.forEach(circle => {
    if (circle.bounceAnimation !== undefined) {
      circle.bounceAnimation += BOUNCE_CIRCLE_ANIMATION_INCREMENT;
      if (circle.bounceAnimation >= BOUNCE_CIRCLE_ANIMATION_COMPLETION) {
        circle.bounceAnimation = undefined;
      }
    }
  });
}
