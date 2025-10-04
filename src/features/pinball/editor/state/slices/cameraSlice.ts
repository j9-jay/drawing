/* eslint-disable no-unused-vars */

export type EditorCamera = {
  x: number;
  y: number;
  zoom: number;
};

export interface CameraState {
  camera: EditorCamera;
}

export interface CameraActions {
  setCamera: (camera: Partial<EditorCamera>) => void;
  resetCamera: () => void;
}

const DEFAULT_CAMERA: EditorCamera = {
  x: 0,
  y: 0,
  zoom: 1
};

export const createCameraSlice = (set: unknown) => ({
  // State
  camera: { ...DEFAULT_CAMERA },

  // Actions
  setCamera: (camera: Partial<EditorCamera>) => set((state: unknown) => ({
    camera: { ...state.camera, ...camera }
  })),

  resetCamera: () => set({
    camera: { ...DEFAULT_CAMERA }
  })
});
