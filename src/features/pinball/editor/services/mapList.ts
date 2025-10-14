/**
 * Map List Service for Editor
 * Uses StaticMapLoader to access bundled maps
 */

import { StaticMapLoader } from '../../shared/map/StaticMapLoader';
import { EditorMapJson } from '../../shared/types/editorMap';

export interface MapListItem {
  name: string;
  displayName: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Get list of available maps from static loader
 */
export function fetchMapList(): MapListItem[] {
  return StaticMapLoader.getAllMapInfo();
}

/**
 * Load specific map for editing
 */
export function loadMapFromStatic(mapName: string): EditorMapJson | null {
  return StaticMapLoader.getMapByName(mapName);
}

/**
 * Delete map - Not supported for static maps
 * Maps must be removed from code and redeployed
 */
export function deleteMapFromServer(mapName: string): never {
  throw new Error('Delete not supported for static maps. Remove from StaticMapLoader.ts and redeploy.');
}