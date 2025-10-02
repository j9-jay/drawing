// Editor-specific map schema - separate from game's map formats
export type Vec2 = { x: number; y: number };

export type EditorEdge = {
  id: string;
  type: 'edge';
  vertices: Vec2[];
  material?: {
    restitution?: number;   // 반발계수 (기본 0.2)
    friction?: number;      // 마찰 (기본 0.5)
  };
};

export type EditorBubble = {
  id: string;
  type: 'bubble';
  center: Vec2;
  radius: number;           // 픽셀 단위(에디터 좌표계)
  restitution?: number;     // 기본 1.2~1.5 범위 추천
};

export type RotatingBarSpeedLevel = 'slow' | 'medium' | 'fast';

export type EditorRotatingBar = {
  id: string;
  type: 'rotatingBar';
  pivot: Vec2;              // 회전 중심
  length: number;           // 막대 길이
  thickness: number;        // 막대 두께
  angularSpeed: number;     // 라디안/초 (+: 시계, -: 반시계)
  speedLevel?: RotatingBarSpeedLevel; // 편집기 3단계 토글 상태
};

export type EditorBounceCircle = {
  id: string;
  type: 'bounceCircle';
  position: Vec2;
  radius: number;
  bounceMultiplier?: number;
};

export type EditorJumpPad = {
  id: string;
  type: 'jumppad';
  position: Vec2;
  shape: {
    kind: 'rect';
    width: number;
    height: number;
  };
  bounceMultiplier?: number;
};

export type EditorFinishLine = {
  id: string;
  type: 'finishLine';
  a: Vec2;                  // 선분 시작점
  b: Vec2;                  // 선분 끝점
  thickness?: number;       // 표시용 두께
};

export type EditorMapObject = EditorEdge | EditorBubble | EditorRotatingBar | EditorBounceCircle | EditorJumpPad | EditorFinishLine;

// Type aliases for compatibility
export type Edge = EditorEdge;
export type Bubble = EditorBubble;
export type RotatingBar = EditorRotatingBar;
export type BounceCircle = EditorBounceCircle;
export type JumpPad = EditorJumpPad;
export type FinishLine = EditorFinishLine;

export type EditorMapMeta = {
  name: string;             // 맵 이름
  version: 1;
  canvasSize: { width: number; height: number }; // 에디터 기준 크기
  gridSize: number;         // 격자 간격(예: 20)
  spawnPoint?: Vec2;        // 구슬 시작 지점 (기본값은 자동 계산)
};

export type EditorMapJson = {
  meta: EditorMapMeta;
  objects: EditorMapObject[];
};

// Default values
export const DEFAULT_EDITOR_MAP_META: EditorMapMeta = {
  name: 'Untitled Map',
  version: 1,
  canvasSize: { width: 1500, height: 10000 }, // 가로 1500, 세로 10000
  gridSize: 30, // 게임 렌더링 스케일과 맞춤
  spawnPoint: { x: 750, y: 300 } // 맵 중앙에 맞춤 (1500/2 = 750)
};

export const DEFAULT_MATERIAL = {
  restitution: 0,
  friction: 0.5
};

export const DEFAULT_BUBBLE_RESTITUTION = 1.4;
export const DEFAULT_BOUNCE_MULTIPLIER = 1.6;
export const DEFAULT_THICKNESS = 30; // 30의 배수로 조정
export const DEFAULT_FINISH_THICKNESS = 6;

// Validation helpers
export function validateEditorMapObject(obj: EditorMapObject): string[] {
  const errors: string[] = [];
  
  switch (obj.type) {
    case 'edge':
      if (obj.vertices.length < 2) {
        errors.push('Edge must have at least 2 vertices');
      }
      break;
    case 'bubble':
      if (obj.radius <= 0) {
        errors.push('Bubble radius must be positive');
      }
      break;
    case 'rotatingBar':
      if (obj.length <= 0) {
        errors.push('Rotating bar length must be positive');
      }
      if (obj.thickness <= 0) {
        errors.push('Rotating bar thickness must be positive');
      }
      break;
    case 'bounceCircle':
      if (obj.radius <= 0) {
        errors.push('Bounce circle radius must be positive');
      }
      break;
    case 'jumppad':
      if (!obj.shape.width || !obj.shape.height || obj.shape.width <= 0 || obj.shape.height <= 0) {
        errors.push('Jump pad rectangle dimensions must be positive');
      }
      break;
    case 'finishLine':
      // Check if start and end points are too close (within 1 pixel)
      const dx = Math.abs(obj.a.x - obj.b.x);
      const dy = Math.abs(obj.a.y - obj.b.y);
      if (dx <= 1 && dy <= 1) {
        errors.push('Finish line must have different start and end points');
      }
      break;
  }
  
  return errors;
}

