/**
 * Static Map Loader
 * Loads map files via static imports (bundled at build time)
 *
 * 맵 추가 방법:
 * 1. data/pinball/maps/에 새 JSON 파일 추가 (예: awesome_map.json)
 * 2. 아래 import 추가
 * 3. MAP_IMPORTS 배열에 추가
 * 끝! displayName과 difficulty는 자동 생성됨
 */

import { EditorMapJson } from '../types/editorMap';

// ==========================================
// 맵 추가 시 여기만 수정하세요
// ==========================================

// 1. Import 추가
import defaultMap from '@/../data/pinball/maps/default.json';
import marbleCascadeMap from '@/../data/pinball/maps/marble_cascade.json';
import plinkDropMap from '@/../data/pinball/maps/plinko_drop.json';

// 2. 배열에 추가
const MAP_IMPORTS = [
  defaultMap,
  marbleCascadeMap,
  plinkDropMap
] as const;

// ==========================================
// 이 아래는 수정 불필요
// ==========================================

export interface StaticMapInfo {
  name: string;
  displayName: string;
  data: EditorMapJson;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Helper: Convert snake_case to Title Case
 * Example: "marble_cascade" → "Marble Cascade"
 */
function formatDisplayName(name: string): string {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Helper: Infer difficulty from map name (fallback logic)
 */
function inferDifficulty(name: string): 'easy' | 'medium' | 'hard' | undefined {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('easy') || lowerName === 'default') return 'easy';
  if (lowerName.includes('hard') || lowerName.includes('extreme')) return 'hard';
  return 'medium'; // Default to medium
}

/**
 * Build static map registry from imports
 * Automatically generates displayName and difficulty
 */
const STATIC_MAPS: StaticMapInfo[] = MAP_IMPORTS.map((mapData) => {
  const data = mapData as EditorMapJson;
  const meta = data.meta;

  return {
    name: meta.name,
    displayName: meta.displayName || formatDisplayName(meta.name),
    difficulty: meta.difficulty || inferDifficulty(meta.name),
    data
  };
});

/**
 * Static Map Loader Class
 */
export class StaticMapLoader {
  /**
   * Get all available maps info (without full data)
   */
  static getAllMapInfo(): Omit<StaticMapInfo, 'data'>[] {
    return STATIC_MAPS.map(({ name, displayName, difficulty }) => ({
      name,
      displayName,
      difficulty
    }));
  }

  /**
   * Get all available maps with data
   */
  static getAllMaps(): StaticMapInfo[] {
    return STATIC_MAPS;
  }

  /**
   * Get map by name
   * @param name - Map identifier
   * @returns Map data or null if not found
   */
  static getMapByName(name: string): EditorMapJson | null {
    const map = STATIC_MAPS.find(m => m.name === name);
    return map ? map.data : null;
  }

  /**
   * Get map names only
   */
  static getMapNames(): string[] {
    return STATIC_MAPS.map(m => m.name);
  }

  /**
   * Get default map (first in list)
   */
  static getDefaultMap(): EditorMapJson {
    return STATIC_MAPS[0].data;
  }

  /**
   * Check if map exists
   */
  static hasMap(name: string): boolean {
    return STATIC_MAPS.some(m => m.name === name);
  }

  /**
   * Get map count
   */
  static getMapCount(): number {
    return STATIC_MAPS.length;
  }
}
