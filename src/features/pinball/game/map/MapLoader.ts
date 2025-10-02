/**
 * Map loading and setup utilities
 * Handles loading maps from editor JSON and creating physics objects
 */

import { World, Vec2, Body, Edge, Circle, Box } from 'planck';
import { GameWorld, Wall, Bubble, RotatingBar, BounceCircle, JumpPad, FinishLine, ObjectType } from '../../../shared/types';
import { EditorMapJson } from '../../../shared/types/editorMap';
import {
  ROTATING_BAR_FRICTION,
  ROTATING_BAR_RESTITUTION,
  WALL_FRICTION,
  WALL_RESTITUTION,
  BUBBLE_FRICTION,
  BUBBLE_DEFAULT_RESTITUTION,
  BOUNCE_CIRCLE_FRICTION,
  DEFAULT_BOUNCE_CIRCLE_RESTITUTION,
  JUMPPAD_FRICTION,
  DEFAULT_JUMPPAD_RESTITUTION,
  ROTATING_BAR_DEFAULT_SPEED,
  DEFAULT_MAP_WIDTH,
  DEFAULT_MAP_HEIGHT
} from '../constants/physics';
import {
  DEFAULT_SPAWN_HEIGHT,
  DEFAULT_FINISH_LINE_OFFSET,
  FINISH_LINE_BUFFER
} from '../constants/map';

/**
 * Create default map when no map is available
 */
export function createDefaultMap(): EditorMapJson {
  return {
    meta: {
      name: 'default',
      version: 1 as any,
      canvasSize: { width: DEFAULT_MAP_WIDTH, height: DEFAULT_MAP_HEIGHT },
      gridSize: 20,
      spawnPoint: { x: 200, y: DEFAULT_SPAWN_HEIGHT }
    },
    objects: [
      // Borders
      {
        id: 'left-wall',
        type: 'edge',
        vertices: [
          { x: 0, y: 0 },
          { x: 0, y: DEFAULT_MAP_HEIGHT }
        ],
        material: 'normal' as any,
        thickness: 10
      } as any,
      {
        id: 'right-wall',
        type: 'edge',
        vertices: [
          { x: DEFAULT_MAP_WIDTH, y: 0 },
          { x: DEFAULT_MAP_WIDTH, y: DEFAULT_MAP_HEIGHT }
        ],
        material: 'normal' as any,
        thickness: 10
      } as any,
      // Default finish line
      {
        id: 'finish',
        type: 'finishLine',
        a: { x: 0, y: 700 },
        b: { x: DEFAULT_MAP_WIDTH, y: 700 },
        thickness: 5
      }
    ]
  };
}

/**
 * Calculate auto finish line position based on map objects
 */
export function calculateAutoFinishLine(editorMap: EditorMapJson): number {
  let lowestY = 0;

  editorMap.objects.forEach(obj => {
    if (obj.type === 'edge') {
      // Handle both vertices array and a/b format
      if (obj.vertices && obj.vertices.length > 0) {
        obj.vertices.forEach((v: any) => {
          lowestY = Math.max(lowestY, v.y);
        });
      } else if ((obj as any).a && (obj as any).b) {
        lowestY = Math.max(lowestY, Math.max((obj as any).a.y, (obj as any).b.y));
      }
    } else if (obj.type === 'bubble') {
      lowestY = Math.max(lowestY, obj.center.y + obj.radius);
    } else if (obj.type === 'rotatingBar') {
      lowestY = Math.max(lowestY, obj.pivot.y + (obj.length || 100) / 2);
    }
  });

  // Add some buffer below the lowest object
  return lowestY + DEFAULT_FINISH_LINE_OFFSET;
}

/**
 * Ensure map has a finish line
 */
export function ensureFinishLine(editorMap: EditorMapJson): void {
  const hasFinishLine = editorMap.objects.some(obj => obj.type === 'finishLine');

  if (!hasFinishLine) {
    const finishY = calculateAutoFinishLine(editorMap);
    editorMap.objects.push({
      id: 'auto-finish',
      type: 'finishLine',
      a: { x: 0, y: finishY },
      b: { x: editorMap.meta.canvasSize.width, y: finishY },
      thickness: 5
    });
  }
}

