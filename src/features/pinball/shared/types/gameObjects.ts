import { Body } from 'planck';

// Base game object interface
export interface GameObject {
  id: string;
  type: ObjectType;
  body?: Body;
  position: { x: number; y: number };
}

// All object types
export enum ObjectType {
  WALL = 'wall',
  BUBBLE = 'bubble',
  ROTATING_BAR = 'rotatingBar',
  BOUNCE_CIRCLE = 'bounceCircle',
  JUMP_PAD = 'jumppad',
  FINISH_LINE = 'finishLine'
}

// Wall (static barrier)
export interface Wall extends GameObject {
  type: ObjectType.WALL;
  vertices?: { x: number; y: number }[];
}

// Bubble (poppable obstacle)
export interface Bubble extends GameObject {
  type: ObjectType.BUBBLE;
  radius: number;
  restitution: number;
  popped: boolean;
  popAnimation?: number;
}

// Rotating bar
export interface RotatingBar extends GameObject {
  type: ObjectType.ROTATING_BAR;
  length: number;
  thickness: number;
  angle: number;
  angularSpeed: number;
}

// Bounce circle (circular bounce pad)
export interface BounceCircle extends GameObject {
  type: ObjectType.BOUNCE_CIRCLE;
  radius: number;
  bounceMultiplier: number;
  bounceAnimation?: number;
}

// Jump pad (rectangular bounce pad)
export interface JumpPad extends GameObject {
  type: ObjectType.JUMP_PAD;
  width: number;
  height: number;
  bounceMultiplier: number;
}

// Finish line
export interface FinishLine extends GameObject {
  type: ObjectType.FINISH_LINE;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  y: number;
}

// Union type for all game entities
export type GameEntity = Wall | Bubble | RotatingBar | BounceCircle | JumpPad | FinishLine;

// Game world manager
export class GameWorld {
  private entities: Map<string, GameEntity> = new Map();
  private nextId: number = 0;

  generateId(): string {
    return `entity_${this.nextId++}`;
  }

  addEntity(entity: GameEntity): void {
    if (!entity.id) {
      entity.id = this.generateId();
    }
    this.entities.set(entity.id, entity);
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity?.body) {
      // Physics body cleanup handled externally
    }
    this.entities.delete(id);
  }

  getEntity(id: string): GameEntity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): GameEntity[] {
    return Array.from(this.entities.values());
  }

  getByType<T extends GameEntity>(type: ObjectType): T[] {
    return Array.from(this.entities.values())
      .filter(entity => entity.type === type) as T[];
  }

  // Specific type getters
  getWalls(): Wall[] {
    return this.getByType<Wall>(ObjectType.WALL);
  }

  getBubbles(): Bubble[] {
    return this.getByType<Bubble>(ObjectType.BUBBLE);
  }

  getRotatingBars(): RotatingBar[] {
    return this.getByType<RotatingBar>(ObjectType.ROTATING_BAR);
  }

  getBounceCircles(): BounceCircle[] {
    return this.getByType<BounceCircle>(ObjectType.BOUNCE_CIRCLE);
  }

  getJumpPads(): JumpPad[] {
    return this.getByType<JumpPad>(ObjectType.JUMP_PAD);
  }

  getFinishLines(): FinishLine[] {
    return this.getByType<FinishLine>(ObjectType.FINISH_LINE);
  }

  // Get interactive obstacles
  getInteractiveObstacles(): (Bubble | RotatingBar | BounceCircle | JumpPad)[] {
    return [
      ...this.getBubbles(),
      ...this.getRotatingBars(),
      ...this.getBounceCircles(),
      ...this.getJumpPads()
    ];
  }

  clear(): void {
    this.entities.clear();
    this.nextId = 0;
  }

  // Check if position hits finish line
  checkFinishLine(y: number): boolean {
    const finishLines = this.getFinishLines();
    return finishLines.some(line => y >= line.y);
  }
}