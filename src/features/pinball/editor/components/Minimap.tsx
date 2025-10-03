'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '../state/editorState';
import { EditorMapObject, Vec2 } from '../../../shared/types/editorMap';
import { MinimapRenderers } from '../../../shared/rendering';

const Minimap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<Vec2>({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);

  const {
    map,
    camera,
    setCamera,
    selectedIds,
    hoveredId
  } = useEditorStore();

  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 400;

  // Memoize constants to prevent recalculation
  const minimapConstants = React.useMemo(() => {
    const scale = Math.min(MINIMAP_WIDTH / map.meta.canvasSize.width, MINIMAP_HEIGHT / map.meta.canvasSize.height);
    const scaledMapWidth = map.meta.canvasSize.width * scale;
    const scaledMapHeight = map.meta.canvasSize.height * scale;
    const offsetX = (MINIMAP_WIDTH - scaledMapWidth) / 2;
    const offsetY = (MINIMAP_HEIGHT - scaledMapHeight) / 2;

    return { scale, scaledMapWidth, scaledMapHeight, offsetX, offsetY };
  }, [map.meta.canvasSize.width, map.meta.canvasSize.height]);

  const drawMinimap = useCallback(() => {
    const { scale: MINIMAP_SCALE, scaledMapWidth, scaledMapHeight, offsetX, offsetY } = minimapConstants;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Fill background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Draw map boundary (centered)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, scaledMapWidth, scaledMapHeight);

    // Draw objects
    map.objects.forEach(obj => {
      const isSelected = selectedIds.has(obj.id);
      const isHovered = hoveredId === obj.id;

      if (isSelected) {
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
      } else if (isHovered) {
        ctx.strokeStyle = '#FFC107';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
      }

      switch (obj.type) {
        case 'edge':
          if (obj.vertices.length >= 2) {
            ctx.beginPath();
            const firstVertex = obj.vertices[0];
            ctx.moveTo(offsetX + firstVertex.x * MINIMAP_SCALE, offsetY + firstVertex.y * MINIMAP_SCALE);
            
            for (let i = 1; i < obj.vertices.length; i++) {
              const vertex = obj.vertices[i];
              ctx.lineTo(offsetX + vertex.x * MINIMAP_SCALE, offsetY + vertex.y * MINIMAP_SCALE);
            }
            ctx.stroke();
          }
          break;

        case 'bubble':
          ctx.beginPath();
          ctx.arc(
            offsetX + obj.center.x * MINIMAP_SCALE,
            offsetY + obj.center.y * MINIMAP_SCALE,
            obj.radius * MINIMAP_SCALE,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          break;

        case 'rotatingBar':
          const barHalfLength = obj.length / 2 * MINIMAP_SCALE;
          const barHalfThickness = obj.thickness / 2 * MINIMAP_SCALE;
          const centerX = offsetX + obj.pivot.x * MINIMAP_SCALE;
          const centerY = offsetY + obj.pivot.y * MINIMAP_SCALE;

          ctx.beginPath();
          ctx.rect(
            centerX - barHalfLength,
            centerY - barHalfThickness,
            obj.length * MINIMAP_SCALE,
            obj.thickness * MINIMAP_SCALE
          );
          ctx.stroke();
          break;

        case 'jumppad':
          const minimapX = offsetX + obj.position.x * MINIMAP_SCALE;
          const minimapY = offsetY + obj.position.y * MINIMAP_SCALE;
          const width = obj.shape.width * MINIMAP_SCALE;
          const height = obj.shape.height * MINIMAP_SCALE;

          MinimapRenderers.jumpPad(ctx, minimapX, minimapY, width, height);
          break;

        case 'bounceCircle':
          const bounceX = offsetX + obj.position.x * MINIMAP_SCALE;
          const bounceY = offsetY + obj.position.y * MINIMAP_SCALE;
          const bounceRadius = obj.radius * MINIMAP_SCALE;

          MinimapRenderers.bounceCircle(ctx, bounceX, bounceY, bounceRadius);
          break;

        case 'finishLine':
          ctx.beginPath();
          ctx.moveTo(offsetX + obj.a.x * MINIMAP_SCALE, offsetY + obj.a.y * MINIMAP_SCALE);
          ctx.lineTo(offsetX + obj.b.x * MINIMAP_SCALE, offsetY + obj.b.y * MINIMAP_SCALE);
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
      }
    });

    // Draw spawn point
    if (map.meta.spawnPoint) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(
        offsetX + map.meta.spawnPoint.x * MINIMAP_SCALE,
        offsetY + map.meta.spawnPoint.y * MINIMAP_SCALE,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw viewport indicator
    const canvasAreaElement = document.querySelector('.editor-canvas') as HTMLCanvasElement;
    const viewportWidth = canvasAreaElement ? canvasAreaElement.clientWidth : 800;
    const viewportHeight = canvasAreaElement ? canvasAreaElement.clientHeight : 600;
    
    // Calculate viewport bounds in world coordinates
    // Since canvas transform is: scale(zoom) then translate(-camera.x, -camera.y)
    // The visible world area is: camera position to camera position + viewport size / zoom
    const worldLeft = camera.x;
    const worldTop = camera.y;
    const worldRight = camera.x + viewportWidth / camera.zoom;
    const worldBottom = camera.y + viewportHeight / camera.zoom;
    
    // Convert to minimap coordinates (with centering offset)
    const viewportX = offsetX + worldLeft * MINIMAP_SCALE;
    const viewportY = offsetY + worldTop * MINIMAP_SCALE;
    const viewportScaledWidth = (worldRight - worldLeft) * MINIMAP_SCALE;
    const viewportScaledHeight = (worldBottom - worldTop) * MINIMAP_SCALE;

    ctx.strokeStyle = '#00BCD4';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportScaledWidth, viewportScaledHeight);

    // Fill viewport with semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 188, 212, 0.1)';
    ctx.fillRect(viewportX, viewportY, viewportScaledWidth, viewportScaledHeight);

    // Draw mouse cursor indicator
    if (isMouseOverCanvas) {
      const canvasAreaElement = document.querySelector('.editor-canvas') as HTMLCanvasElement;
      if (canvasAreaElement) {
        const canvasRect = canvasAreaElement.getBoundingClientRect();
        
        // Get mouse position relative to main canvas
        const mainCanvasMouseX = mousePosition.x - canvasRect.left;
        const mainCanvasMouseY = mousePosition.y - canvasRect.top;
        
        // Convert to world coordinates (matching the screenToWorld formula)
        const worldMouseX = mainCanvasMouseX / camera.zoom + camera.x;
        const worldMouseY = mainCanvasMouseY / camera.zoom + camera.y;
        
        // Convert to minimap coordinates (with centering offset)
        const minimapMouseX = offsetX + worldMouseX * MINIMAP_SCALE;
        const minimapMouseY = offsetY + worldMouseY * MINIMAP_SCALE;
        
        // Draw cursor crosshair
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Vertical line
        ctx.moveTo(minimapMouseX, Math.max(0, minimapMouseY - 8));
        ctx.lineTo(minimapMouseX, Math.min(MINIMAP_HEIGHT, minimapMouseY + 8));
        // Horizontal line  
        ctx.moveTo(Math.max(0, minimapMouseX - 8), minimapMouseY);
        ctx.lineTo(Math.min(MINIMAP_WIDTH, minimapMouseX + 8), minimapMouseY);
        ctx.stroke();
        
        // Draw small circle at cursor position
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(minimapMouseX, minimapMouseY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [map, camera, selectedIds, hoveredId, mousePosition, isMouseOverCanvas, minimapConstants]);

  // Handle click to navigate
  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    const { scale: MINIMAP_SCALE, offsetX, offsetY } = minimapConstants;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert minimap coordinates to world coordinates (accounting for centering offset)
    const worldX = (clickX - offsetX) / MINIMAP_SCALE;
    const worldY = (clickY - offsetY) / MINIMAP_SCALE;

    // Update camera to center on clicked position
    const canvasElement = document.querySelector('.editor-canvas') as HTMLCanvasElement;
    const viewportWidth = canvasElement ? canvasElement.clientWidth : 800;
    const viewportHeight = canvasElement ? canvasElement.clientHeight : 600;

    // Center the view on the clicked position
    const newX = worldX - (viewportWidth / 2) / camera.zoom;
    const newY = worldY - (viewportHeight / 2) / camera.zoom;

    // Clamp to valid bounds
    const maxX = Math.max(0, map.meta.canvasSize.width - viewportWidth / camera.zoom);
    const maxY = Math.max(0, map.meta.canvasSize.height - viewportHeight / camera.zoom);

    setCamera({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY)),
      zoom: camera.zoom
    });
  }, [minimapConstants, camera.zoom, setCamera, map.meta.canvasSize.width, map.meta.canvasSize.height]);

  // Set up canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = MINIMAP_WIDTH;
    canvas.height = MINIMAP_HEIGHT;
  }, []);

  // Track mouse position on main canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => {
      setIsMouseOverCanvas(true);
    };

    const handleMouseLeave = () => {
      setIsMouseOverCanvas(false);
    };

    const canvasElement = document.querySelector('.editor-canvas') as HTMLCanvasElement;
    if (canvasElement) {
      canvasElement.addEventListener('mousemove', handleMouseMove);
      canvasElement.addEventListener('mouseenter', handleMouseEnter);
      canvasElement.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        canvasElement.removeEventListener('mousemove', handleMouseMove);
        canvasElement.removeEventListener('mouseenter', handleMouseEnter);
        canvasElement.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  // Redraw when dependencies change
  useEffect(() => {
    drawMinimap();
  }, [drawMinimap]);

  return (
    <div className="minimap-container">
      <h3>Minimap</h3>
      <canvas
        ref={canvasRef}
        className="editor-minimap-canvas"
        onClick={handleMinimapClick}
        style={{
          border: '1px solid #333',
          cursor: 'pointer',
          display: 'block'
        }}
      />
    </div>
  );
};

export default Minimap;