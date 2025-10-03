import { EditorMapJson, DEFAULT_EDITOR_MAP_META } from '../../../shared/types/editorMap';

// Create a file input for loading maps
export function createFileLoadDialog(): Promise<EditorMapJson | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      try {
        const mapJson = await loadMapFromFile(file);
        resolve(mapJson);
      } catch (error) {
        console.error('Failed to load map:', error);
        alert(`Failed to load map: ${error}`);
        resolve(null);
      }
    };
    
    input.oncancel = () => {
      resolve(null);
    };
    
    input.click();
  });
}

// Load map from file
async function loadMapFromFile(file: File): Promise<EditorMapJson> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const rawData = JSON.parse(jsonString);
        
        // Basic validation
        const mapJson = validateMap(rawData);
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

// Validate map data
function validateMap(rawData: any): EditorMapJson {
  // Basic structure validation
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid map file: not a valid JSON object');
  }

  // Ensure proper structure
  const mapJson: EditorMapJson = {
    meta: {
      ...DEFAULT_EDITOR_MAP_META,
      ...(rawData.meta || {})
    },
    objects: rawData.objects || []
  };

  // If no spawn point is set, add one at the center-top of the map
  if (!mapJson.meta.spawnPoint) {
    mapJson.meta.spawnPoint = {
      x: mapJson.meta.canvasSize.width / 2,
      y: 300 // Fixed height from top for consistency
    };
  }

  return mapJson;
}

