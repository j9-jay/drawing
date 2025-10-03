/* eslint-disable no-unused-vars */

import { EditorMapObject } from '../../../../shared/types/editorMap';
import { undoRedoManager } from '../undoRedo';

export interface ObjectActions {
  addObject: (object: EditorMapObject) => void;
  updateObject: (id: string, updates: Partial<EditorMapObject>) => void;
  deleteObject: (id: string) => void;
  deleteSelected: () => void;
}

export const createObjectActions = (set: any, get: any): ObjectActions => ({
  addObject: (object: EditorMapObject) => {
    const state = get();
    const previousMap = { ...state.map };

    set((state: any) => ({
      map: {
        ...state.map,
        objects: [...state.map.objects, object]
      }
    }));

    const newMap = get().map;
    undoRedoManager.pushAction(`Add ${object.type}`, previousMap, newMap);
  },

  updateObject: (id: string, updates: Partial<EditorMapObject>) => {
    const state = get();
    const previousMap = { ...state.map };
    const objectType = state.map.objects.find((obj: EditorMapObject) => obj.id === id)?.type || 'object';

    set((state: any) => ({
      map: {
        ...state.map,
        objects: state.map.objects.map((obj: EditorMapObject) =>
          obj.id === id ? { ...obj, ...updates } : obj
        )
      }
    }));

    const newMap = get().map;
    undoRedoManager.pushAction(`Update ${objectType}`, previousMap, newMap);
  },

  deleteObject: (id: string) => {
    const state = get();
    const previousMap = { ...state.map };
    const objectType = state.map.objects.find((obj: EditorMapObject) => obj.id === id)?.type || 'object';

    set((state: any) => ({
      map: {
        ...state.map,
        objects: state.map.objects.filter((obj: EditorMapObject) => obj.id !== id)
      },
      selectedIds: new Set([...state.selectedIds].filter(selectedId => selectedId !== id))
    }));

    const newMap = get().map;
    undoRedoManager.pushAction(`Delete ${objectType}`, previousMap, newMap);
  },

  deleteSelected: () => {
    const state = get();
    const { selectedIds } = state;

    if (selectedIds.size === 0) return;

    const previousMap = { ...state.map };
    const objectTypes = state.map.objects
      .filter((obj: EditorMapObject) => selectedIds.has(obj.id))
      .map((obj: EditorMapObject) => obj.type);

    set((state: any) => ({
      map: {
        ...state.map,
        objects: state.map.objects.filter((obj: EditorMapObject) => !selectedIds.has(obj.id))
      },
      selectedIds: new Set()
    }));

    const newMap = get().map;
    const actionDescription = selectedIds.size === 1
      ? `Delete ${objectTypes[0]}`
      : `Delete ${selectedIds.size} objects`;
    undoRedoManager.pushAction(actionDescription, previousMap, newMap);
  }
});
