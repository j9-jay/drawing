/**
 * 공격적인 Sleep 최적화 시스템
 */

import { Marble } from '../../../shared/types';

export class AggressiveSleep {
  private forceSlowMarblesToSleep(marbles: Marble[]): number {
    let forcedSleepCount = 0;

    marbles.forEach(marble => {
      if (!marble.body || !marble.body.isAwake()) return;

      const velocity = marble.body.getLinearVelocity();
      const angularVel = marble.body.getAngularVelocity();

      // 매우 느린 구슬 강제로 재우기
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

      if (speed < 0.2 && Math.abs(angularVel) < 0.1) {
        marble.body.setAwake(false);
        forcedSleepCount++;
      }
    });

    return forcedSleepCount;
  }

  private identifyBottomMarbles(marbles: Marble[]): Marble[] {
    if (marbles.length === 0) return [];

    // Y 좌표로 정렬해서 바닥 근처 구슬들 찾기
    const sortedMarbles = marbles.filter(m => m.body).sort((a, b) => {
      const posA = a.body!.getPosition();
      const posB = b.body!.getPosition();
      return posB.y - posA.y; // Y가 클수록 아래쪽
    });

    const bottomThreshold = 0.8; // 하위 80%
    const bottomCount = Math.floor(sortedMarbles.length * bottomThreshold);

    return sortedMarbles.slice(0, bottomCount);
  }

  private forceBottomMarblesCluster(marbles: Marble[]): number {
    const bottomMarbles = this.identifyBottomMarbles(marbles);
    let clusterSleepCount = 0;

    bottomMarbles.forEach(marble => {
      if (!marble.body || !marble.body.isAwake()) return;

      const pos = marble.body.getPosition();
      const velocity = marble.body.getLinearVelocity();
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

      // 바닥 근처 + 느린 구슬들 적극적으로 재우기
      if (speed < 0.5) {
        marble.body.setAwake(false);
        clusterSleepCount++;
      }
    });

    return clusterSleepCount;
  }

  // 게임 상태에 따른 적응적 Sleep
  optimizeByGameState(marbles: Marble[], gamePhase: 'early' | 'middle' | 'late'): {
    forcedSleep: number;
    clusterSleep: number;
    totalOptimized: number;
  } {
    let forcedSleep = 0;
    let clusterSleep = 0;

    switch (gamePhase) {
      case 'early':
        // 초반에는 보수적
        break;

      case 'middle':
        // 중반에는 느린 구슬들 재우기
        forcedSleep = this.forceSlowMarblesToSleep(marbles);
        break;

      case 'late':
        // 후반에는 공격적으로 바닥 구슬들 재우기
        forcedSleep = this.forceSlowMarblesToSleep(marbles);
        clusterSleep = this.forceBottomMarblesCluster(marbles);
        break;
    }

    const totalOptimized = forcedSleep + clusterSleep;

    if (totalOptimized > 0) {
      console.log(`🚀 공격적 Sleep: ${totalOptimized}개 구슬 강제 최적화 (${gamePhase} 단계)`);
    }

    return { forcedSleep, clusterSleep, totalOptimized };
  }

  // 성능 임계값에 따른 동적 Sleep
  emergencySleep(marbles: Marble[], currentFps: number): number {
    if (currentFps > 30) return 0; // FPS 괜찮으면 건들지 않음

    let emergencyCount = 0;

    // FPS 20 미만시 응급 조치
    if (currentFps < 20) {
      marbles.forEach(marble => {
        if (!marble.body || !marble.body.isAwake()) return;

        const velocity = marble.body.getLinearVelocity();
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

        // 매우 공격적: 속도 1.0 미만 모든 구슬 재우기
        if (speed < 1.0) {
          marble.body.setAwake(false);
          emergencyCount++;
        }
      });

      console.log(`🆘 응급 Sleep: ${emergencyCount}개 구슬 강제 정지 (FPS: ${currentFps})`);
    }

    return emergencyCount;
  }
}

export const aggressiveSleep = new AggressiveSleep();