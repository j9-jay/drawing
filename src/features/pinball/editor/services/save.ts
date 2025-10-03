import { EditorMapJson } from '../../../shared/types/editorMap';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Save map to server or download as fallback
export async function saveMap(mapJson: EditorMapJson): Promise<void> {
  const jsonString = JSON.stringify(mapJson, null, 2);

  try {
    // Try to save to development server first
    const response = await fetch(`${API_URL}/api/pinball/maps/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: mapJson.meta.name,
        json: jsonString
      }),
    });

    if (response.ok) {
      return;
    } else {
      throw new Error(`Server save failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Failed to save to server, falling back to download:', error);
    
    // Fallback: download the file
    downloadMapAsFile(mapJson.meta.name, jsonString);
  }
}

// Download map as JSON file
function downloadMapAsFile(mapName: string, jsonString: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(mapName)}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Sanitize filename for safe file system usage
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, '') // Trim underscores from start/end
    .toLowerCase() || 'untitled_map'; // Fallback if empty
}

// Load maps list from server
export async function loadMapsList(): Promise<string[]> {
  try {
    const response = await fetch('${API_URL}/api/pinball/maps/list');
    if (response.ok) {
      const maps = await response.json();
      return maps;
    }
  } catch (error) {
    console.warn('Failed to load maps list from server:', error);
  }
  
  return [];
}

// Load specific map from server
export async function loadMapFromServer(mapName: string): Promise<EditorMapJson | null> {
  try {
    const response = await fetch(`${API_URL}/api/pinball/maps/load/${encodeURIComponent(mapName)}`);
    if (response.ok) {
      const mapJson = await response.json();
      return mapJson;
    }
  } catch (error) {
    console.warn('Failed to load map from server:', error);
  }
  
  return null;
}

// Load map from uploaded file
export function loadMapFromFile(file: File): Promise<EditorMapJson> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const mapJson = JSON.parse(jsonString) as EditorMapJson;
        
        // Basic validation
        if (!mapJson.meta || !mapJson.objects || !Array.isArray(mapJson.objects)) {
          throw new Error('Invalid map file format');
        }
        
        resolve(mapJson);
      } catch (error) {
        reject(new Error(`Failed to parse map file: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}