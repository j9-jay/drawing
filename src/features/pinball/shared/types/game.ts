import { Body } from 'planck';

export interface Participant {
  name: string;
  weight: number;
}

export interface Marble {
  name: string;
  body?: Body;
  position: { x: number; y: number };
  size: number;
  color: string;
  isPreview: boolean;
  finished: boolean;
  finishTime?: number;
}

// Legacy Wall and Obstacle types moved to gameObjects.ts

export interface LeaderboardItem {
  name: string;
  rank: number;
  position: number;
  finished: boolean;
  color: string;
}

export type GameState = 'idle' | 'running' | 'finished';
export type WinnerMode = 'first' | 'last' | 'custom' | 'topN';

export interface GameSettings {
  participants: Participant[];
  winnerMode: WinnerMode;
  customRank: number;
  topNCount: number;
  timeScale?: number;
}

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}