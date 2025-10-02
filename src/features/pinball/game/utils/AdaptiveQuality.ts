/**
 * 적응형 품질 관리 시스템
 */

import {
  PHYSICS_VELOCITY_ITERATIONS,
  PHYSICS_POSITION_ITERATIONS,
  FPS_THRESHOLD_CRITICAL,
  FPS_THRESHOLD_LOW,
  FPS_THRESHOLD_HIGH,
  CRITICAL_VELOCITY_ITERATIONS,
  CRITICAL_POSITION_ITERATIONS,
  LOW_VELOCITY_ITERATIONS,
  LOW_POSITION_ITERATIONS,
  PERFORMANCE_MARBLE_THRESHOLD,
  HIGH_PERFORMANCE_VELOCITY_ITERATIONS,
  HIGH_PERFORMANCE_POSITION_ITERATIONS
} from '../constants/physics';

export interface PhysicsIterations {
  velocityIterations: number;
  positionIterations: number;
  qualityMode: string;
}

export class AdaptiveQuality {
  private lastQualityMode = 'high';
  private modeChangeDelay = 500; // 0.5초 지연으로 품질 모드 변경 너무 빠른 전환 방지
  private lastModeChange = 0;

  getPhysicsIterations(currentFps: number, marbleCount: number): PhysicsIterations {
    const now = performance.now();
    let qualityMode: string;
    let velocityIterations: number;
    let positionIterations: number;

    // FPS 기반 품질 결정
    if (currentFps < FPS_THRESHOLD_CRITICAL) {
      qualityMode = 'critical';
      velocityIterations = CRITICAL_VELOCITY_ITERATIONS;
      positionIterations = CRITICAL_POSITION_ITERATIONS;
    } else if (currentFps < FPS_THRESHOLD_LOW) {
      qualityMode = 'low';
      velocityIterations = LOW_VELOCITY_ITERATIONS;
      positionIterations = LOW_POSITION_ITERATIONS;
    } else if (currentFps > FPS_THRESHOLD_HIGH) {
      qualityMode = 'high';
      velocityIterations = PHYSICS_VELOCITY_ITERATIONS;
      positionIterations = PHYSICS_POSITION_ITERATIONS;
    } else {
      // 중간 FPS (30-50): 구슬 수에 따라 결정
      if (marbleCount > PERFORMANCE_MARBLE_THRESHOLD) {
        qualityMode = 'medium';
        velocityIterations = HIGH_PERFORMANCE_VELOCITY_ITERATIONS;
        positionIterations = HIGH_PERFORMANCE_POSITION_ITERATIONS;
      } else {
        qualityMode = 'high';
        velocityIterations = PHYSICS_VELOCITY_ITERATIONS;
        positionIterations = PHYSICS_POSITION_ITERATIONS;
      }
    }

    // 품질 모드 변경 시 로그 출력 (지연 적용)
    if (qualityMode !== this.lastQualityMode && now - this.lastModeChange > this.modeChangeDelay) {
      console.log(`품질 모드 변경: ${this.lastQualityMode} → ${qualityMode} (FPS: ${currentFps}, 구슬: ${marbleCount})`);
      this.lastQualityMode = qualityMode;
      this.lastModeChange = now;
    }

    return {
      velocityIterations,
      positionIterations,
      qualityMode: this.lastQualityMode
    };
  }

  reset(): void {
    this.lastQualityMode = 'high';
    this.lastModeChange = 0;
  }
}

export const adaptiveQuality = new AdaptiveQuality();