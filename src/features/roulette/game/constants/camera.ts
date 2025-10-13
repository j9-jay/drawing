/**
 * 카메라 효과 상수
 */

// 줌 레벨
export const ZOOM_DEFAULT = 1.0;           // 기본 줌
export const ZOOM_SPIN_IN = 1.2;           // 회전 중 줌 인

// 동적 줌 설정 (영역/글자 크기 기반)
export const ZOOM_TARGET_TEXT_HEIGHT_RATIO = 0.15; // 화면 높이의 15%를 목표 텍스트 크기로
export const ZOOM_MIN_CLAMP = 1.5;         // 최소 줌 제한 (너무 작아지지 않도록)
export const ZOOM_MAX_CLAMP = 5.0;         // 최대 줌 제한 (너무 커지지 않도록)

// 줌 중심점 오프셋 (3시 방향으로 이동)
export const ZOOM_OFFSET_RATIO = 0.95;      // WHEEL_RADIUS의 40% 오른쪽으로 이동

// 전환 속도 (lerp 계수)
export const ZOOM_TRANSITION_SPEED = 0.08; // 부드러운 줌 전환
export const ZOOM_LERP_THRESHOLD = 0.01;   // 줌 완료 판단 임계값

// 카메라 쉐이크 (당첨 순간)
export const CAMERA_SHAKE_DURATION = 500;  // ms
export const CAMERA_SHAKE_INTENSITY = 8;   // px
export const CAMERA_SHAKE_FREQUENCY = 20;  // Hz

// 줌 시작 임계값 (속도 기준)
export const ZOOM_START_VELOCITY = 1.0;    // rad/s 이하일 때 줌 시작
