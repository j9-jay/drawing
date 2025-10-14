'use client';

import { useEffect, useRef } from 'react';
import '../../features/roulette/game/styles/base.css';
import '../../features/roulette/game/styles/components.css';
import '../../features/roulette/game/styles/animations.css';

export default function RoulettePage() {
  const initialized = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Dynamic import for client-side execution
    import('@/features/roulette/game/RouletteGame').then(({ RouletteGame }) => {
      try {
        const game = new RouletteGame();
        window.rouletteGame = game;
      } catch (error) {
        console.error('Failed to initialize roulette game:', error);
      }
    });
  }, []);

  const handleFullScreen = () => {
    if (!appRef.current) return;

    if (!document.fullscreenElement) {
      appRef.current.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="roulette-page-container">
      <div id="roulette-app" ref={appRef}>
        {/* Settings Sidebar */}
        <div id="roulette-settings-popup" className="roulette-settings-popup">
          <div className="roulette-settings-header">
            <h4>룰렛 설정</h4>
          </div>
          <div className="roulette-settings-content">
            <div className="roulette-setting-group">
              <label htmlFor="roulette-names-input">참가자 (줄바꿈 또는 쉼표로 구분, *숫자로 가중치, 최대 8자)</label>

              {/* Utility buttons above textarea */}
              <div className="roulette-utility-buttons">
                <button id="roulette-shuffle-btn" className="roulette-utility-btn" title="참가자 순서 섞기">
                  🔀 섞기
                </button>
                <button id="roulette-sort-btn" className="roulette-utility-btn" title="참가자 정렬 (오름/내림차순)">
                  ↑aA 정렬
                </button>
              </div>

              <textarea
                id="roulette-names-input"
                placeholder="홍길동, 김철수*3, 이영희*2, 박민수"
                defaultValue="홍길동, 김철수, 이영희, 박민수"
              ></textarea>
            </div>

            <div className="roulette-setting-group">
              <label>회전 속도</label>
              <div className="roulette-speed-selector">
                <div className="roulette-speed-option">
                  <input type="radio" id="speed-weak" name="spin-speed" value="WEAK" />
                  <label htmlFor="speed-weak">약하게</label>
                </div>
                <div className="roulette-speed-option">
                  <input type="radio" id="speed-normal" name="spin-speed" value="NORMAL" defaultChecked />
                  <label htmlFor="speed-normal">보통</label>
                </div>
                <div className="roulette-speed-option">
                  <input type="radio" id="speed-strong" name="spin-speed" value="STRONG" />
                  <label htmlFor="speed-strong">세게</label>
                </div>
              </div>
            </div>

            {/* Control buttons removed - spin via canvas click, fullscreen moved outside */}
          </div>
        </div>

        {/* Main Game Area */}
        <div id="roulette-game-area">
          <canvas id="roulette-canvas"></canvas>

          {/* Winner Display */}
          <div id="roulette-winner-display" className="hidden">
            <div id="roulette-fireworks-container"></div>
            <div id="roulette-winner-content">
              <h1>🎉 Winner! 🎉</h1>
              <div id="roulette-winner-name"></div>
              <div id="roulette-winner-buttons">
                <button id="roulette-play-again-btn" className="roulette-winner-btn">다시 시작</button>
                <button id="roulette-play-without-winner-btn" className="roulette-winner-btn secondary">
                  당첨자 제외하고 시작
                </button>
              </div>
            </div>
          </div>

          {/* Toast Container */}
          <div id="roulette-toast-container"></div>
        </div>
      </div>

      {/* Full Screen Button */}
      <button
        className="fullscreen-btn"
        onClick={handleFullScreen}
        title="Toggle fullscreen (or press ESC to exit)"
      >
        <span>⛶</span>
        <span>Full Screen</span>
      </button>
    </div>
  );
}