/**
 * Create edge wall from editor object
 */
export function createEdgeFromEditor(
  world: World,
  gameWorld: GameWorld,
  edgeObj: any,
  scale: number
): Wall | null {
  // Handle vertices array for edge walls
  if (edgeObj.vertices && edgeObj.vertices.length >= 2) {
    // Create multiple edge fixtures for polyline walls
    const body = world.createBody({
      type: 'static'
    });

    for (let i = 0; i < edgeObj.vertices.length - 1; i++) {
      const v1 = edgeObj.vertices[i];
      const v2 = edgeObj.vertices[i + 1];

      body.createFixture(Edge(
        Vec2(v1.x / scale, v1.y / scale),
        Vec2(v2.x / scale, v2.y / scale)
      ), {
        friction: WALL_FRICTION,
        restitution: WALL_RESTITUTION
      });
    }

    const wall: Wall = {
      id: gameWorld.generateId(),
      type: ObjectType.WALL,
      body,
      position: {
        x: edgeObj.vertices[0].x,
        y: edgeObj.vertices[0].y
      },
      vertices: edgeObj.vertices
    };

    gameWorld.addEntity(wall);
    return wall;
  }

  // Legacy support for a/b format
  if (!edgeObj.a || !edgeObj.b) return null;

  const body = world.createBody({
    type: 'static'
  });

  body.createFixture(Edge(
    Vec2(edgeObj.a.x / scale, edgeObj.a.y / scale),
    Vec2(edgeObj.b.x / scale, edgeObj.b.y / scale)
  ), {
    friction: WALL_FRICTION,
    restitution: WALL_RESTITUTION
  });

  const wall: Wall = {
    id: gameWorld.generateId(),
    type: ObjectType.WALL,
    body,
    position: {
      x: (edgeObj.a.x + edgeObj.b.x) / 2,
      y: (edgeObj.a.y + edgeObj.b.y) / 2
    },
    vertices: [edgeObj.a, edgeObj.b]
  };

  gameWorld.addEntity(wall);
  return wall;
}

/**
 * Create bubble obstacle from editor object
 */
export function createBubbleFromEditor(
  world: World,
  gameWorld: GameWorld,
  bubbleObj: any,
  scale: number
): Bubble {
  const body = world.createBody({
    type: 'static',
    position: Vec2(bubbleObj.center.x / scale, bubbleObj.center.y / scale)
  });

  const bubble: Bubble = {
    id: gameWorld.generateId(),
    type: ObjectType.BUBBLE,
    body,
    position: { x: bubbleObj.center.x, y: bubbleObj.center.y },
    radius: bubbleObj.radius,
    restitution: bubbleObj.restitution || BUBBLE_DEFAULT_RESTITUTION,
    popped: false
  };

  const userData = {
    type: 'bubble',
    entity: bubble
  };

  body.createFixture(Circle(bubbleObj.radius / scale), {
    friction: BUBBLE_FRICTION,
    restitution: bubbleObj.restitution || BUBBLE_DEFAULT_RESTITUTION,
    userData
  });

  gameWorld.addEntity(bubble);
  return bubble;
}

/**
 * Create rotating bar obstacle from editor object
 */
export function createRotatingBarFromEditor(
  world: World,
  gameWorld: GameWorld,
  barObj: any,
  scale: number
): RotatingBar {
  const body = world.createBody({
    type: 'kinematic',
    position: Vec2(barObj.pivot.x / scale, barObj.pivot.y / scale)
  });

  const halfLength = (barObj.length || 100) / 2 / scale;
  const halfThickness = (barObj.thickness || 5) / 2 / scale;

  body.createFixture(Box(halfLength, halfThickness), {
    friction: ROTATING_BAR_FRICTION,
    restitution: ROTATING_BAR_RESTITUTION
  });

  const rotatingBar: RotatingBar = {
    id: gameWorld.generateId(),
    type: ObjectType.ROTATING_BAR,
    body,
    position: { x: barObj.pivot.x, y: barObj.pivot.y },
    length: barObj.length || 100,
    thickness: barObj.thickness || 10,
    angle: 0,
    angularSpeed: barObj.angularSpeed || ROTATING_BAR_DEFAULT_SPEED
  };

  gameWorld.addEntity(rotatingBar);
  return rotatingBar;
}

