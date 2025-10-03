'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../state/editorState';
import { Vec2 } from '../../../../shared/types/editorMap';

// Hooks
import { useCanvasEvents } from './hooks/useCanvasEvents';
import { useObjectManipulation } from './hooks/useObjectManipulation';
import { useToolHandlers } from './hooks/useToolHandlers';

// Rendering
import { CanvasRenderer } from './rendering/CanvasRenderer';

// Interaction
import { HitTesting } from './interaction/HitTesting';
import { ObjectManipulator } from './interaction/ObjectManipulator';

const CanvasView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Edge 툴 드래그/멀티클릭 구분을 위한 상태
  const edgeDragActive = useRef(false);
  const edgeDragStart = useRef<Vec2 | null>(null);

  // Performance optimization: throttle hover updates
  const lastHoverUpdate = useRef<number>(0);
  const HOVER_UPDATE_THROTTLE = 50; // milliseconds

  const {
    map,
    camera,
    settings,
    selectedIds,
    hoveredId,
    setHovered,
    currentTool,
    creationState,
    updateObject
  } = useEditorStore();

  // Custom hooks
  const {
    isDragging,
    setIsDragging,
    dragStart,
    setDragStart,
    lastMousePos,
    setLastMousePos,
    spacePressed,
    dragMode,
    setDragMode,
    draggedObjectId,
    setDraggedObjectId,
    draggedVertexIndex,
    setDraggedVertexIndex,
    originalObjectState,
    setOriginalObjectState,
    setInitialDragPos,
    getMousePos,
    handleKeyDown,
    handleKeyUp,
    handleWheel
  } = useCanvasEvents();

  const { screenToWorld, hitTest } = useObjectManipulation();

  const {
    handleToolMouseDown,
    handleCreationContinue,
    handleCreationUpdate,
    handleCreationComplete,
    handleEdgeComplete
  } = useToolHandlers();

  // Canvas size management
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Reinitialize renderer with new canvas size
      rendererRef.current = new CanvasRenderer(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvas);
    }
  }, []);

  // Render function
  const render = useCallback(() => {
    if (!rendererRef.current) return;

    rendererRef.current.render(
      map.objects,
      selectedIds,
      hoveredId,
      camera,
      settings,
      map.meta,
      creationState
    );
  }, [map, selectedIds, hoveredId, camera, settings, creationState]);

  // Render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  // Force re-render when creation state changes
  useEffect(() => {
    render();
  }, [creationState, render]);

  const handleSelectToolMouseDown = useCallback((worldPos: Vec2) => {
    const tolerance = 10 / camera.zoom;
    let clickedOnSelected = false;

    for (const id of selectedIds) {
      const obj = map.objects.find(o => o.id === id);
      if (obj) {
        // Check for special handles first
        if (HitTesting.hitTestDirectionToggle(worldPos, obj, tolerance * 1.2)) {
          if (obj.type === 'rotatingBar') {
            const updates = ObjectManipulator.toggleRotatingBarDirection(obj);
            updateObject(id, updates);
          }
          return;
        }

        if (HitTesting.hitTestSpeedControl(worldPos, obj, tolerance * 1.2)) {
          if (obj.type === 'rotatingBar') {
            const updates = ObjectManipulator.cycleRotatingBarSpeed(obj);
            updateObject(id, updates);
          }
          return;
        }

        // Check for resize handle
        if (HitTesting.hitTestResizeHandle(worldPos, obj, tolerance)) {
          setDragMode('resize');
          setDraggedObjectId(id);
          setOriginalObjectState(JSON.parse(JSON.stringify(obj)));
          setInitialDragPos(worldPos);
          return;
        }

        // Check for vertex manipulation (edges only)
        if (obj.type === 'edge') {
          const vertexHit = HitTesting.hitTestVertex(worldPos, obj, tolerance * 1.5);
          if (vertexHit >= 0) {
            setDragMode('vertex');
            setDraggedObjectId(id);
            setDraggedVertexIndex(vertexHit);
            setOriginalObjectState(JSON.parse(JSON.stringify(obj)));
            return;
          }
        }

        // Check if clicking on the object itself
        if (HitTesting.hitTestObject(obj, worldPos, tolerance)) {
          clickedOnSelected = true;
          setDragMode('move');
          setDraggedObjectId(id);
          setOriginalObjectState(JSON.parse(JSON.stringify(obj)));
          setInitialDragPos(worldPos);
          return;
        }
      }
    }

    if (!clickedOnSelected) {
      const hitObjectId = hitTest(worldPos);
      if (hitObjectId) {
        useEditorStore.getState().selectObject(hitObjectId);
        setDragMode('move');
        setDraggedObjectId(hitObjectId);
        const obj = map.objects.find(o => o.id === hitObjectId);
        setOriginalObjectState(JSON.parse(JSON.stringify(obj)));
        setInitialDragPos(worldPos);
      } else {
        useEditorStore.getState().clearSelection();
      }
    }
  }, [
    camera.zoom,
    selectedIds,
    map.objects,
    updateObject,
    setDragMode,
    setDraggedObjectId,
    setOriginalObjectState,
    setInitialDragPos,
    setDraggedVertexIndex,
    hitTest
  ]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePos(e);
    const worldPos = screenToWorld(mousePos);

    setIsDragging(true);
    setDragStart(worldPos);
    setLastMousePos(mousePos);

    if (currentTool === 'edge' || creationState.tempObject?.type === 'edge') {
      edgeDragActive.current = false;
      edgeDragStart.current = worldPos;
    } else {
      edgeDragStart.current = null;
    }

    if (spacePressed) {
      // Pan mode
      return;
    }

    if (currentTool === 'select') {
      handleSelectToolMouseDown(worldPos);
    } else {
      // Tool mode - handle creation
      if (creationState.isCreating) {
        handleCreationContinue(worldPos);
      } else {
        handleToolMouseDown(worldPos);
      }
    }
  }, [
    currentTool,
    spacePressed,
    screenToWorld,
    getMousePos,
    creationState,
    setIsDragging,
    setDragStart,
    setLastMousePos,
    handleToolMouseDown,
    handleCreationContinue,
    handleSelectToolMouseDown
  ]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const mousePos = getMousePos(e);
    const worldPos = screenToWorld(mousePos);

    setLastMousePos(mousePos);

    if (isDragging) {
      if (spacePressed) {
        // Pan camera (both X and Y axes)
        const canvas = canvasRef.current;
        if (canvas) {
          const dx = mousePos.x - lastMousePos.x;
          const dy = mousePos.y - lastMousePos.y;

          const viewportWidth = canvas.width;
          const viewportHeight = canvas.height;
          const mapWidth = map.meta.canvasSize.width;
          const mapHeight = map.meta.canvasSize.height;

          // Calculate bounds for both axes
          const minX = 0;
          const maxX = Math.max(0, mapWidth - viewportWidth / camera.zoom);
          const minY = 0;
          const maxY = Math.max(0, mapHeight - viewportHeight / camera.zoom);

          // Calculate new camera position
          const newX = Math.max(minX, Math.min(maxX, camera.x - dx / camera.zoom));
          const newY = Math.max(minY, Math.min(maxY, camera.y - dy / camera.zoom));

          // Use the setCamera from useEditorStore
          const { setCamera } = useEditorStore.getState();
          setCamera({ x: newX, y: newY });
        }
      } else if (dragMode === 'move' && draggedObjectId) {
        // Move object
        const obj = map.objects.find(o => o.id === draggedObjectId);
        if (obj && originalObjectState) {
          const updates = ObjectManipulator.moveObject(
            obj,
            originalObjectState,
            dragStart,
            worldPos,
            map.meta.gridSize,
            settings.gridSnap
          );
          updateObject(draggedObjectId, updates);
        }
      } else if (dragMode === 'vertex' && draggedObjectId && draggedVertexIndex >= 0) {
        // Move vertex
        const obj = map.objects.find(o => o.id === draggedObjectId);
        if (obj && obj.type === 'edge') {
          const updates = ObjectManipulator.moveVertex(
            obj,
            draggedVertexIndex,
            worldPos,
            map.meta.gridSize,
            settings.gridSnap
          );
          updateObject(draggedObjectId, updates);
        }
      } else if (dragMode === 'resize' && draggedObjectId) {
        // Resize object
        const obj = map.objects.find(o => o.id === draggedObjectId);
        if (obj) {
          const updates = ObjectManipulator.resizeObject(
            obj,
            worldPos,
            map.meta.gridSize,
            settings.gridSnap
          );
          updateObject(draggedObjectId, updates);
        }
      } else if (creationState.isCreating && creationState.tempObject) {
        // Update creation preview
        handleCreationUpdate(worldPos);

        if (creationState.tempObject.type === 'edge' && edgeDragStart.current) {
          const dx = worldPos.x - edgeDragStart.current.x;
          const dy = worldPos.y - edgeDragStart.current.y;
          const dragDistance = Math.sqrt(dx * dx + dy * dy);
          if (dragDistance > 10) {
            edgeDragActive.current = true;
          }
        }
      }
    } else {
      // Update hover state with throttling
      const now = Date.now();
      if (now - lastHoverUpdate.current > HOVER_UPDATE_THROTTLE) {
        const hitObjectId = hitTest(worldPos);
        setHovered(hitObjectId);
        lastHoverUpdate.current = now;
      }
    }
  }, [
    getMousePos,
    screenToWorld,
    setLastMousePos,
    isDragging,
    spacePressed,
    lastMousePos,
    camera,
    map,
    dragMode,
    draggedObjectId,
    originalObjectState,
    dragStart,
    settings,
    updateObject,
    draggedVertexIndex,
    creationState,
    handleCreationUpdate,
    hitTest,
    setHovered
  ]);

  const handleMouseUp = useCallback(() => {
    // Complete creation for drag-to-size objects
    if (creationState.isCreating && creationState.tempObject) {
      const tempObj = creationState.tempObject;

      if (tempObj.type === 'edge') {
        if (edgeDragActive.current) {
          handleCreationComplete();
        }
      } else {
        // 다른 툴들은 기존대로 처리
        handleCreationComplete();
      }
    }

    edgeDragActive.current = false;
    edgeDragStart.current = null;

    // Reset drag state
    setIsDragging(false);
    setDragMode('none');
    setDraggedObjectId(null);
    setDraggedVertexIndex(-1);
    setOriginalObjectState(null);
  }, [
    creationState,
    handleCreationComplete,
    setIsDragging,
    setDragMode,
    setDraggedObjectId,
    setDraggedVertexIndex,
    setOriginalObjectState
  ]);

  const handleDoubleClick = useCallback(() => {
    edgeDragActive.current = false;
    edgeDragStart.current = null;
    handleEdgeComplete();
  }, [handleEdgeComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="editor-canvas"
      style={{ cursor: spacePressed ? 'grab' : (currentTool === 'select' ? 'default' : 'crosshair') }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={0}
    />
  );
};

export default CanvasView;
