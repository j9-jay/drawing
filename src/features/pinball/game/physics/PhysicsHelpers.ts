/**
 * Physics helper utilities
 * Functions for physics calculations and collision detection
 */

import { Vec2, Body } from 'planck';
import { Marble } from '../../../shared/types';
import { PIXELS_PER_METER, SENSOR_TRIGGER_DISTANCE, MAX_VELOCITY, MAX_VELOCITY_X, MAX_VELOCITY_Y } from '../constants/physics';

// eslint-disable-next-line no-unused-vars
type SensorCheckFn = (marble: Marble, sensor: any) => boolean;

/**
 * Update sensor effects (e.g., jump pads)
 */
export function updateSensors(
  sensors: any[],
  marbles: Marble[],
  isMarbleInSensor: SensorCheckFn
): void {
  // Jump pad and other sensor collision detection
  sensors.forEach(sensor => {
    if (sensor.type === 'jumppad') {
      marbles.forEach(marble => {
        if (marble.body && isMarbleInSensor(marble, sensor)) {
          // Apply jump pad effect
          const force = sensor.params.force;
          marble.body.applyForceToCenter(Vec2(force[0], force[1]));
        }
      });
    }
  });
}

/**
 * Check if a marble is within a sensor's range
 */
export function isMarbleInSensor(marble: Marble, sensor: any): boolean {
  if (!marble.body) return false;

  const marblePos = marble.body.getPosition();
  const sensorPos = sensor.body.getPosition();

  // Calculate distance between sensor and marble
  const dx = marblePos.x - sensorPos.x;
  const dy = marblePos.y - sensorPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Simple distance-based collision detection
  // (In practice, Planck.js collision detection would be more accurate)
  return distance < SENSOR_TRIGGER_DISTANCE; // Within sensor trigger radius
}

/**
 * Update marble positions from physics bodies
 */
export function updateMarblePositions(marbles: Marble[]): void {
  marbles.forEach(marble => {
    if (marble.body) {
      // Apply velocity limits
      const velocity = marble.body.getLinearVelocity();
      let vx = velocity.x;
      let vy = velocity.y;

      // Limit individual axis velocities
      vx = Math.max(-MAX_VELOCITY_X, Math.min(MAX_VELOCITY_X, vx));
      vy = Math.max(-MAX_VELOCITY_Y, Math.min(MAX_VELOCITY_Y, vy));

      // Limit total velocity magnitude
      const currentSpeed = Math.sqrt(vx * vx + vy * vy);
      if (currentSpeed > MAX_VELOCITY) {
        const scale = MAX_VELOCITY / currentSpeed;
        vx *= scale;
        vy *= scale;
      }

      // Apply the limited velocity back to the body
      if (vx !== velocity.x || vy !== velocity.y) {
        marble.body.setLinearVelocity(Vec2(vx, vy));
      }

      // Update position
      const pos = marble.body.getPosition();
      marble.position.x = pos.x * PIXELS_PER_METER;
      marble.position.y = pos.y * PIXELS_PER_METER;
    }
  });

  // Sort unfinished marbles by Y coordinate (lower is ahead)
  // Sort finished marbles by finish time
  marbles.sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.finishTime || 0) - (b.finishTime || 0);
    } else if (a.finished) {
      return -1; // Finished marbles first
    } else if (b.finished) {
      return 1;
    } else {
      return b.position.y - a.position.y; // Racing marbles by position
    }
  });
}

/**
 * Check finish line and mark finished marbles
 */
export function checkFinishLine(
  marbles: Marble[],
  finishLine: number,
  gameStartTime: number,
  world: any
): Marble[] {
  if (!finishLine) return [];

  const newlyFinished: Marble[] = [];
  marbles.forEach(marble => {
    if (!marble.finished && marble.position.y >= finishLine) {
      marble.finished = true;
      marble.finishTime = Date.now() - gameStartTime;
      newlyFinished.push(marble);
    }
  });

  // Remove finished marbles from physics world
  newlyFinished.forEach(marble => {
    if (marble.body) {
      world.destroyBody(marble.body);
      marble.body = undefined;
    }
  });

  return newlyFinished;
}

/**
 * Clear physics bodies from world
 */
export function clearBodies(bodies: Array<{ body: Body }>, world: any): void {
  bodies.forEach(item => {
    if (item.body) {
      world.destroyBody(item.body);
    }
  });
}

/**
 * Clear sensor bodies from world
 */
export function clearSensors(sensors: any[], world: any): void {
  sensors.forEach(sensor => {
    if (sensor.body) {
      world.destroyBody(sensor.body);
    }
  });
}

/**
 * Clear marble bodies from world
 */
export function clearMarbles(marbles: Marble[], world: any): void {
  marbles.forEach(marble => {
    if (marble.body) {
      world.destroyBody(marble.body);
    }
  });
}
