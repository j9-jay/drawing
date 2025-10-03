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

export const createSettingsSlice = (set: any) => ({
  // State
  settings: { ...DEFAULT_SETTINGS },

  // Actions
  toggleGrid: () => set((state: any) => ({
    settings: {
      ...state.settings,
      gridVisible: !state.settings.gridVisible
    }
  })),

  toggleGridSnap: () => set((state: any) => ({
    settings: {
      ...state.settings,
      gridSnap: !state.settings.gridSnap
    }
  })),

  toggleVertexSnap: () => set((state: any) => ({
    settings: {
      ...state.settings,
      vertexSnap: !state.settings.vertexSnap
    }
  })),

  setSnapThreshold: (threshold: number) => set((state: any) => ({
    settings: {
      ...state.settings,
      snapThreshold: threshold
    }
  }))
});