/**
 * Create bounce circle from editor object
 */
export function createBounceCircleFromEditor(
  world: World,
  gameWorld: GameWorld,
  bounceCircleObj: any,
  scale: number
): BounceCircle {
  const body = world.createBody({
    type: 'static',
    position: Vec2(bounceCircleObj.position.x / scale, bounceCircleObj.position.y / scale)
  });

  const bounceMultiplier = bounceCircleObj.bounceMultiplier || DEFAULT_BOUNCE_CIRCLE_RESTITUTION;

  const bounceCircle: BounceCircle = {
    id: gameWorld.generateId(),
    type: ObjectType.BOUNCE_CIRCLE,
    body,
    position: { x: bounceCircleObj.position.x, y: bounceCircleObj.position.y },
    radius: bounceCircleObj.radius,
    bounceMultiplier
  };

  const userData = {
    type: 'bounceCircle',
    bounceMultiplier,
    entity: bounceCircle
  };

  const radius = bounceCircleObj.radius / scale;
  body.createFixture(Circle(radius), {
    friction: BOUNCE_CIRCLE_FRICTION,
    restitution: bounceMultiplier,
    userData
  });

  gameWorld.addEntity(bounceCircle);
  return bounceCircle;
}

/**
 * Create jump pad from editor object
 */
export function createJumppadFromEditor(
  world: World,
  gameWorld: GameWorld,
  jumppadObj: any,
  scale: number
): JumpPad {
  const body = world.createBody({
    type: 'static',
    position: Vec2(jumppadObj.position.x / scale, jumppadObj.position.y / scale)
  });

  const bounceMultiplier = jumppadObj.bounceMultiplier || DEFAULT_JUMPPAD_RESTITUTION;
  const userData = {
    type: 'jumppad',
    bounceMultiplier
  };

  const halfWidth = jumppadObj.shape.width / 2 / scale;
  const halfHeight = jumppadObj.shape.height / 2 / scale;
  body.createFixture(Box(halfWidth, halfHeight), {
    friction: JUMPPAD_FRICTION,
    restitution: bounceMultiplier,
    userData
  });

  const jumpPad: JumpPad = {
    id: gameWorld.generateId(),
    type: ObjectType.JUMP_PAD,
    body,
    position: { x: jumppadObj.position.x, y: jumppadObj.position.y },
    width: jumppadObj.shape.width,
    height: jumppadObj.shape.height,
    bounceMultiplier
  };

  gameWorld.addEntity(jumpPad);
  return jumpPad;
}

/**
 * Create finish line sensor from editor object
 */
export function createFinishLineFromEditor(
  world: World,
  gameWorld: GameWorld,
  finishObj: any,
  scale: number
): FinishLine {
  const body = world.createBody({
    type: 'static'
  });

  body.createFixture(Edge(
    Vec2(finishObj.a.x / scale, finishObj.a.y / scale),
    Vec2(finishObj.b.x / scale, finishObj.b.y / scale)
  ), {
    isSensor: true,
    userData: { type: 'finishLine' }
  });

  const finishLine: FinishLine = {
    id: gameWorld.generateId(),
    type: ObjectType.FINISH_LINE,
    body,
    position: {
      x: (finishObj.a.x + finishObj.b.x) / 2,
      y: finishObj.a.y
    },
    startPoint: finishObj.a,
    endPoint: finishObj.b,
    y: finishObj.a.y
  };

  gameWorld.addEntity(finishLine);
  return finishLine;
}