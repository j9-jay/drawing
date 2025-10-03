import { EditorCamera } from '../slices/cameraSlice';

export interface CameraActions {
  openEditor: () => void;
  closeEditor: () => void;
}

export const createCameraActions = (set: any, get: any): CameraActions => ({
  openEditor: () => {
    set({ isOpen: true });

    // Wait for DOM to be ready, then set camera
    setTimeout(() => {
      const canvasAreaElement = document.querySelector('.editor-canvas') as HTMLCanvasElement;
      if (!canvasAreaElement) {
        return;
      }

      const viewportWidth = canvasAreaElement.clientWidth;

      // Get current state
      const currentState = get();

      // Calculate zoom to fit map width exactly to screen width
      const mapWidth = currentState.map.meta.canvasSize.width;
      const optimalZoom = viewportWidth / mapWidth;

      // Set camera to show map centered horizontally, start at top of grid
      const newCamera: EditorCamera = {
        x: (mapWidth - viewportWidth / optimalZoom) / 2, // Center horizontally
        y: 100, // Start 100px from top to hide empty space
        zoom: optimalZoom
      };

      // Update camera with proper values
      currentState.setCamera(newCamera);
    }, 100);
  },

  closeEditor: () => set({ isOpen: false })
});
