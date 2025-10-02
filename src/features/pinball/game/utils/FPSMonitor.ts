/**
 * 간단한 FPS 모니터링 유틸리티
 */

export class FPSMonitor {
  private lastTime = 0;
  private frameCount = 0;
  private fps = 60;
  private lastFpsUpdate = 0;
  private fpsUpdateInterval = 1000; // 1초마다 FPS 업데이트

  update(): void {
    const now = performance.now();

    if (this.lastTime === 0) {
      this.lastTime = now;
      this.lastFpsUpdate = now;
      return;
    }

    this.frameCount++;

    // 1초마다 FPS 계산
    const elapsed = now - this.lastFpsUpdate;
    if (elapsed >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    this.lastTime = now;
  }

  getFPS(): number {
    return this.fps;
  }

  reset(): void {
    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsUpdate = 0;
  }
}

export const fpsMonitor = new FPSMonitor();