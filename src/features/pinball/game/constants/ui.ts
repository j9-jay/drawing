/**
 * UI and gameplay defaults for the client game.
 */

export const DEFAULT_TIME_SCALE = 0.3;
export const TIME_SCALE_MIN = 0.1;
export const TIME_SCALE_MAX = 0.5;

// 참석자 이름 관련
export const MAX_PARTICIPANT_NAME_LENGTH = 15;  // 참석자 이름 최대 길이
export const MAX_MARBLE_DISPLAY_NAME_LENGTH = 4;     // 구슬에 표시되는 이름 길이
export const MARBLE_NAME_TRUNCATE_THRESHOLD = 5;      // 이름 축약 기준 길이

// 토스트 메시지
export const TOAST_DURATION = 3000;           // 토스트 표시 시간 (ms)
export const TOAST_FADE_DURATION = 500;       // 토스트 페이드 시간 (ms)

// 위너 디스플레이
export const WINNER_DISPLAY_DELAY = 1000;     // 우승자 표시 딜레이 (ms)
export const CONFETTI_DURATION = 5000;        // 폭죽 애니메이션 시간 (ms)
export const CONFETTI_PARTICLE_COUNT = 150;   // 폭죽 파티클 개수

// 리더보드
export const LEADERBOARD_UPDATE_THROTTLE = 100;  // 리더보드 업데이트 쓰로틀 (ms)
export const LEADERBOARD_RANK_EMOJI = ['🥇', '🥈', '🥉'];  // 순위 이모지

// 미니맵
export const MINIMAP_WIDTH = 150;
export const MINIMAP_HEIGHT = 200;
export const MINIMAP_OPACITY = 0.8;
export const MINIMAP_BORDER_COLOR = '#333';
export const MINIMAP_BORDER_WIDTH = 2;
export const MINIMAP_BACKGROUND = 'rgba(0, 0, 0, 0.5)';

// UI 색상
export const UI_COLORS = {
  primary: '#4a9eff',
  secondary: '#ff6b6b',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  background: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  border: '#333333'
} as const;
