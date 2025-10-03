/* eslint-disable no-unused-vars */
import { EditorMapJson, DEFAULT_EDITOR_MAP_META } from '../../../../shared/types/editorMap';

export interface MapState {
  map: EditorMapJson;
}

export interface MapActions {
  setMapName: (name: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  setGridSize: (size: number) => void;
  loadMap: (mapJson: EditorMapJson) => void;
  newMap: () => void;
}

export const createMapSlice = (set: any, get: any) => ({
  // State
  map: {
    meta: { ...DEFAULT_EDITOR_MAP_META },
    objects: []
  } as EditorMapJson,

  // Actions
  setMapName: (name: string) => set((state: any) => ({
    map: {
      ...state.map,
      meta: { ...state.map.meta, name }
    }
  })),

  setCanvasSize: (width: number, height: number) => set((state: any) => ({
    map: {
      ...state.map,
      meta: {
        ...state.map.meta,
        canvasSize: { width, height }
      }
    }
  })),

  setGridSize: (size: number) => set((state: any) => ({
    map: {
      ...state.map,
      meta: { ...state.map.meta, gridSize: size }
    }
  })),

  loadMap: (mapJson: EditorMapJson) => set((state: any) => ({
    map: mapJson,
    selectedIds: new Set(),
    hoveredId: null,
    creationState: {
      isCreating: false,
      tempObject: null,
      step: 0
    }
  })),

  newMap: () => {
    set({
      map: {
        meta: { ...DEFAULT_EDITOR_MAP_META },
        objects: []
      },
      selectedIds: new Set(),
      hoveredId: null,
      creationState: {
        isCreating: false,
        tempObject: null,
        step: 0
      }
    });

    // 새 맵 생성 후 카메라를 화면 가로폭에 맞춰 초기화
    setTimeout(() => {
      const canvasElement = document.querySelector('.editor-canvas') as HTMLCanvasElement;
      if (!canvasElement) return;

      const viewportWidth = canvasElement.clientWidth;
      const currentState = get();
      const mapWidth = currentState.map.meta.canvasSize.width;

      // 화면 가로폭에 맞춰 줌 계산
      const optimalZoom = viewportWidth / mapWidth;


      // 카메라를 가로폭에 맞춰 설정
      currentState.setCamera({
        x: 0, // 왼쪽 시작
        y: 0, // 상단 시작
        zoom: optimalZoom
      });
    }, 50);
  }
});
