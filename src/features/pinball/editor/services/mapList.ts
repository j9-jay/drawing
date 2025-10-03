import { EditorMapJson } from '../../shared/types/editorMap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MapListItem {
  name: string;
  lastModified: string;
  size: number;
}

export async function fetchMapList(): Promise<MapListItem[]> {
  try {
    const response = await fetch(`${API_URL}/api/pinball/maps/list`);
    if (!response.ok) {
      throw new Error(`Failed to fetch map list: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch map list:', error);
    throw error;
  }
}

export async function loadMapFromServer(mapName: string): Promise<EditorMapJson> {
  try {
    const response = await fetch(`${API_URL}/api/pinball/maps/load/${encodeURIComponent(mapName)}`);
    if (!response.ok) {
      throw new Error(`Failed to load map: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load map:', error);
    throw error;
  }
}

export async function deleteMapFromServer(mapName: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/pinball/maps/delete/${encodeURIComponent(mapName)}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete map: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete map:', error);
    throw error;
  }
}