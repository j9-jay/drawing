/**
 * 회전 속도 및 물리 상수
 */

// 속도 프리셋 (rad/s)
export const SPIN_SPEEDS = {
  WEAK: 8,      // 느린 회전 (~1.3 RPS)
  NORMAL: 15,   // 보통 회전 (~2.4 RPS)
  STRONG: 25    // 빠른 회전 (~4.0 RPS)
} as const;

// 물리 상수
export const FRICTION_COEFFICIENT = 0.98; // 감속 계수 (매 프레임 곱)
export const STOP_THRESHOLD = 0.05;       // 정지 판단 임계값 (rad/s)
export const MIN_ROTATION_CYCLES = 3;     // 최소 3바퀴 회전 보장

// 60FPS 기준 deltaTime
export const TARGET_FPS = 60;
export const FIXED_DELTA_TIME = 1 / TARGET_FPS; // ~0.0167s

// 감속 단계 전환 임계값
export const DECELERATION_THRESHOLD = 0.8; // 초기 속도의 80%
