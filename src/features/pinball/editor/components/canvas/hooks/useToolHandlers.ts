import { useCallback } from 'react';
import { Vec2, EditorMapObject } from '../../../../shared/types/editorMap';
import { useEditorStore } from '../../../state/editorState';
import { Tool } from '../../../state/slices/toolSlice';
import { Snap } from '../../../../platform/Snap';

export const useToolHandlers = () => {
  const {
    map,
    camera,
    settings,
    currentTool,
    creationState,
    startCreation,
    updateCreation,
    finishCreation,
    addObject
  } = useEditorStore();

  const handleToolMouseDown = useCallback((worldPos: Vec2) => {
    const snappedPos = Snap.snapPoint(worldPos, {
      gridSize: map.meta.gridSize,
      gridSnap: settings.gridSnap,
      vertexSnap: settings.vertexSnap,
      snapThreshold: settings.snapThreshold,
      objects: map.objects,
      zoom: camera.zoom
    }).point;

    switch (currentTool) {
      case 'edge':
        handleEdgeCreation(snappedPos);
        break;
      case 'bubble':
        handleBubbleCreation(snappedPos);
        break;
      case 'rotatingBar':
        handleRotatingBarCreation(snappedPos);
        break;
      case 'jumppadRect':
        handleJumpPadRectCreation(snappedPos);
        break;
      case 'bounceCircle':
        handleBounceCircleCreation(snappedPos);
        break;
      case 'finishLine':
        handleFinishLineCreation(snappedPos);
        break;
    }
  }, [currentTool, map.meta.gridSize, settings, map.objects, camera.zoom]);

  const handleEdgeCreation = useCallback((pos: Vec2) => {
    // 기존 클릭 방식으로 edge 생성을 시작
    const newEdge = {
      id: crypto.randomUUID(),
      type: 'edge' as const,
      vertices: [pos],
      material: {
        restitution: 0.2,
        friction: 0.5
      }
    };
    startCreation(newEdge);
  }, [startCreation]);

  const handleBubbleCreation = useCallback((pos: Vec2) => {
    if (!creationState.isCreating) {
      // 2x2 격자 크기 (격자 크기 1개 = 반지름, 지름은 2격자)
      const defaultRadius = map.meta.gridSize;
      const newBubble = {
        id: crypto.randomUUID(),
        type: 'bubble' as const,
        center: pos,
        radius: defaultRadius,
        restitution: 1.4
      };
      startCreation(newBubble);
    }
  }, [creationState, startCreation, map.meta.gridSize]);

  const handleRotatingBarCreation = useCallback((pos: Vec2) => {
    if (!creationState.isCreating) {
      const minSize = map.meta.gridSize * 5;
      const thickness = map.meta.gridSize / 2;
      const newBar = {
        id: crypto.randomUUID(),
        type: 'rotatingBar' as const,
        pivot: pos,
        length: minSize,
        thickness: thickness,
        angularSpeed: 1.0,
        speedLevel: 'medium' as const
      };
      startCreation(newBar);
    }
  }, [creationState, startCreation, map.meta.gridSize]);

  const handleJumpPadRectCreation = useCallback((pos: Vec2) => {
    if (!creationState.isCreating) {
      const minSize = map.meta.gridSize * 5;
      const newJumpPad = {
        id: crypto.randomUUID(),
        type: 'jumppad' as const,
        position: pos,
        shape: {
          kind: 'rect' as const,
          width: minSize,
          height: map.meta.gridSize
        },
        bounceMultiplier: 1.6
      };
      startCreation(newJumpPad);
    }
  }, [creationState, startCreation, map.meta.gridSize]);

  const handleBounceCircleCreation = useCallback((pos: Vec2) => {
    if (!creationState.isCreating) {
      const minRadius = map.meta.gridSize;
      const newBounceCircle = {
        id: crypto.randomUUID(),
        type: 'bounceCircle' as const,
        position: pos,
        radius: minRadius,
        bounceMultiplier: 1.6
      };
      startCreation(newBounceCircle);
    }
  }, [creationState, startCreation, map.meta.gridSize]);

  const handleFinishLineCreation = useCallback((pos: Vec2) => {
    const newFinishLine = {
      id: crypto.randomUUID(),
      type: 'finishLine' as const,
      a: pos,
      b: pos,
      thickness: 5
    };
    startCreation(newFinishLine);
  }, [startCreation]);

  const handleCreationContinue = useCallback((worldPos: Vec2) => {
    const snappedPos = Snap.snapPoint(worldPos, {
      gridSize: map.meta.gridSize,
      gridSnap: settings.gridSnap,
      vertexSnap: settings.vertexSnap,
      snapThreshold: settings.snapThreshold,
      objects: map.objects,
      zoom: camera.zoom
    }).point;

    const tempObj = creationState.tempObject;
    if (!tempObj) return;

    switch (tempObj.type) {
      case 'edge':
        const currentVertices = tempObj.vertices || [];
        updateCreation({
          vertices: [...currentVertices, snappedPos]
        });
        break;
    }
  }, [creationState, map.meta.gridSize, settings, map.objects, camera.zoom, updateCreation]);

  const handleCreationUpdate = useCallback((worldPos: Vec2) => {
    if (!creationState.isCreating || !creationState.tempObject) return;

    const snappedPos = Snap.snapPoint(worldPos, {
      gridSize: map.meta.gridSize,
      gridSnap: settings.gridSnap,
      vertexSnap: settings.vertexSnap,
      snapThreshold: settings.snapThreshold,
      objects: map.objects,
      zoom: camera.zoom
    }).point;

    switch (creationState.tempObject.type) {
      case 'edge': {
        const latestTemp = useEditorStore.getState().creationState.tempObject;
        const vertices =
          latestTemp && latestTemp.type === 'edge'
            ? latestTemp.vertices || []
            : creationState.tempObject.vertices || [];
        if (vertices.length === 0) {
          break;
        }

        const updatedVertices = [...vertices];

        if (updatedVertices.length === 1) {
          // 두 번째 정점이 아직 없으면 새 정점을 임시로 추가해 드래그 미리보기를 만든다
          updatedVertices.push(snappedPos);
        } else {
          // 마지막 정점만 현재 마우스 위치로 갱신해 기존 정점들을 유지한다
          updatedVertices[updatedVertices.length - 1] = snappedPos;
        }

        updateCreation({ vertices: updatedVertices });
        break;
      }
      case 'finishLine':
        updateCreation({ b: snappedPos });
        break;
      case 'bubble':
        const center = creationState.tempObject.center;
        if (center) {
          let radius = Math.sqrt(
            Math.pow(worldPos.x - center.x, 2) +
            Math.pow(worldPos.y - center.y, 2)
          );
          if (settings.gridSnap) {
            radius = Math.round(radius / map.meta.gridSize) * map.meta.gridSize;
          }
          updateCreation({ radius: Math.max(map.meta.gridSize, radius) });
        }
        break;
      case 'bounceCircle':
        const bcPosition = creationState.tempObject.position;
        if (bcPosition) {
          let radius = Math.sqrt(
            Math.pow(worldPos.x - bcPosition.x, 2) +
            Math.pow(worldPos.y - bcPosition.y, 2)
          );
          if (settings.gridSnap) {
            radius = Math.round(radius / map.meta.gridSize) * map.meta.gridSize;
          }
          updateCreation({ radius: Math.max(map.meta.gridSize, radius) });
        }
        break;
      case 'rotatingBar':
        const pivot = creationState.tempObject.pivot;
        if (pivot) {
          let length = Math.sqrt(
            Math.pow(worldPos.x - pivot.x, 2) +
            Math.pow(worldPos.y - pivot.y, 2)
          ) * 2;
          if (settings.gridSnap) {
            length = Math.round(length / map.meta.gridSize) * map.meta.gridSize;
          }
          const minLength = map.meta.gridSize * 5;
          updateCreation({ length: Math.max(minLength, length) });
        }
        break;
      case 'jumppad':
        const position = creationState.tempObject.position;
        const shape = creationState.tempObject.shape;
        if (position && shape) {
          let width = Math.abs(worldPos.x - position.x) * 2;
          let height = Math.abs(worldPos.y - position.y) * 2;
          if (settings.gridSnap) {
            width = Math.round(width / map.meta.gridSize) * map.meta.gridSize;
            height = Math.round(height / map.meta.gridSize) * map.meta.gridSize;
          }
          const minSize = map.meta.gridSize * 5;
          updateCreation({
            shape: {
              kind: 'rect' as const,
              width: Math.max(minSize, width),
              height: Math.max(map.meta.gridSize * 2, height)
            }
          });
        }
        break;
    }
  }, [creationState, map.meta.gridSize, settings, map.objects, camera.zoom, updateCreation]);

  const handleCreationComplete = useCallback(() => {
    if (creationState.isCreating && creationState.tempObject) {
      const tempObj = creationState.tempObject;
      if (tempObj.type === 'bubble' || tempObj.type === 'rotatingBar' || tempObj.type === 'bounceCircle' || tempObj.type === 'jumppad') {
        const finishedObject = { ...tempObj } as EditorMapObject;
        addObject(finishedObject);
        finishCreation();
      } else if (tempObj.type === 'edge') {
        const vertices = tempObj.vertices || [];
        if (vertices.length === 2) {
          const [p1, p2] = vertices;
          if (Math.abs(p1.x - p2.x) > 1 || Math.abs(p1.y - p2.y) > 1) {
            const finishedObject = { ...tempObj } as EditorMapObject;
            addObject(finishedObject);
            finishCreation();
            return;
          }
        }
      } else if (tempObj.type === 'finishLine') {
        if (tempObj.a && tempObj.b &&
            (Math.abs(tempObj.a.x - tempObj.b.x) > 1 || Math.abs(tempObj.a.y - tempObj.b.y) > 1)) {
          const finishedObject = { ...tempObj } as EditorMapObject;
          addObject(finishedObject);
        }
        finishCreation();
      }
    }
  }, [creationState, addObject, finishCreation]);

  const handleEdgeComplete = useCallback(() => {
    if (currentTool === 'edge' && creationState.isCreating && creationState.tempObject?.type === 'edge') {
      const vertices = creationState.tempObject.vertices || [];
      if (vertices.length >= 2) {
        // 더블클릭으로 인한 중복 점 제거
        const cleanedVertices = removeDuplicateVertices(vertices);
        const finishedEdge = { ...creationState.tempObject, vertices: cleanedVertices } as EditorMapObject;
        addObject(finishedEdge);
      }
      finishCreation();
    }
  }, [currentTool, creationState, addObject, finishCreation]);

  // 중복된 연속 정점 제거 함수
  const removeDuplicateVertices = (vertices: Vec2[]): Vec2[] => {
    if (vertices.length <= 1) return vertices;

    const result = [vertices[0]];
    for (let i = 1; i < vertices.length; i++) {
      const prev = vertices[i - 1];
      const curr = vertices[i];
      // 이전 점과 현재 점이 매우 가까우면 (5픽셀 이내) 중복으로 간주
      const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
      if (distance > 5) {
        result.push(curr);
      }
    }
    return result;
  };

  return {
    handleToolMouseDown,
    handleCreationContinue,
    handleCreationUpdate,
    handleCreationComplete,
    handleEdgeComplete
  };
};
