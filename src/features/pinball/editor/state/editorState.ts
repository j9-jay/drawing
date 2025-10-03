import { create } from 'zustand';
import { EditorMapJson, EditorMapObject } from '../../../shared/types/editorMap';
import { createMapSlice } from './slices/mapSlice';
import { createCameraSlice, EditorCamera } from './slices/cameraSlice';
import { createSelectionSlice } from './slices/selectionSlice';
import { createSettingsSlice, EditorSettings } from './slices/settingsSlice';
import { createToolSlice, Tool } from './slices/toolSlice';
import { createObjectActions } from './actions/objectActions';


export type EditorState = {
  // Modal visibility
  isOpen: boolean;
  
  // Map data
  map: EditorMapJson;
  
  // Tool state
  currentTool: Tool;
  
  // Selection
  selectedIds: Set<string>;
  hoveredId: string | null;
  
  // Camera
  camera: EditorCamera;
  
  // Settings
  settings: EditorSettings;
  
  // Temporary state for object creation
  creationState: {
    isCreating: boolean;
    tempObject: Partial<EditorMapObject> | null;
    step: number; // for multi-step creation (like edge vertices)
  };
  
  // Actions
  openEditor: () => void;
  closeEditor: () => void;
  
  // Map operations
  setMapName: (name: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  setGridSize: (size: number) => void;
  
  // Tool operations
  setTool: (tool: Tool) => void;
  
  // Selection operations
  selectObject: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  
  // Object operations (with history)
  addObject: (object: EditorMapObject) => void;
  updateObject: (id: string, updates: Partial<EditorMapObject>) => void;
  deleteObject: (id: string) => void;
  deleteSelected: () => void;
  
  // Camera operations
  setCamera: (camera: Partial<EditorCamera>) => void;
  resetCamera: () => void;
  
  // Settings operations
  toggleGrid: () => void;
  toggleGridSnap: () => void;
  toggleVertexSnap: () => void;
  setSnapThreshold: (threshold: number) => void;
  
  // Creation state operations
  startCreation: (tempObject?: Partial<EditorMapObject>) => void;
  updateCreation: (updates: Partial<EditorMapObject>) => void;
  finishCreation: () => void;
  cancelCreation: () => void;
  
  // Map loading/clearing
  loadMap: (mapJson: EditorMapJson) => void;
  newMap: () => void;
};


export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  isOpen: false,
  
  // Actions
  openEditor: () => {
    set({ isOpen: true });

    // 에디터 열렸을 때 카메라 초기화
    setTimeout(() => {
      const canvasElement = document.querySelector('.editor-canvas') as HTMLCanvasElement;
      if (!canvasElement) return;

      const viewportWidth = canvasElement.clientWidth;
      const currentState = get();
      const mapWidth = currentState.map.meta.canvasSize.width;

      // 화면 가로폭에 맞춰 줌 계산
      const optimalZoom = viewportWidth / mapWidth;

      // 카메라를 가로폭에 맞춰 초기화
      currentState.setCamera({
        x: 0, // 왼쪽 시작
        y: 0, // 상단 시작
        zoom: optimalZoom
      });
    }, 100);
  },
  closeEditor: () => set({ isOpen: false }),
  
  
  
  
  

  // Slice integrations
  ...createMapSlice(set, get),
  ...createCameraSlice(set),
  ...createSelectionSlice(set),
  ...createSettingsSlice(set),
  ...createToolSlice(set),
  ...createObjectActions(set, get)
}));
