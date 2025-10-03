import { Vec2, EditorMapObject } from '../../shared/types/editorMap';
import { Grid } from './Grid';

export type SnapResult = {
  point: Vec2;
  snapped: boolean;
  snapType: 'grid' | 'vertex' | 'none';
  snapTarget?: Vec2; // The original target point that was snapped to
};

export class Snap {
  static snapPoint(
    point: Vec2,
    options: {
      gridSize: number;
      gridSnap: boolean;
      vertexSnap: boolean;
      snapThreshold: number;
      objects: EditorMapObject[];
      excludeObjectId?: string;
      zoom: number;
    }
  ): SnapResult {
    const { gridSize, gridSnap, vertexSnap, snapThreshold, objects, excludeObjectId, zoom } = options;
    
    let result: SnapResult = {
      point: { ...point },
      snapped: false,
      snapType: 'none'
    };
    
    // Adjust snap threshold based on zoom level
    const adjustedThreshold = snapThreshold / zoom;
    
    // First try vertex snap (higher priority)
    if (vertexSnap) {
      const vertexSnapResult = this.snapToVertices(point, objects, adjustedThreshold, excludeObjectId);
      if (vertexSnapResult.snapped) {
        return vertexSnapResult;
      }
    }
    
    // Then try grid snap
    if (gridSnap) {
      const gridSnapResult = this.snapToGrid(point, gridSize, adjustedThreshold);
      if (gridSnapResult.snapped) {
        return gridSnapResult;
      }
    }
    
    return result;
  }
  
  private static snapToGrid(point: Vec2, gridSize: number, threshold: number): SnapResult {
    const snappedPoint = Grid.snapToGrid(point, gridSize);
    const distance = this.distance(point, snappedPoint);
    
    if (distance <= threshold) {
      return {
        point: snappedPoint,
        snapped: true,
        snapType: 'grid',
        snapTarget: snappedPoint
      };
    }
    
    return {
      point: { ...point },
      snapped: false,
      snapType: 'none'
    };
  }
  
  private static snapToVertices(
    point: Vec2,
    objects: EditorMapObject[],
    threshold: number,
    excludeObjectId?: string
  ): SnapResult {
    let closestVertex: Vec2 | null = null;
    let closestDistance = Infinity;
    
    for (const obj of objects) {
      if (obj.id === excludeObjectId) continue;
      
      const vertices = this.getObjectVertices(obj);
      for (const vertex of vertices) {
        const distance = this.distance(point, vertex);
        if (distance < closestDistance && distance <= threshold) {
          closestDistance = distance;
          closestVertex = vertex;
        }
      }
    }
    
    if (closestVertex) {
      return {
        point: { ...closestVertex },
        snapped: true,
        snapType: 'vertex',
        snapTarget: closestVertex
      };
    }
    
    return {
      point: { ...point },
      snapped: false,
      snapType: 'none'
    };
  }
  
  private static getObjectVertices(obj: EditorMapObject): Vec2[] {
    const vertices: Vec2[] = [];
    
    switch (obj.type) {
      case 'edge':
        vertices.push(...obj.vertices);
        break;
      case 'bubble':
        // For bubbles, we can snap to the center
        vertices.push(obj.center);
        break;
      case 'rotatingBar':
        // For rotating bars, snap to pivot and endpoints
        vertices.push(obj.pivot);
        // Calculate endpoints based on current rotation (assume 0 for simplicity)
        const halfLength = obj.length / 2;
        vertices.push(
          { x: obj.pivot.x - halfLength, y: obj.pivot.y },
          { x: obj.pivot.x + halfLength, y: obj.pivot.y }
        );
        break;
      case 'jumppad':
        vertices.push(obj.position);
        if (obj.shape.kind === 'rect' && obj.shape.width && obj.shape.height) {
          // Add corners of rectangle
          const hw = obj.shape.width / 2;
          const hh = obj.shape.height / 2;
          vertices.push(
            { x: obj.position.x - hw, y: obj.position.y - hh },
            { x: obj.position.x + hw, y: obj.position.y - hh },
            { x: obj.position.x + hw, y: obj.position.y + hh },
            { x: obj.position.x - hw, y: obj.position.y + hh }
          );
        }
        break;
      case 'finishLine':
        vertices.push(obj.a, obj.b);
        break;
    }
    
    return vertices;
  }
  
  private static distance(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Helper method to visualize snap targets
  static renderSnapPreview(
    ctx: CanvasRenderingContext2D,
    snapResult: SnapResult,
    camera: { zoom: number }
  ) {
    if (!snapResult.snapped || !snapResult.snapTarget) return;
    
    ctx.save();
    
    const size = 8 / camera.zoom; // Keep constant screen size
    const { point } = snapResult;
    
    if (snapResult.snapType === 'grid') {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2 / camera.zoom;
      ctx.beginPath();
      ctx.rect(point.x - size/2, point.y - size/2, size, size);
      ctx.stroke();
    } else if (snapResult.snapType === 'vertex') {
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(point.x, point.y, size/2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}