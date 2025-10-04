'use client';

import { useEffect, useRef } from 'react';
import '../../features/pinball/game/game.css';

export default function PinballGamePage() {
  const initialized = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Dynamic import to ensure client-side only execution
    import('@/features/pinball/game/PinballGame').then(async ({ PinballRoulette }) => {
      try {
        // Initialize the game
        const game = new PinballRoulette();

        // Export game instance for debugging
        (window as any).game = game;
      } catch (error) {
        console.error('Failed to initialize pinball game:', error);
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
    <div className="pinball-page-container">
      <div id="app" ref={appRef}>
        {/* Main Game Area */}
        <div id="game-area">
        <canvas id="game-canvas"></canvas>

        {/* Minimap */}
        <div id="minimap" className="minimap">
          <canvas id="minimap-canvas" width="120" height="320"></canvas>
        </div>

        {/* Performance Monitor */}
        <div id="performance-monitor" className="performance-monitor">
          <div className="performance-text">
            <div id="fps-display">FPS: --</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div id="leaderboard" className="leaderboard">
          <h3>Live Rankings</h3>
          <div id="leaderboard-list"></div>
        </div>

        {/* Winner Display */}
        <div id="winner-display" className="hidden">
          <div id="fireworks-container"></div>
          <div id="winner-content">
            <h1>🎉 Winner! 🎉</h1>
            <div id="winner-name"></div>
            <div id="winner-buttons">
              <button id="play-again-btn" className="winner-btn">Play Again</button>
              <button id="play-without-winner-btn" className="winner-btn secondary">Play Without Winner</button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Popup */}
      <div id="settings-popup" className="settings-popup">
        <div className="settings-header">
          <h4>Game Controls & Settings</h4>
        </div>
        <div className="settings-content">
          <div className="settings-left">
            <div className="setting-group">
              <label htmlFor="names-input">Participants (newline or comma separated, *number for weight, max 8 chars)</label>
              <textarea
                id="names-input"
                placeholder="John Doe, Jane Smith*3, Bob Johnson*2, Alice Brown"
              ></textarea>
            </div>
            <div className="control-buttons">
              <button id="start-btn" className="control-btn primary">Start</button>
              <button id="reset-btn" className="control-btn">Reset</button>
            </div>
          </div>
          <div className="settings-right">
            <div className="setting-group">
              <label htmlFor="map-select">Map Selection</label>
              <select id="map-select">
                <option value="classic">Classic</option>
              </select>
            </div>
            <div className="setting-group">
              <label htmlFor="winner-mode">Winner Selection</label>
              <select id="winner-mode">
                <option value="first">1st Place</option>
                <option value="last">Last Place</option>
                <option value="custom">Custom Rank</option>
                <option value="topN">Top N Places</option>
              </select>
              <input type="number" id="custom-rank" min="1" defaultValue="1" style={{display: 'none'}} />
              <input type="number" id="top-n-count" min="1" max="50" defaultValue="5" style={{display: 'none'}} placeholder="Number of winners (max 50)" />
            </div>
            <div className="setting-group">
              <label htmlFor="speed-slider">Speed</label>
              <div className="speed-control">
                <input type="range" id="speed-slider" min="0.1" max="0.5" step="0.1" defaultValue="0.3" />
                <span id="speed-value">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div id="toast-container"></div>
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
