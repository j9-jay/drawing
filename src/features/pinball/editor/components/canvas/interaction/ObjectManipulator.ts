import { Vec2, EditorMapObject } from '../../../../shared/types/editorMap';
import { Grid } from '../../../../platform/Grid';
import { getNextRotatingBarSpeedPreset } from '../../../../shared/utils/rotatingBarSpeed';

export class ObjectManipulator {
  static moveObject(
    obj: EditorMapObject,
    originalState: any,
    dragStart: Vec2,
    worldPos: Vec2,
    gridSize: number,
    gridSnap: boolean
  ): Partial<EditorMapObject> {
    // Calculate the delta from the original drag start position
    const rawDx = worldPos.x - dragStart.x;
    const rawDy = worldPos.y - dragStart.y;

    // Apply grid snapping to the delta if grid snap is enabled
    let dx = rawDx;
    let dy = rawDy;

    if (gridSnap) {
      dx = Math.round(rawDx / gridSize) * gridSize;
      dy = Math.round(rawDy / gridSize) * gridSize;
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

    return updates;
  }

  static moveVertex(
    edge: EditorMapObject & { type: 'edge' },
    vertexIndex: number,
    worldPos: Vec2,
    gridSize: number,
    gridSnap: boolean
  ): Partial<EditorMapObject> {
    const snappedPos = gridSnap
      ? Grid.snapToGrid(worldPos, gridSize)
      : worldPos;

    const newVertices = [...edge.vertices];
    if (vertexIndex < newVertices.length) {
      newVertices[vertexIndex] = snappedPos;
      return { vertices: newVertices };
    }

    return {};
  }

  static resizeObject(
    obj: EditorMapObject,
    worldPos: Vec2,
    gridSize: number,
    gridSnap: boolean
  ): Partial<EditorMapObject> {
    const updates: any = {};

    if (obj.type === 'bubble') {
      const dx = worldPos.x - obj.center.x;
      const dy = worldPos.y - obj.center.y;
      let newRadius = Math.sqrt(dx * dx + dy * dy);

      if (gridSnap) {
        newRadius = Math.round(newRadius / gridSize) * gridSize;
      }

      newRadius = Math.max(gridSize, newRadius);
      updates.radius = newRadius;
    } else if (obj.type === 'rotatingBar') {
      const dx = worldPos.x - obj.pivot.x;
      const dy = worldPos.y - obj.pivot.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      let newLength = distance * 2;

      if (gridSnap) {
        newLength = Math.round(newLength / gridSize) * gridSize;
      }

      const minLength = gridSize * 5;
      newLength = Math.max(minLength, newLength);
      updates.length = newLength;
    } else if (obj.type === 'jumppad') {
      const minSize = gridSize * 5;

      if (obj.shape.kind === 'rect') {
        let dx = Math.abs(worldPos.x - obj.position.x);
        let dy = Math.abs(worldPos.y - obj.position.y);

        let newWidth = dx * 2;
        let newHeight = dy * 2;

        if (gridSnap) {
          newWidth = Math.round(newWidth / gridSize) * gridSize;
          newHeight = Math.round(newHeight / gridSize) * gridSize;
        }

        newWidth = Math.max(minSize, newWidth);
        newHeight = Math.max(gridSize * 2, newHeight);

        updates.shape = {
          ...obj.shape,
          width: newWidth,
          height: newHeight
        };
      } else if (obj.shape.kind === 'circle') {
        const dx = worldPos.x - obj.position.x;
        const dy = worldPos.y - obj.position.y;
        let newRadius = Math.sqrt(dx * dx + dy * dy);

        if (gridSnap) {
          newRadius = Math.round(newRadius / gridSize) * gridSize;
        }

        const minRadius = (gridSize * 5) / 2;
        newRadius = Math.max(minRadius, newRadius);

        updates.shape = {
          ...obj.shape,
          radius: newRadius
        };
      }
    }

    return updates;
  }

  static toggleRotatingBarDirection(bar: EditorMapObject & { type: 'rotatingBar' }): Partial<EditorMapObject> {
    return { angularSpeed: -bar.angularSpeed };
  }

  static cycleRotatingBarSpeed(bar: EditorMapObject & { type: 'rotatingBar' }): Partial<EditorMapObject> {
    const direction = bar.angularSpeed >= 0 ? 1 : -1;
    const nextPreset = getNextRotatingBarSpeedPreset(bar.speedLevel, bar.angularSpeed);
    return {
      angularSpeed: nextPreset.speed * direction,
      speedLevel: nextPreset.level
    };
  }
}
