import { EditorMapObject } from '../../../../shared/types/editorMap';
import { EditorCamera } from '../../../state/slices/cameraSlice';
import { getRotatingBarSpeedPresetFromState } from '../../../../shared/utils/rotatingBarSpeed';

export class HandleRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  renderSelectionHandles(objects: EditorMapObject[], selectedIds: Set<string>, camera: EditorCamera): void {
    selectedIds.forEach(id => {
      const obj = objects.find(o => o.id === id);
      if (!obj) return;

      this.ctx.save();
      this.ctx.strokeStyle = '#4CAF50';
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.lineWidth = 1 / camera.zoom;

      switch (obj.type) {
        case 'edge':
          this.renderEdgeHandles(obj, camera);
          break;
        case 'bubble':
          this.renderBubbleHandles(obj, camera);
          break;
        case 'rotatingBar':
          this.renderRotatingBarHandles(obj, camera);
          break;
        case 'jumppad':
          this.renderJumpPadHandles(obj, camera);
          break;
        case 'bounceCircle':
          this.renderBounceCircleHandles(obj, camera);
          break;
        case 'finishLine':
          this.renderFinishLineHandles(obj, camera);
          break;
      }

      this.ctx.restore();
    });
  }

  private renderEdgeHandles(edge: EditorMapObject & { type: 'edge' }, camera: EditorCamera): void {
    // Draw vertex handles
    edge.vertices.forEach(vertex => {
      this.ctx.beginPath();
      this.ctx.arc(vertex.x, vertex.y, 6 / camera.zoom, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.stroke();
      this.ctx.strokeStyle = '#4CAF50';
    });
  }

  private renderBubbleHandles(bubble: EditorMapObject & { type: 'bubble' }, camera: EditorCamera): void {
    // Draw single resize handle with arrow indicator
    const handleX = bubble.center.x + bubble.radius;
    const handleY = bubble.center.y;

    // Draw bidirectional arrow
    this.ctx.save();
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2 / camera.zoom;
    this.ctx.fillStyle = '#4CAF50';

    const arrowSize = 8 / camera.zoom;
    // Left arrow
    this.ctx.beginPath();
    this.ctx.moveTo(handleX - arrowSize * 2, handleY);
    this.ctx.lineTo(handleX - arrowSize, handleY - arrowSize/2);
    this.ctx.lineTo(handleX - arrowSize, handleY + arrowSize/2);
    this.ctx.closePath();
    this.ctx.fill();

    // Right arrow
    this.ctx.beginPath();
    this.ctx.moveTo(handleX + arrowSize * 2, handleY);
    this.ctx.lineTo(handleX + arrowSize, handleY - arrowSize/2);
    this.ctx.lineTo(handleX + arrowSize, handleY + arrowSize/2);
    this.ctx.closePath();
    this.ctx.fill();

    // Connecting line
    this.ctx.beginPath();
    this.ctx.moveTo(handleX - arrowSize, handleY);
    this.ctx.lineTo(handleX + arrowSize, handleY);
    this.ctx.stroke();

    // Draw handle circle
    this.ctx.beginPath();
    this.ctx.arc(handleX, handleY, 6 / camera.zoom, 0, Math.PI * 2);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1 / camera.zoom;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private renderRotatingBarHandles(bar: EditorMapObject & { type: 'rotatingBar' }, camera: EditorCamera): void {
    // Draw resize handle at the right end of the bar
    const resizeHandleX = bar.pivot.x + bar.length / 2;
    const resizeHandleY = bar.pivot.y;

    this.ctx.save();
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2 / camera.zoom;
    this.ctx.fillStyle = '#4CAF50';

    // Draw bidirectional arrow for resize
    const arrowSize = 8 / camera.zoom;
    // Left arrow
    this.ctx.beginPath();
    this.ctx.moveTo(resizeHandleX - arrowSize * 2, resizeHandleY);
    this.ctx.lineTo(resizeHandleX - arrowSize, resizeHandleY - arrowSize/2);
    this.ctx.lineTo(resizeHandleX - arrowSize, resizeHandleY + arrowSize/2);
    this.ctx.closePath();
    this.ctx.fill();

    // Right arrow
    this.ctx.beginPath();
    this.ctx.moveTo(resizeHandleX + arrowSize * 2, resizeHandleY);
    this.ctx.lineTo(resizeHandleX + arrowSize, resizeHandleY - arrowSize/2);
    this.ctx.lineTo(resizeHandleX + arrowSize, resizeHandleY + arrowSize/2);
    this.ctx.closePath();
    this.ctx.fill();

    // Connecting line
    this.ctx.beginPath();
    this.ctx.moveTo(resizeHandleX - arrowSize, resizeHandleY);
    this.ctx.lineTo(resizeHandleX + arrowSize, resizeHandleY);
    this.ctx.stroke();

    // Draw handle circle
    this.ctx.beginPath();
    this.ctx.arc(resizeHandleX, resizeHandleY, 6 / camera.zoom, 0, Math.PI * 2);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1 / camera.zoom;
    this.ctx.stroke();
    this.ctx.restore();

    // Draw direction and speed controls
    this.renderRotatingBarControls(bar, camera);
  }

  private renderRotatingBarControls(bar: EditorMapObject & { type: 'rotatingBar' }, camera: EditorCamera): void {
    // Draw direction toggle button (below and left of the bar)
    const dirHandleX = bar.pivot.x - 25;
    const dirHandleY = bar.pivot.y + 50;

    // Draw circular direction indicator arrow wrapping around the button (bottom arc only)
    this.ctx.strokeStyle = bar.angularSpeed > 0 ? '#00ff00' : '#ff0000';
    this.ctx.lineWidth = 2 / camera.zoom;
    this.ctx.fillStyle = bar.angularSpeed > 0 ? '#00ff00' : '#ff0000';

    const circularArrowRadius = 12 / camera.zoom;
    const arrowHeadSize = 7 / camera.zoom;

    // Draw bottom arc showing rotation direction
    const startAngle = Math.PI * 0.79; // Bottom left
    const endAngle = Math.PI * 0.21;   // Bottom right

    this.ctx.beginPath();
    this.ctx.arc(dirHandleX, dirHandleY, circularArrowRadius, startAngle, endAngle, false);
    this.ctx.stroke();

    // Draw arrow head at the end of the arc pointing in rotation direction
    if (bar.angularSpeed > 0) {
      // Clockwise - arrow at right end pointing clockwise
      const arrowX = dirHandleX + circularArrowRadius * Math.cos(endAngle);
      const arrowY = dirHandleY + circularArrowRadius * Math.sin(endAngle);
      const headAngle = endAngle - Math.PI * 0.5;

      this.ctx.beginPath();
      this.ctx.moveTo(arrowX, arrowY);
      this.ctx.lineTo(
        arrowX + arrowHeadSize * Math.cos(headAngle - 0.4),
        arrowY + arrowHeadSize * Math.sin(headAngle - 0.4)
      );
      this.ctx.lineTo(
        arrowX + arrowHeadSize * Math.cos(headAngle + 0.4),
        arrowY + arrowHeadSize * Math.sin(headAngle + 0.4)
      );
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      // Counter-clockwise - arrow at left end pointing counter-clockwise
      const arrowX = dirHandleX + circularArrowRadius * Math.cos(startAngle);
      const arrowY = dirHandleY + circularArrowRadius * Math.sin(startAngle);
      const headAngle = startAngle + Math.PI * 0.5;

      this.ctx.beginPath();
      this.ctx.moveTo(arrowX, arrowY);
      this.ctx.lineTo(
        arrowX + arrowHeadSize * Math.cos(headAngle - 0.4),
        arrowY + arrowHeadSize * Math.sin(headAngle - 0.4)
      );
      this.ctx.lineTo(
        arrowX + arrowHeadSize * Math.cos(headAngle + 0.4),
        arrowY + arrowHeadSize * Math.sin(headAngle + 0.4)
      );
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Draw direction toggle button circle
    this.ctx.beginPath();
    this.ctx.arc(dirHandleX, dirHandleY, 8 / camera.zoom, 0, Math.PI * 2);
    this.ctx.fillStyle = bar.angularSpeed > 0 ? '#00ff00' : '#ff0000';
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1 / camera.zoom;
    this.ctx.stroke();

    // Draw speed control button (below and right of the bar)
    const speedHandleX = bar.pivot.x + 25;
    const speedHandleY = bar.pivot.y + 50;
    const preset = getRotatingBarSpeedPresetFromState(bar.speedLevel, bar.angularSpeed);

    // Draw speed button circle
    this.ctx.beginPath();
    this.ctx.arc(speedHandleX, speedHandleY, 8 / camera.zoom, 0, Math.PI * 2);
    this.ctx.fillStyle = preset.color;
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1 / camera.zoom;
    this.ctx.stroke();

    // Draw speed level text
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `${12 / camera.zoom}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(preset.label, speedHandleX, speedHandleY);
  }

  private renderJumpPadHandles(jumppad: EditorMapObject & { type: 'jumppad' }, camera: EditorCamera): void {
    const handleX = jumppad.position.x + (jumppad.shape.width || 160) / 2;
    const handleY = jumppad.position.y;
    this.renderResizeHandle(handleX, handleY, camera);
  }

  private renderBounceCircleHandles(bounceCircle: EditorMapObject & { type: 'bounceCircle' }, camera: EditorCamera): void {
    const handleX = bounceCircle.position.x + bounceCircle.radius;
    const handleY = bounceCircle.position.y;
    this.renderResizeHandle(handleX, handleY, camera);
  }

  private renderFinishLineHandles(finishLine: EditorMapObject & { type: 'finishLine' }, camera: EditorCamera): void {
    // Draw end point handles
    [finishLine.a, finishLine.b].forEach(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 6 / camera.zoom, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.stroke();
      this.ctx.strokeStyle = '#4CAF50';
    });
  }

  private renderResizeHandle(handleX: number, handleY: number, camera: EditorCamera): void {
    this.ctx.save();
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2 / camera.zoom;
    this.ctx.fillStyle = '#4CAF50';

    // Draw bidirectional arrow for resize
    const arrowSize = 8 / camera.zoom;
    // Left arrow
    this.ctx.beginPath();
    this.ctx.moveTo(handleX - arrowSize * 2, handleY);
    this.ctx.lineTo(handleX - arrowSize, handleY - arrowSize/2);
    this.ctx.lineTo(handleX - arrowSize, handleY + arrowSize/2);
    this.ctx.closePath();
    this.ctx.fill();

    // Right arrow
    this.ctx.beginPath();
    this.ctx.moveTo(handleX + arrowSize * 2, handleY);
    this.ctx.lineTo(handleX + arrowSize, handleY - arrowSize/2);
    this.ctx.lineTo(handleX + arrowSize, handleY + arrowSize/2);
    this.ctx.closePath();
    this.ctx.fill();

    // Connecting line
    this.ctx.beginPath();
    this.ctx.moveTo(handleX - arrowSize, handleY);
    this.ctx.lineTo(handleX + arrowSize, handleY);
    this.ctx.stroke();

    // Draw handle circle
    this.ctx.beginPath();
    this.ctx.arc(handleX, handleY, 6 / camera.zoom, 0, Math.PI * 2);
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1 / camera.zoom;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
