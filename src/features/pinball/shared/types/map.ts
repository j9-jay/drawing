// Legacy format support
export interface JsonWallConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number; // degrees, optional for diagonal walls
}

export interface JsonObstacleConfig {
  type: 'bubble' | 'rotatingBar';
  x: number;
  y: number;
  size: number; // radius for bubble, length for rotating bar
  rotationSpeed?: number; // only for rotating bars
  restitution?: number; // bounce factor (default varies by type)
}

export interface LegacyJsonMapConfig {
  id: string;
  name: string;
  description: string;
  mapDimensions: {
    widthMultiplier: number; // multiplier for canvas width (e.g., 0.7 for 70% width)
    heightMultiplier: number; // multiplier for canvas height (e.g., 4 for 4x height)
  };
  finishLine: {
    yMultiplier: number; // multiplier for canvas height to set finish line position
  };
  walls: JsonWallConfig[];
  obstacles: JsonObstacleConfig[];
}

// New planck.js format support
export interface Material {
  restitution: number;
  friction: number;
}

export interface Checkpoint {
  id: string;
  center: [number, number];
  radius: number;
}

export interface Area {
  center: [number, number];
  radius: number;
}

export interface Wall {
  vertices: [number, number][];
  material: Material;
}

export interface Edge {
  vertices: [number, number][];
  material: Material;
}

export interface Polygon {
  vertices: [number, number][];
  material: Material;
}

export interface NewJsonMapConfig {
  name: string;
  unitScale: number;
  parTimeSec: number;
  checkpoints?: Checkpoint[];
  startArea: Area;
  finishArea: Area;
  walls?: Wall[];
  edges?: Edge[];
  polygons?: Polygon[];
}

// MapSpec format support
export interface MapSpecConfig {
  size: { w: number; h: number };
  spawn: { pos: [number, number]; radius: number };
  edges: [number, number][][];
  polygons: { verts: [number, number][] }[];
  circles: { c: [number, number]; r: number; bouncy?: number }[];
  sensors: {
    shape: { type: 'segment'|'poly'|'circle', data: any };
    effect: 'accelerate'|'decelerate'|'oneway'|'teleport'|'finish';
    params?: any;
  }[];
  rotatingBars?: {
    pivot: [number, number];
    length: number;
    thickness: number;
    angularSpeed: number;
  }[];
  decor?: any;
}

// Union type for all formats
export type JsonMapConfig = LegacyJsonMapConfig | NewJsonMapConfig | MapSpecConfig;

export interface JsonMapData {
  version: string;
  maps: JsonMapConfig[];
}

// Type guards
export function isLegacyFormat(config: JsonMapConfig): config is LegacyJsonMapConfig {
  return 'id' in config && 'mapDimensions' in config;
}

export function isNewFormat(config: JsonMapConfig): config is NewJsonMapConfig {
  return 'unitScale' in config && 'startArea' in config;
}

export function isMapSpecFormat(config: JsonMapConfig): config is MapSpecConfig {
  return 'size' in config && 'spawn' in config && 'edges' in config;
}