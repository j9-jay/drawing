import { useCallback } from 'react';
import { Vec2, EditorMapObject } from '../../../../../shared/types/editorMap';
import { useEditorStore } from '../../../state/editorState';
import { Grid } from '../../../../platform/Grid';

export const useObjectManipulation = () => {
  const {
    map,
    camera,
    settings,
    selectedIds,
    updateObject
  } = useEditorStore();

  const screenToWorld = useCallback((screenPos: Vec2): Vec2 => {
    return Grid.screenToWorld(screenPos, camera);
  }, [camera]);

  const hitTestObject = useCallback((obj: EditorMapObject, point: Vec2): boolean => {
    const tolerance = 10 / camera.zoom; // Scale tolerance with zoom

    switch (obj.type) {
      case 'edge':
        return hitTestPolyline(obj.vertices, point, tolerance);
      case 'bubble':
        const bubbleDist = Math.sqrt((point.x - obj.center.x) ** 2 + (point.y - obj.center.y) ** 2);
        return bubbleDist <= obj.radius + tolerance;
      case 'rotatingBar':
        return hitTestRotatingBar(obj, point, tolerance);
      case 'jumppad':
        return hitTestJumpPad(obj, point, tolerance);
      case 'bounceCircle':
        const bounceDist = Math.sqrt((point.x - obj.position.x) ** 2 + (point.y - obj.position.y) ** 2);
        return bounceDist <= obj.radius + tolerance;
      case 'finishLine':
        return hitTestLine(obj.a, obj.b, point, tolerance);
      default:
        return false;
    }
  }, [camera.zoom]);

  const hitTestPolyline = useCallback((vertices: Vec2[], point: Vec2, tolerance: number): boolean => {
    for (let i = 0; i < vertices.length - 1; i++) {
      if (hitTestLine(vertices[i], vertices[i + 1], point, tolerance)) {
        return true;
      }
    }
    return false;
  }, []);

  const hitTestLine = useCallback((a: Vec2, b: Vec2, point: Vec2, tolerance: number): boolean => {
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
  }, []);

  const hitTestRotatingBar = useCallback((bar: EditorMapObject & { type: 'rotatingBar' }, point: Vec2, tolerance: number): boolean => {
    const halfLength = bar.length / 2;
    const a = { x: bar.pivot.x - halfLength, y: bar.pivot.y };
    const b = { x: bar.pivot.x + halfLength, y: bar.pivot.y };
    return hitTestLine(a, b, point, tolerance + bar.thickness / 2);
  }, [hitTestLine]);

  const hitTestJumpPad = useCallback((jumppad: EditorMapObject & { type: 'jumppad' }, point: Vec2, tolerance: number): boolean => {
    const hw = (jumppad.shape.width ?? 160) / 2 + tolerance;
    const hh = (jumppad.shape.height ?? 30) / 2 + tolerance;
    return Math.abs(point.x - jumppad.position.x) <= hw &&
           Math.abs(point.y - jumppad.position.y) <= hh;
  }, []);

  const hitTest = useCallback((worldPos: Vec2): string | null => {
    for (let i = map.objects.length - 1; i >= 0; i--) {
      const obj = map.objects[i];
      if (hitTestObject(obj, worldPos)) {
        return obj.id;
      }
    }
    return null;
  }, [map.objects, hitTestObject]);

  const hitTestVertex = useCallback((worldPos: Vec2, edge: EditorMapObject & { type: 'edge' }): number => {
    const tolerance = 15 / camera.zoom;
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
  }, [camera.zoom]);

  const hitTestResizeHandle = useCallback((worldPos: Vec2, obj: EditorMapObject): boolean => {
    const tolerance = 10 / camera.zoom;

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
  }, [camera.zoom]);

  const moveObject = useCallback((
    objectId: string,
    originalState: any,
    dragStart: Vec2,
    worldPos: Vec2
  ) => {
    const obj = map.objects.find(o => o.id === objectId);
    if (!obj || !originalState) return;

    // Calculate the delta from the original drag start position
    const rawDx = worldPos.x - dragStart.x;
    const rawDy = worldPos.y - dragStart.y;

    // Apply grid snapping to the delta if grid snap is enabled
    let dx = rawDx;
    let dy = rawDy;

    if (settings.gridSnap) {
      dx = Math.round(rawDx / map.meta.gridSize) * map.meta.gridSize;
      dy = Math.round(rawDy / map.meta.gridSize) * map.meta.gridSize;
    }

    const updates: any = {};

    switch (obj.type) {
      case 'edge':
        updates.vertices = originalState.vertices.map((v: Vec2) => ({
          x: v.x + dx,
          y: v.y + dy
        }));
        break;
      case 'bubble':
        updates.center = {
          x: originalState.center.x + dx,
          y: originalState.center.y + dy
        };
        break;
      case 'rotatingBar':
        updates.pivot = {
          x: originalState.pivot.x + dx,
          y: originalState.pivot.y + dy
        };
        break;
      case 'jumppad':
        updates.position = {
          x: originalState.position.x + dx,
          y: originalState.position.y + dy
        };
        break;
      case 'bounceCircle':
        updates.position = {
          x: originalState.position.x + dx,
          y: originalState.position.y + dy
        };
        break;
      case 'finishLine':
        updates.a = {
          x: originalState.a.x + dx,
          y: originalState.a.y + dy
        };
        updates.b = {
          x: originalState.b.x + dx,
          y: originalState.b.y + dy
        };
        break;
    }

    updateObject(objectId, updates);
  }, [map.objects, map.meta.gridSize, settings.gridSnap, updateObject]);

  return {
    screenToWorld,
    hitTest,
    hitTestObject,
    hitTestVertex,
    hitTestResizeHandle,
    hitTestLine,
    moveObject
  };
};