/**
 * Sleep 시스템 모니터링 유틸리티
 */

import { Marble } from '../../shared/types';

export class SleepMonitor {
  private lastSleepCount = 0;
  private logInterval = 2000; // 2초마다 로그
  private lastLogTime = 0;

  update(marbles: Marble[]): void {
    const now = performance.now();

    if (now - this.lastLogTime < this.logInterval) {
      return;
    }

    const sleepingCount = marbles.filter(marble =>
      marble.body && marble.body.isAwake() === false
    ).length;

    const activeCount = marbles.length - sleepingCount;

    // Sleep 상태가 변경되었을 때만 로그
    if (sleepingCount !== this.lastSleepCount) {
      const efficiency = marbles.length > 0
        ? Math.round((sleepingCount / marbles.length) * 100)
        : 0;

      console.log(`Sleep 최적화: ${sleepingCount}/${marbles.length} 구슬 잠듦 (${efficiency}% 효율)`);

      if (sleepingCount > marbles.length * 0.5) {
        console.log(`🎯 Sleep 시스템이 효과적으로 작동중! 물리 계산 ${efficiency}% 절약`);
      }

      this.lastSleepCount = sleepingCount;
    }

    this.lastLogTime = now;
  }

  getSleepStatistics(marbles: Marble[]): {
    sleeping: number;
    active: number;
    efficiency: number;
  } {
    const sleepingCount = marbles.filter(marble =>
      marble.body && marble.body.isAwake() === false
    ).length;

    return {
      sleeping: sleepingCount,
      active: marbles.length - sleepingCount,
      efficiency: marbles.length > 0 ? (sleepingCount / marbles.length) * 100 : 0
    };
  }

  // 잠든 구슬 강제로 깨우기 (디버그용)
  wakeAllMarbles(marbles: Marble[]): void {
    marbles.forEach(marble => {
      if (marble.body && !marble.body.isAwake()) {
        marble.body.setAwake(true);
      }
    });
    console.log(`모든 구슬 깨웠음: ${marbles.length}개`);
  }
}

export const sleepMonitor = new SleepMonitor();