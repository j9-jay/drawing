/* eslint-disable no-unused-vars */

import { EditorMapObject } from '../../../shared/types/editorMap';

export type Tool = 'select' | 'edge' | 'bubble' | 'rotatingBar' | 'jumppadRect' | 'bounceCircle' | 'finishLine';

export interface CreationState {
  isCreating: boolean;
  tempObject: Partial<EditorMapObject> | null;
  step: number;
}

export interface ToolState {
  currentTool: Tool;
  creationState: CreationState;
}

export interface ToolActions {
  setTool: (tool: Tool) => void;
  startCreation: (tempObject?: Partial<EditorMapObject>) => void;
  updateCreation: (updates: Partial<EditorMapObject>) => void;
  finishCreation: () => void;
  cancelCreation: () => void;
}

export const createToolSlice = (set: any) => ({
  // State
  currentTool: 'select' as Tool,
  creationState: {
    isCreating: false,
    tempObject: null,
    step: 0
  } as CreationState,

  // Actions
  setTool: (tool: Tool) => set({
    currentTool: tool,
    creationState: {
      isCreating: false,
      tempObject: null,
      step: 0
    }
  }),

  startCreation: (tempObject?: Partial<EditorMapObject>) => set({
    creationState: {
      isCreating: true,
      tempObject: tempObject || null,
      step: 0
    }
  }),

  updateCreation: (updates: Partial<EditorMapObject>) => set((state: any) => ({
    creationState: {
      ...state.creationState,
      tempObject: state.creationState.tempObject
        ? { ...state.creationState.tempObject, ...updates }
        : updates
    }
  })),

  finishCreation: () => set({
    creationState: {
      isCreating: false,
      tempObject: null,
      step: 0
    }
  }),

  cancelCreation: () => set({
    creationState: {
      isCreating: false,
      tempObject: null,
      step: 0
    }
  })
});
