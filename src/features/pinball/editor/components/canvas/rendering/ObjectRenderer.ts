import { EditorMapObject } from '../../../../shared/types/editorMap';
import { EditorCamera } from '../../../state/slices/cameraSlice';
import {
  renderBounceCircle as renderBounceCircleShared,
  renderJumpPad as renderJumpPadShared,
  renderBubble as renderBubbleShared,
  renderRotatingBar as renderRotatingBarShared,
  ObjectStyles,
  drawStar
} from '../../../../shared/rendering';

export class ObjectRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  renderObject(obj: EditorMapObject, isSelected: boolean, isHovered: boolean, camera: EditorCamera): void {
    this.ctx.save();

    // Selection/hover styling
    if (isSelected) {
      this.ctx.shadowColor = '#667eea';
      this.ctx.shadowBlur = 10 / camera.zoom;
    } else if (isHovered) {
      this.ctx.shadowColor = '#ffa500';
      this.ctx.shadowBlur = 5 / camera.zoom;
    }

    switch (obj.type) {
      case 'edge':
        this.renderEdge(obj, camera);
        break;
      case 'bubble':
        this.renderBubble(obj, camera);
        break;
      case 'rotatingBar':
        this.renderRotatingBar(obj, camera);
        break;
      case 'bounceCircle':
        this.renderBounceCircle(obj, camera);
        break;
      case 'jumppad':
        this.renderJumpPad(obj, camera);
        break;
      case 'finishLine':
        this.renderFinishLine(obj, camera);
        break;
    }