export function validateEditorMapJson(mapJson: EditorMapJson): string[] {
  const errors: string[] = [];
  
  if (!mapJson.meta.name.trim()) {
    errors.push('Map name is required');
  }
  
  if (mapJson.meta.canvasSize.width <= 0 || mapJson.meta.canvasSize.height <= 0) {
    errors.push('Canvas size must be positive');
  }
  
  if (mapJson.meta.gridSize <= 0) {
    errors.push('Grid size must be positive');
  }
  
  mapJson.objects.forEach((obj, index) => {
    const objErrors = validateEditorMapObject(obj);
    objErrors.forEach(err => errors.push(`Object ${index + 1}: ${err}`));
  });
  
  return errors;
}

// Conversion utilities for integrating with existing game formats
// TODO: Re-implement if needed for future modularization
/*
import { MapSpecConfig } from '../../client/game/services/JsonMapTypes';

export function convertEditorMapToMapSpec(editorMap: EditorMapJson): MapSpecConfig {
  const scale = 30; // Scale factor from editor pixels to game units - matching main game rendering
  const mapSpec: MapSpecConfig = {
    size: { 
      w: editorMap.meta.canvasSize.width / scale, 
      h: editorMap.meta.canvasSize.height / scale 
    },
    spawn: { pos: [18, 24], radius: 0.5 }, // Default spawn - could be configurable
    edges: [],
    polygons: [],
    circles: [],
    sensors: []
  };
  
  editorMap.objects.forEach(obj => {
    switch (obj.type) {
      case 'edge':
        // Convert vertices to game coordinates
        const vertices: [number, number][] = obj.vertices.map(v => 
          [v.x / scale, v.y / scale] as [number, number]
        );
        mapSpec.edges.push(vertices);
        break;
        
      case 'bubble':
        mapSpec.circles.push({
          c: [obj.center.x / scale, obj.center.y / scale] as [number, number],
          r: obj.radius / scale,
          bouncy: obj.restitution || 1.4
        });
        break;
        
      case 'jumppad':
        // Convert jump pads to accelerate sensors
        const forceMultiplier = (obj.bounceMultiplier || 1.6) * 10;
        if (obj.shape.kind === 'circle') {
          mapSpec.sensors.push({
            shape: {
              type: 'circle',
              data: {
                center: [obj.position.x / scale, obj.position.y / scale],
                radius: (obj.shape.radius || 50) / scale
              }
            },
            effect: 'accelerate',
            params: { force: [0, forceMultiplier] } // Upward boost
          });
        } else {
          // Convert rectangle to polygon sensor
          const hw = (obj.shape.width || 160) / 2 / scale;
          const hh = (obj.shape.height || 30) / 2 / scale;
          const cx = obj.position.x / scale;
          const cy = obj.position.y / scale;
          
          mapSpec.sensors.push({
            shape: {
              type: 'poly',
              data: [
                [cx - hw, cy - hh],
                [cx + hw, cy - hh],
                [cx + hw, cy + hh],
                [cx - hw, cy + hh]
              ]
            },
            effect: 'accelerate',
            params: { force: [0, forceMultiplier] }
          });
        }
        break;
        
      case 'finishLine':
        // Convert finish line to sensor
        mapSpec.sensors.push({
          shape: {
            type: 'segment',
            data: [
              [obj.a.x / scale, obj.a.y / scale] as [number, number],
              [obj.b.x / scale, obj.b.y / scale] as [number, number]
            ]
          },
          effect: 'finish'
        });
        break;
        
      case 'rotatingBar':
        // Note: Rotating bars need special handling in the game engine
        // For now, we'll create them as static polygons
        const barHalfLength = obj.length / 2 / scale;
        const barHalfThickness = obj.thickness / 2 / scale;
        const centerX = obj.pivot.x / scale;
        const centerY = obj.pivot.y / scale;
        
        mapSpec.polygons.push({
          verts: [
            [centerX - barHalfLength, centerY - barHalfThickness],
            [centerX + barHalfLength, centerY - barHalfThickness],
            [centerX + barHalfLength, centerY + barHalfThickness],
            [centerX - barHalfLength, centerY + barHalfThickness]
          ] as [number, number][]
        });
        break;
    }
  });
  
  return mapSpec;
}
*/
