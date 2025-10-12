/**
 * 룰렛 휠 크기, 색상, 레이아웃 상수
 */

// 휠 크기
export const WHEEL_RADIUS = 300;           // 룰렛 반지름 (px)
export const CENTER_CIRCLE_RADIUS = 30;    // 중앙 원 반지름
export const WHEEL_BORDER_WIDTH = 5;       // 테두리 두께

// 포인터 (화살표) - 3시 방향
export const POINTER_SIZE = 40;
export const POINTER_COLOR = '#FFD700';    // 골드
export const POINTER_ANGLE = Math.PI / 2;  // 90° (3시 방향)

// 색상 팔레트 (참가자별 자동 할당)
export const SECTOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24',
  '#F0932B', '#EB4D4B', '#6C5CE7', '#A29BFE',
  '#FD79A8', '#FDCB6E', '#00B894', '#00CEC9',
  '#0984E3', '#FF7675', '#74B9FF', '#A29BFE'
];

// 텍스트 렌더링
export const SECTOR_TEXT_SIZE = 16;        // 폰트 크기
export const SECTOR_TEXT_COLOR = '#FFFFFF';
export const SECTOR_TEXT_RADIUS_RATIO = 0.7; // 텍스트 위치 (반지름의 70%)

// 추가 색상 상수
export const SECTOR_BORDER_COLOR = '#000';
export const WHEEL_OUTER_COLOR = '#FFD700';
export const CENTER_CIRCLE_COLOR = '#1a1a1a';
export const CENTER_CIRCLE_BORDER_COLOR = '#FFD700';
export const EMPTY_WHEEL_FILL_COLOR = 'rgba(255, 255, 255, 0.1)';
export const EMPTY_WHEEL_BORDER_COLOR = '#444';
export const EMPTY_WHEEL_TEXT_COLOR = '#888';
export const POINTER_BORDER_COLOR = '#000';

// 참가자 제한
export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 20;
export const DEFAULT_PARTICIPANT_COUNT = 2;