    this.ctx.restore();
  }

  renderCreationPreview(tempObject: Partial<EditorMapObject>, camera: EditorCamera): void {
    this.ctx.save();
    this.ctx.globalAlpha = 0.6;
    this.ctx.strokeStyle = '#667eea';
    this.ctx.fillStyle = '#667eea44';
    this.ctx.lineWidth = 2 / camera.zoom;
    this.ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);

    switch (tempObject.type) {
      case 'edge':
        if (tempObject.vertices && tempObject.vertices.length >= 1) {
          // Draw vertices
          this.ctx.fillStyle = '#667eea';
          tempObject.vertices.forEach(vertex => {
            this.ctx.beginPath();
            this.ctx.arc(vertex.x, vertex.y, 4 / camera.zoom, 0, Math.PI * 2);
            this.ctx.fill();
          });

          // Draw lines if more than one vertex
          if (tempObject.vertices.length >= 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(tempObject.vertices[0].x, tempObject.vertices[0].y);
            for (let i = 1; i < tempObject.vertices.length; i++) {
              this.ctx.lineTo(tempObject.vertices[i].x, tempObject.vertices[i].y);
            }
            this.ctx.stroke();
          }
        }
        break;
      case 'bubble':
        if (tempObject.center && tempObject.radius) {
          // 게임과 동일한 분홍색 사용
          this.ctx.fillStyle = ObjectStyles.bubble.gradient[0].color + '88'; // 반투명
          this.ctx.strokeStyle = ObjectStyles.bubble.strokeColor;
          this.ctx.beginPath();
          this.ctx.arc(tempObject.center.x, tempObject.center.y, tempObject.radius, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
        }
        break;
      case 'rotatingBar':
        if (tempObject.pivot && tempObject.length && tempObject.thickness) {
          // 게임과 동일한 파란색 사용
          this.ctx.fillStyle = ObjectStyles.rotatingBar.fillColor + '88'; // 반투명
          this.ctx.strokeStyle = ObjectStyles.rotatingBar.strokeColor;
          const halfLength = tempObject.length / 2;
          const halfThickness = tempObject.thickness / 2;
          this.ctx.fillRect(
            tempObject.pivot.x - halfLength,
            tempObject.pivot.y - halfThickness,
            tempObject.length,
            tempObject.thickness
          );
          this.ctx.strokeRect(
            tempObject.pivot.x - halfLength,
            tempObject.pivot.y - halfThickness,
            tempObject.length,
            tempObject.thickness
          );
        }
        break;
      case 'bounceCircle':
        if (tempObject.position && tempObject.radius) {
          this.ctx.save();
          this.ctx.globalAlpha = 0.7;
          renderBounceCircleShared(this.ctx, tempObject.position.x, tempObject.position.y, tempObject.radius);
          this.ctx.restore();
        }
        break;
      case 'jumppad':
        if (tempObject.position && tempObject.shape && tempObject.shape.width && tempObject.shape.height) {
          this.ctx.save();
          this.ctx.globalAlpha = 0.7;
          renderJumpPadShared(this.ctx, tempObject.position.x, tempObject.position.y, tempObject.shape.width, tempObject.shape.height);
          this.ctx.restore();
        }
        break;
      case 'finishLine':
        if (tempObject.a) {
          if (tempObject.b && (Math.abs(tempObject.a.x - tempObject.b.x) > 1 || Math.abs(tempObject.a.y - tempObject.b.y) > 1)) {
            this.ctx.beginPath();
            this.ctx.moveTo(tempObject.a.x, tempObject.a.y);
            this.ctx.lineTo(tempObject.b.x, tempObject.b.y);
            this.ctx.stroke();
          } else {
            this.ctx.beginPath();
            this.ctx.arc(tempObject.a.x, tempObject.a.y, 5 / camera.zoom, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
        break;
    }

    this.ctx.restore();
  }

  private renderEdge(edge: EditorMapObject & { type: 'edge' }, camera: EditorCamera): void {
    if (edge.vertices.length < 2) return;

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3 / camera.zoom;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(edge.vertices[0].x, edge.vertices[0].y);
    for (let i = 1; i < edge.vertices.length; i++) {
      this.ctx.lineTo(edge.vertices[i].x, edge.vertices[i].y);
    }
    this.ctx.stroke();

    // Render vertices
    this.ctx.fillStyle = '#667eea';
    edge.vertices.forEach(vertex => {
      this.ctx.beginPath();
      this.ctx.arc(vertex.x, vertex.y, 3 / camera.zoom, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private renderBubble(bubble: EditorMapObject & { type: 'bubble' }, camera: EditorCamera): void {
    // 통합 렌더링 시스템 사용
    this.ctx.save();
    renderBubbleShared(this.ctx, bubble.center.x, bubble.center.y, bubble.radius, false, 0);
    this.ctx.restore();
  }

  private renderRotatingBar(bar: EditorMapObject & { type: 'rotatingBar' }, camera: EditorCamera): void {
    // 통합 렌더링 시스템 사용 - angle은 0으로 설정 (에디터에서는 정적 표시)
    this.ctx.save();
    renderRotatingBarShared(this.ctx, bar.pivot.x, bar.pivot.y, bar.length, bar.thickness, 0);
    this.ctx.restore();

    // 에디터 전용 방향 표시자 유지
    const indicatorRadius = Math.max(bar.length, bar.thickness) * 0.6;
    const speed = Math.abs(bar.angularSpeed);

    // Calculate number of dots based on speed
    let dotCount = 12;
    if (speed <= 0.09) {
      dotCount = 8;
    } else if (speed >= 1.5) {
      dotCount = 16;
    }

    this.ctx.fillStyle = bar.angularSpeed > 0 ? '#00ff00' : '#ff0000';

    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2;
      const dotX = bar.pivot.x + Math.cos(angle) * indicatorRadius;
      const dotY = bar.pivot.y + Math.sin(angle) * indicatorRadius;

      this.ctx.beginPath();
      this.ctx.arc(dotX, dotY, 2 / camera.zoom, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private renderBounceCircle(bounceCircle: EditorMapObject & { type: 'bounceCircle' }, camera: EditorCamera): void {
    this.ctx.save();
    this.ctx.lineWidth = 2 / camera.zoom;
    renderBounceCircleShared(this.ctx, bounceCircle.position.x, bounceCircle.position.y, bounceCircle.radius);
    this.ctx.restore();
  }

  private renderJumpPad(jumppad: EditorMapObject & { type: 'jumppad' }, camera: EditorCamera): void {
    this.ctx.save();
    this.ctx.lineWidth = 3 / camera.zoom;
    renderJumpPadShared(this.ctx, jumppad.position.x, jumppad.position.y, jumppad.shape.width, jumppad.shape.height);
    this.ctx.restore();
  }

  private renderFinishLine(finishLine: EditorMapObject & { type: 'finishLine' }, camera: EditorCamera): void {
    const thickness = finishLine.thickness ?? 6;

    // Create checkered pattern
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = thickness / camera.zoom;
    this.ctx.lineCap = 'butt';

    this.ctx.beginPath();
    this.ctx.moveTo(finishLine.a.x, finishLine.a.y);
    this.ctx.lineTo(finishLine.b.x, finishLine.b.y);
    this.ctx.stroke();

    // White stripes
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = (thickness * 0.8) / camera.zoom;
    this.ctx.setLineDash([10 / camera.zoom, 10 / camera.zoom]);

    this.ctx.beginPath();
    this.ctx.moveTo(finishLine.a.x, finishLine.a.y);
    this.ctx.lineTo(finishLine.b.x, finishLine.b.y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
  }
}