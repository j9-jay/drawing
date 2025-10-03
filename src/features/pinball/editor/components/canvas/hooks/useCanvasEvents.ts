import { useCallback, useState } from 'react';
import { Vec2, EditorMapObject } from '../../../../shared/types/editorMap';
import { useEditorStore } from '../../../state/editorState';

export const useCanvasEvents = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Vec2>({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState<Vec2>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'resize' | 'rotate' | 'vertex'>('none');
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [draggedVertexIndex, setDraggedVertexIndex] = useState<number>(-1);
  const [originalObjectState, setOriginalObjectState] = useState<any>(null);
  const [initialDragPos, setInitialDragPos] = useState<Vec2>({ x: 0, y: 0 });

  const {
    camera,
    setCamera,
    creationState,
    map
  } = useEditorStore();

  const getMousePos = useCallback((e: React.MouseEvent): Vec2 => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      setSpacePressed(true);
      e.preventDefault();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      useEditorStore.getState().deleteSelected();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      if (creationState.isCreating) {
        useEditorStore.getState().cancelCreation();
      } else {
        useEditorStore.getState().clearSelection();
      }
      e.preventDefault();
    }
  }, [creationState.isCreating]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      setSpacePressed(false);
      e.preventDefault();
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    const canvas = e.currentTarget as HTMLCanvasElement;

    // Check for zoom modifier (Ctrl/Cmd key)
    if (e.ctrlKey || e.metaKey) {
      // Zoom functionality
      const zoomSpeed = 0.1;
      const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
      const newZoom = Math.max(0.5, Math.min(3, camera.zoom + delta));

      // Recalculate x position to keep map centered when zooming
      const viewportWidth = canvas.width;
      const mapWidth = map.meta.canvasSize.width; // 실제 맵 너비 사용
      const newX = Math.max(0, (mapWidth - viewportWidth / newZoom) / 2);

      setCamera({
        zoom: newZoom,
        x: newX,
        y: camera.y
      });
    } else {
      // Simple vertical scroll with mouse wheel
      const scrollSpeed = 50 / camera.zoom;
      const deltaY = e.deltaY > 0 ? scrollSpeed : -scrollSpeed;

      // Calculate bounds
      const viewportHeight = canvas.height;
      const mapHeight = map.meta.canvasSize.height; // 실제 맵 높이 사용
      const minY = 0;
      const maxY = Math.max(0, mapHeight - viewportHeight / camera.zoom);

      // Clamp the new Y position within bounds
      const newY = Math.max(minY, Math.min(maxY, camera.y + deltaY));

      setCamera({
        y: newY
      });
    }
  }, [camera, setCamera, map.meta.canvasSize]);

  return {
    // State
    isDragging,
    setIsDragging,
    dragStart,
    setDragStart,
    lastMousePos,
    setLastMousePos,
    spacePressed,
    setSpacePressed,
    dragMode,
    setDragMode,
    draggedObjectId,
    setDraggedObjectId,
    draggedVertexIndex,
    setDraggedVertexIndex,
    originalObjectState,
    setOriginalObjectState,
    initialDragPos,
    setInitialDragPos,

    // Handlers
    getMousePos,
    handleKeyDown,
    handleKeyUp,
    handleWheel
  };
};