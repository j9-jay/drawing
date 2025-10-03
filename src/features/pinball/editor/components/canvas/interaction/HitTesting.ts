import { Vec2, EditorMapObject } from '../../../../shared/types/editorMap';

export class HitTesting {
  static hitTestObject(obj: EditorMapObject, point: Vec2, tolerance: number): boolean {
    switch (obj.type) {
      case 'edge':
        return HitTesting.hitTestPolyline(obj.vertices, point, tolerance);
      case 'bubble':
        const bubbleDist = Math.sqrt((point.x - obj.center.x) ** 2 + (point.y - obj.center.y) ** 2);
        return bubbleDist <= obj.radius + tolerance;
      case 'rotatingBar':
        return HitTesting.hitTestRotatingBar(obj, point, tolerance);
      case 'jumppad':
        return HitTesting.hitTestJumpPad(obj, point, tolerance);
      case 'bounceCircle':
        const bounceDist = Math.sqrt((point.x - obj.position.x) ** 2 + (point.y - obj.position.y) ** 2);
        return bounceDist <= obj.radius + tolerance;
      case 'finishLine':
        return HitTesting.hitTestLine(obj.a, obj.b, point, tolerance);
      default:
        return false;
    }
  }

  static hitTestPolyline(vertices: Vec2[], point: Vec2, tolerance: number): boolean {
    for (let i = 0; i < vertices.length - 1; i++) {
      if (HitTesting.hitTestLine(vertices[i], vertices[i + 1], point, tolerance)) {
        return true;
      }
    }
    return false;
  }

  static hitTestLine(a: Vec2, b: Vec2, point: Vec2, tolerance: number): boolean {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
      const dist = Math.sqrt((point.x - a.x) ** 2 + (point.y - a.y) ** 2);
      return dist <= tolerance;
    }

    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (length * length)));
    const projection = { x: a.x + t * dx, y: a.y + t * dy };
    const dist = Math.sqrt((point.x - projection.x) ** 2 + (point.y - projection.y) ** 2);

    return dist <= tolerance;
  }

  static hitTestRotatingBar(bar: EditorMapObject & { type: 'rotatingBar' }, point: Vec2, tolerance: number): boolean {
    const halfLength = bar.length / 2;
    const a = { x: bar.pivot.x - halfLength, y: bar.pivot.y };
    const b = { x: bar.pivot.x + halfLength, y: bar.pivot.y };
    return HitTesting.hitTestLine(a, b, point, tolerance + bar.thickness / 2);
  }

  static hitTestJumpPad(jumppad: EditorMapObject & { type: 'jumppad' }, point: Vec2, tolerance: number): boolean {
    const hw = (jumppad.shape.width ?? 160) / 2 + tolerance;
    const hh = (jumppad.shape.height ?? 30) / 2 + tolerance;
    return Math.abs(point.x - jumppad.position.x) <= hw &&
           Math.abs(point.y - jumppad.position.y) <= hh;
  }

  static hitTestVertex(worldPos: Vec2, edge: EditorMapObject & { type: 'edge' }, tolerance: number): number {
    let closestIndex = -1;
    let closestDist = Infinity;

    for (let i = 0; i < edge.vertices.length; i++) {
      const dist = Math.sqrt(
        Math.pow(worldPos.x - edge.vertices[i].x, 2) +
        Math.pow(worldPos.y - edge.vertices[i].y, 2)
      );
      if (dist <= tolerance && dist < closestDist) {
        closestIndex = i;
        closestDist = dist;
      }
    }

    return closestIndex;
  }

  static hitTestResizeHandle(worldPos: Vec2, obj: EditorMapObject, tolerance: number): boolean {
    if (obj.type === 'bubble') {
      const handleX = obj.center.x + obj.radius;
      const handleY = obj.center.y;
      const dist = Math.sqrt(
        Math.pow(worldPos.x - handleX, 2) +
        Math.pow(worldPos.y - handleY, 2)
      );
      return dist <= tolerance;
    }

    if (obj.type === 'rotatingBar') {
      const handleX = obj.pivot.x + obj.length / 2;
      const handleY = obj.pivot.y;
      const dist = Math.sqrt(
        Math.pow(worldPos.x - handleX, 2) +
        Math.pow(worldPos.y - handleY, 2)
      );
      return dist <= tolerance;
    }

    if (obj.type === 'jumppad') {
      const handleX = obj.position.x + (obj.shape.width || 160) / 2;
      const handleY = obj.position.y;
      const dist = Math.sqrt(
        Math.pow(worldPos.x - handleX, 2) +
        Math.pow(worldPos.y - handleY, 2)
      );
      return dist <= tolerance;
    }

    if (obj.type === 'bounceCircle') {
      const handleX = obj.position.x + obj.radius;
      const handleY = obj.position.y;
      const dist = Math.sqrt(
        Math.pow(worldPos.x - handleX, 2) +
        Math.pow(worldPos.y - handleY, 2)
      );
      return dist <= tolerance;
    }

    return false;
  }

  static hitTestDirectionToggle(worldPos: Vec2, obj: EditorMapObject, tolerance: number): boolean {
    if (obj.type !== 'rotatingBar') return false;

    const handleX = obj.pivot.x - 25;
    const handleY = obj.pivot.y + 50;
    const dist = Math.sqrt(
      Math.pow(worldPos.x - handleX, 2) +
      Math.pow(worldPos.y - handleY, 2)
    );
    return dist <= tolerance;
  }

  static hitTestSpeedControl(worldPos: Vec2, obj: EditorMapObject, tolerance: number): boolean {
    if (obj.type !== 'rotatingBar') return false;

    const handleX = obj.pivot.x + 25;
    const handleY = obj.pivot.y + 50;
    const dist = Math.sqrt(
      Math.pow(worldPos.x - handleX, 2) +
      Math.pow(worldPos.y - handleY, 2)
    );
    return dist <= tolerance;
  }
}