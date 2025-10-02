/**
 * Physics constants shared across the client game.
 */

export const GAME_GRAVITY_Y = 9.8;
export const INITIALIZER_GRAVITY_Y = 12.5;
export const FIXED_TIME_STEP = 1 / 60;

export const PIXELS_PER_METER = 30; // Conversion ratio between Planck units and canvas pixels
export const SENSOR_TRIGGER_DISTANCE = 2; // Radius (meters) to trigger sensor interactions

export const MARBLE_PREVIEW_SIZE = 12; // pixels
export const MARBLE_GAME_SIZE = 12; // pixels
export const MARBLE_BODY_DENSITY = 20.0;
export const MARBLE_FRICTION = 0.3;
export const MARBLE_RESTITUTION = 0.3;

// Obstacle physics properties
export const ROTATING_BAR_FRICTION = 0.5; // 회전 막대 마찰력
export const ROTATING_BAR_RESTITUTION = 1.0; // 회전 막대 반발력

// Wall physics properties
export const WALL_FRICTION = 0.4; // 벽 마찰력
export const WALL_RESTITUTION = 0.4; // 벽 반발력 (부딪히면 튕기는 정도)

// Bubble physics properties
export const BUBBLE_FRICTION = 0.1; // 버블 마찰력
export const BUBBLE_DEFAULT_RESTITUTION = 1.2; // 버블 기본 반발력 (높을수록 강하게 튕김)

// Bounce circle physics properties
export const BOUNCE_CIRCLE_FRICTION = 0.1; // 바운스 서클 마찰력
export const DEFAULT_BOUNCE_CIRCLE_RESTITUTION = 2.0; // 바운스 서클 기본 반발력

// Jump pad physics properties
export const JUMPPAD_FRICTION = 0.1; // 점프 패드 마찰력
export const DEFAULT_JUMPPAD_RESTITUTION = 1.6; // 점프 패드 기본 반발력

// Legacy jump pad constants (impulse-based, deprecated)
export const JUMPPAD_FORCE_MULTIPLIER_X = 12;
export const JUMPPAD_FORCE_MULTIPLIER_Y = 2.5;
export const BOUNCE_FORCE_X_FACTOR = 0.8;
export const BOUNCE_FORCE_Y_MIN = -15;
export const BOUNCE_FORCE_Y_FACTOR = 1.5;
export const JUMPPAD_BASE_FORCE = 10;

// Maximum velocity limits (in meters/second)
export const MAX_VELOCITY = 20; // Maximum speed in any direction
export const MAX_VELOCITY_X = 15; // Maximum horizontal speed
export const MAX_VELOCITY_Y = 25; // Maximum vertical speed (falling)

// Bubble obstacle properties
export const BUBBLE_POP_INCREMENT = 0.05;
export const BUBBLE_POP_COMPLETION = 1;

// Bounce circle animation properties
export const BOUNCE_CIRCLE_ANIMATION_INCREMENT = 0.1;
export const BOUNCE_CIRCLE_ANIMATION_COMPLETION = 1;

// Rotating bar speeds
export const ROTATING_BAR_SPEED_SLOW = 0.5;
export const ROTATING_BAR_SPEED_NORMAL = 1.0;
export const ROTATING_BAR_SPEED_FAST = 1.5;
export const ROTATING_BAR_DEFAULT_SPEED = 2.0;
export const ROTATING_BAR_BASE_TIMESTEP = 0.016;

// Finish line (현재 센서로만 작동하여 렌더링 상수 불필요)

// 기본 맵 크기
export const DEFAULT_MAP_WIDTH = 400;
export const DEFAULT_MAP_HEIGHT = 800;

// 물리 엔진 스텝 설정
export const PHYSICS_VELOCITY_ITERATIONS = 8;
export const PHYSICS_POSITION_ITERATIONS = 3;

// 동적 Iteration 설정
export const PERFORMANCE_MARBLE_THRESHOLD = 100;
export const HIGH_PERFORMANCE_VELOCITY_ITERATIONS = 4;
export const HIGH_PERFORMANCE_POSITION_ITERATIONS = 2;

// FPS 기반 적응형 품질 설정
export const FPS_THRESHOLD_CRITICAL = 20;
export const FPS_THRESHOLD_LOW = 30;
export const FPS_THRESHOLD_HIGH = 50;

export const CRITICAL_VELOCITY_ITERATIONS = 2;
export const CRITICAL_POSITION_ITERATIONS = 1;
export const LOW_VELOCITY_ITERATIONS = 4;
export const LOW_POSITION_ITERATIONS = 2;

// Sleep 시스템 설정 (공격적 튜닝)
export const SLEEP_LINEAR_TOLERANCE = 0.1; // m/s 미만시 잠들기 시작 (더 관대하게)
export const SLEEP_ANGULAR_TOLERANCE = 0.1; // rad/s 미만시 잠들기 시작 (더 관대하게)
export const SLEEP_TIME_UNTIL_SLEEP = 0.5; // 0.5초 정지시 잠들기 (더 빠르게)
export const SLEEP_MIN_ENERGY = 0.01; // 최소 에너지 임계값 (더 높게)
