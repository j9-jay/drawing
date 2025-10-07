// Integration layer between editor and existing game
import { EditorMapJson } from '../../shared/types/editorMap';
import { MapSpecConfig } from '../../maps/JsonMapTypes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class GameIntegration {
  /**
   * Convert editor map to game-compatible MapSpec format
   */
  static convertToMapSpec(editorMap: EditorMapJson): MapSpecConfig {
    const scale = 30; // Scale factor from editor pixels to game units - matching main game rendering
    
    // Convert editor coordinates to game coordinates
    // Keep coordinates relative to top-left origin for simplicity
    const gameWidth = editorMap.meta.canvasSize.width / scale;
    const gameHeight = editorMap.meta.canvasSize.height / scale;
    
    // Convert spawn point directly without coordinate system change
    const gameSpawn = editorMap.meta.spawnPoint ? 
      [editorMap.meta.spawnPoint.x / scale, editorMap.meta.spawnPoint.y / scale] : 
      [gameWidth / 2, 10]; // Default spawn at top center
      
    
    const mapSpec: MapSpecConfig = {
      size: { 
        w: gameWidth, 
        h: gameHeight 
      },
      spawn: { 
        pos: gameSpawn as [number, number],
        radius: 0.5 
      },
      edges: [],
      polygons: [],
      circles: [],
      sensors: []
    };
    
    editorMap.objects.forEach(obj => {
      switch (obj.type) {
        case 'edge':
          // Convert edge vertices to game coordinates
          const vertices: [number, number][] = obj.vertices.map(v => 
            [v.x / scale, v.y / scale] as [number, number]
          );
          
          // Create edge segments between consecutive vertices
          for (let i = 0; i < vertices.length - 1; i++) {
            mapSpec.edges.push([vertices[i], vertices[i + 1]]);
          }
          break;
          
        case 'bubble':
          mapSpec.circles.push({
            c: [obj.center.x / scale, obj.center.y / scale] as [number, number],
            r: obj.radius / scale,
            bouncy: obj.restitution || 1.4
          });
          break;
          
        case 'rotatingBar':
          // Add rotating bar as a special type that will be handled in the game
          // Store as metadata in a comment that the game can parse
          const barHalfLength = obj.length / 2 / scale;
          const barHalfThickness = obj.thickness / 2 / scale;
          const centerX = obj.pivot.x / scale;
          const centerY = obj.pivot.y / scale;
          
          // Add rotating bar metadata
          if (!mapSpec.rotatingBars) {
            mapSpec.rotatingBars = [];
          }
          mapSpec.rotatingBars.push({
            pivot: [centerX, centerY] as [number, number],
            length: obj.length / scale,
            thickness: obj.thickness / scale,
            angularSpeed: obj.angularSpeed || 2.0
          });
          break;
          
        case 'jumppad':
          // Convert rectangle jump pads to accelerate sensors
          const forceMultiplier = (obj.bounceMultiplier || 1.6) * 10;
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
            params: { force: [0, -forceMultiplier] }
          });
          break;

        case 'bounceCircle':
          // Convert bounce circles to bouncy circles
          mapSpec.circles.push({
            c: [obj.position.x / scale, obj.position.y / scale] as [number, number],
            r: obj.radius / scale,
            bouncy: obj.bounceMultiplier || 1.6
          });
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
      }
    });
    
    return mapSpec;
  }
  
  /**
   * Preview conversion without saving
   */
  static previewConversion(editorMap: EditorMapJson): string {
    const mapSpec = this.convertToMapSpec(editorMap);
    return JSON.stringify(mapSpec, null, 2);
  }
  
  /**
   * Validate that editor map can be converted properly
   */
  static validateForGameConversion(editorMap: EditorMapJson): string[] {
    const errors: string[] = [];
    
    // Check for required finish line
    const hasFinishLine = editorMap.objects.some(obj => obj.type === 'finishLine');
    if (!hasFinishLine) {
      errors.push('Map must have at least one finish line');
    }
    
    // Check for reasonable map size
    if (editorMap.meta.canvasSize.width < 500 || editorMap.meta.canvasSize.height < 500) {
      errors.push('Map size should be at least 500x500 pixels for proper gameplay');
    }
    
    // Check for walls/boundaries
    const hasWalls = editorMap.objects.some(obj => obj.type === 'edge');
    if (!hasWalls) {
      errors.push('Map should have walls to contain the marbles');
    }
    
    // Validate individual objects
    editorMap.objects.forEach((obj, index) => {
      switch (obj.type) {
        case 'edge':
          if (obj.vertices.length < 2) {
            errors.push(`Edge ${index + 1}: Must have at least 2 vertices`);
          }
          break;
        case 'jumppad':
          if (!obj.shape.width || !obj.shape.height) {
            errors.push(`Jump pad ${index + 1}: Rectangle shape must have width and height`);
          }
          break;
        case 'bounceCircle':
          if (!obj.radius) {
            errors.push(`Bounce circle ${index + 1}: Must have radius`);
          }
          break;
      }
    });
    
    return errors;
  }
}