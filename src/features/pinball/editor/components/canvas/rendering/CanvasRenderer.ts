import { EditorMapObject, EditorMapMeta, Vec2 } from '../../../../../shared/types/editorMap';
import { EditorCamera } from '../../../state/slices/cameraSlice';
import { Grid } from '../../../../platform/Grid';
import { ObjectRenderer } from './ObjectRenderer';
import { HandleRenderer } from './HandleRenderer';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private objectRenderer: ObjectRenderer;
  private handleRenderer: HandleRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
    this.objectRenderer = new ObjectRenderer(this.ctx);
    this.handleRenderer = new HandleRenderer(this.ctx);
  }

  render(
    objects: EditorMapObject[],
    selectedIds: Set<string>,
    hoveredId: string | null,
    camera: EditorCamera,
    settings: any,
    mapMeta: EditorMapMeta,
    creationState: any
  ): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    // Apply camera transform: scale first, then translate
    this.ctx.scale(camera.zoom, camera.zoom);
    this.ctx.translate(-camera.x, -camera.y);

    // Render grid
    Grid.render(
      this.ctx,
      mapMeta.gridSize,
      camera,
      this.canvas.width,
      this.canvas.height,
      settings.gridVisible,
      mapMeta.canvasSize.width,
      mapMeta.canvasSize.height
    );

    // Render objects
    objects.forEach(obj => {
      const isSelected = selectedIds.has(obj.id);
      const isHovered = hoveredId === obj.id;
      this.objectRenderer.renderObject(obj, isSelected, isHovered, camera);
    });

    // Render creation preview
    if (creationState.isCreating && creationState.tempObject) {
      this.objectRenderer.renderCreationPreview(creationState.tempObject, camera);
    }

    // Render spawn point
    this.renderSpawnPoint(mapMeta.spawnPoint, camera);

    // Render selection handles
    if (selectedIds.size > 0) {
      this.handleRenderer.renderSelectionHandles(objects, selectedIds, camera);
    }

    this.ctx.restore();
  }

  private renderSpawnPoint(spawnPoint: Vec2 | undefined, camera: EditorCamera): void {
    if (!spawnPoint) return;

    this.ctx.save();

    // Draw marble representation
    const marbleRadius = 15;

    // Outer glow
    this.ctx.shadowColor = '#FFD700';
    this.ctx.shadowBlur = 15 / camera.zoom;

    // Marble gradient
    const gradient = this.ctx.createRadialGradient(
      spawnPoint.x - 5, spawnPoint.y - 5, 0,
      spawnPoint.x, spawnPoint.y, marbleRadius
    );
    gradient.addColorStop(0, '#FFE55C');
    gradient.addColorStop(0.7, '#FFD700');
    gradient.addColorStop(1, '#DAA520');

    // Draw marble
    this.ctx.beginPath();
    this.ctx.arc(spawnPoint.x, spawnPoint.y, marbleRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Marble outline
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = '#B8860B';
    this.ctx.lineWidth = 2 / camera.zoom;
    this.ctx.stroke();

    // Draw "SPAWN" label
    this.ctx.fillStyle = '#333';
    this.ctx.font = `bold ${16 / camera.zoom}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('SPAWN', spawnPoint.x, spawnPoint.y + marbleRadius + 20 / camera.zoom);

    this.ctx.restore();
  }
}