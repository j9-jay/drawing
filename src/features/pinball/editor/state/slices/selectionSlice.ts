/* eslint-disable no-unused-vars */

export interface SelectionState {
  selectedIds: Set<string>;
  hoveredId: string | null;
}

export interface SelectionActions {
  selectObject: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
}

export const createSelectionSlice = (set: unknown) => ({
  // State
  selectedIds: new Set<string>(),
  hoveredId: null as string | null,

  // Actions
  selectObject: (id: string) => set((state) => ({
    selectedIds: new Set([id])
  })),

  selectMultiple: (ids: string[]) => set((state) => ({
    selectedIds: new Set(ids)
  })),

  clearSelection: () => set((state) => ({
    selectedIds: new Set()
  })),

  setHovered: (id: string | null) => set({
    hoveredId: id
  })
});
