import { EditorMapJson } from '../../shared/types/editorMap';

/**
 * Save map by downloading as JSON file
 * No server storage - developer must manually add to data/pinball/maps/
 */
export function saveMap(mapJson: EditorMapJson): void {
  const jsonString = JSON.stringify(mapJson, null, 2);
  downloadMapAsFile(mapJson.meta.name, jsonString);
}

/**
 * Download map as JSON file
 */
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

/**
 * Sanitize filename for safe file system usage
 * Removes invalid characters and normalizes format
 */
function sanitizeFilename(filename: string): string {
  // Step 1: Replace invalid filesystem characters with underscores
  const replaceInvalidChars = filename.replace(/[<>:"/\\|?*]/g, '_');

  // Step 2: Normalize all spaces to underscores
  const normalizeSpaces = replaceInvalidChars.replace(/\s+/g, '_');

  // Step 3: Collapse multiple consecutive underscores into one
  const collapseUnderscores = normalizeSpaces.replace(/_+/g, '_');

  // Step 4: Trim leading/trailing underscores
  const trimUnderscores = collapseUnderscores.replace(/^_|_$/g, '');

  // Step 5: Convert to lowercase and provide fallback
  const result = trimUnderscores.toLowerCase();

  return result || 'untitled_map';
}

/**
 * Load map from uploaded file
 * Used for importing user-created maps
 */
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

/**
 * Load map from static loader (for editing existing maps)
 */
import { StaticMapLoader } from '../../shared/map/StaticMapLoader';

export function loadStaticMap(mapName: string): EditorMapJson | null {
  return StaticMapLoader.getMapByName(mapName);
}

export function getStaticMapNames(): string[] {
  return StaticMapLoader.getMapNames();
}