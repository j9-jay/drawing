/**
 * 룰렛 게임 타입 정의
 */

// 참가자 정의
export interface Participant {
  name: string;
  weight: number; // 가중치 (1 = 기본, 2 = 2배 확률)
}

// 룰렛 상태
export type RouletteState =
  | 'idle'          // 대기 중 (초기 상태)
  | 'spinning'      // 회전 중 (가속 포함)
  | 'decelerating'  // 감속 중 (마찰 적용)
  | 'stopped';      // 정지 (당첨자 확정)

// 속도 프리셋
export type SpinSpeed = 'WEAK' | 'NORMAL' | 'STRONG';

// 회전 설정
export interface SpinConfig {
  speed: SpinSpeed;         // 선택된 속도
  initialVelocity: number;  // 초기 각속도 (rad/s)
  friction: number;         // 감속 계수 (0.98 = 매 프레임 2% 감소)
  minRotations: number;     // 최소 회전 수 (공정성 보장)
}

// 카메라 상태
export interface CameraState {
  zoom: number;             // 현재 줌 레벨
  targetZoom: number;       // 목표 줌 레벨 (부드러운 전환)
  shakeOffset: {            // 진동 효과 오프셋
    x: number;
    y: number;
  };
}

// 게임 설정 (로컬 스토리지 저장용)
export interface RouletteSettings {
  participants: Participant[];
  defaultSpeed: SpinSpeed;
  lastWinner?: string;      // 마지막 당첨자 (통계용)
}

// Toast 알림 타입
export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
