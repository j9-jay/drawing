/* eslint-disable no-unused-vars */

export interface EditorSettings {
  gridVisible: boolean;
  gridSnap: boolean;
  vertexSnap: boolean;
  snapThreshold: number;
}

export interface SettingsState {
  settings: EditorSettings;
}

export interface SettingsActions {
  toggleGrid: () => void;
  toggleGridSnap: () => void;
  toggleVertexSnap: () => void;
  setSnapThreshold: (threshold: number) => void;
}

const DEFAULT_SETTINGS: EditorSettings = {
  gridVisible: true,
  gridSnap: true,
  vertexSnap: true,
  snapThreshold: 15
};

export const createSettingsSlice = (set: unknown) => ({
  // State
  settings: { ...DEFAULT_SETTINGS },

  // Actions
  toggleGrid: () => set((state: unknown) => ({
    settings: {
      ...state.settings,
      gridVisible: !state.settings.gridVisible
    }
  })),

  toggleGridSnap: () => set((state: unknown) => ({
    settings: {
      ...state.settings,
      gridSnap: !state.settings.gridSnap
    }
  })),

  toggleVertexSnap: () => set((state: unknown) => ({
    settings: {
      ...state.settings,
      vertexSnap: !state.settings.vertexSnap
    }
  })),

  setSnapThreshold: (threshold: number) => set((state: unknown) => ({
    settings: {
      ...state.settings,
      snapThreshold: threshold
    }
  }))
});
