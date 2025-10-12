/**
 * 카메라 효과 상수
 */

// 줌 레벨
export const ZOOM_DEFAULT = 1.0;           // 기본 줌
export const ZOOM_SPIN_IN = 1.2;           // 회전 중 줌 인
export const ZOOM_WIN = 1.5;               // 당첨 순간 강조

// 전환 속도 (lerp 계수)
export const ZOOM_TRANSITION_SPEED = 0.08; // 부드러운 줌 전환
export const ZOOM_LERP_THRESHOLD = 0.01;   // 줌 완료 판단 임계값

// 카메라 쉐이크 (당첨 순간)
export const CAMERA_SHAKE_DURATION = 500;  // ms
export const CAMERA_SHAKE_INTENSITY = 8;   // px
export const CAMERA_SHAKE_FREQUENCY = 20;  // Hz

// 줌 시작 임계값 (속도 기준)
export const ZOOM_START_VELOCITY = 1.0;    // rad/s 이하일 때 줌 시작
