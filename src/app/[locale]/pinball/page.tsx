'use client';

import { useEffect, useRef } from 'react';
import '../../../features/pinball/game/game.css';
import { useTranslations } from '@/lib/i18n/useTranslations';

export default function PinballGamePage() {
  const { t } = useTranslations('pages');
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
        <div id="performance-monitor" className="performance-monitor hidden">
          <div className="performance-text">
            <div id="fps-display">FPS: --</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div id="leaderboard" className="leaderboard">
          <h3>{t('pinball.game.leaderboard.title')}</h3>
          <div id="leaderboard-list"></div>
        </div>

        {/* Winner Display */}
        <div id="winner-display" className="hidden">
          <div id="fireworks-container"></div>
          <div id="winner-content">
            <h1>{t('pinball.game.winner.title')}</h1>
            <div id="winner-name"></div>
            <div id="winner-buttons">
              <button id="play-again-btn" className="winner-btn">{t('pinball.game.winner.playAgain')}</button>
              <button id="play-without-winner-btn" className="winner-btn secondary">{t('pinball.game.winner.playWithoutWinner')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Popup */}
      <div id="settings-popup" className="settings-popup">
        <div className="settings-header">
          <h4>{t('pinball.game.controls.title')}</h4>
        </div>
        <div className="settings-content">
          <div className="settings-left">
            <div className="setting-group">
              <label htmlFor="names-input">{t('pinball.game.controls.participants')}</label>
              <textarea
                id="names-input"
                placeholder={t('pinball.game.controls.participantsPlaceholder')}
              ></textarea>
            </div>
            <div className="control-buttons">
              <button id="start-btn" className="control-btn primary">{t('pinball.game.controls.start')}</button>
              <button id="reset-btn" className="control-btn">{t('pinball.game.controls.reset')}</button>
            </div>
          </div>
          <div className="settings-right">
            <div className="setting-group">
              <label htmlFor="map-select">{t('pinball.game.controls.mapSelection')}</label>
              <div className="map-selection-group">
                <input
                  type="text"
                  id="map-display"
                  value="default"
                  readOnly
                  className="map-display-input"
                />
                <button
                  id="map-select-btn"
                  className="map-select-button"
                  type="button"
                >
                  <span>🗺️</span> {t('pinball.game.controls.select')}
                </button>
              </div>
            </div>
            <div className="setting-group">
              <label htmlFor="winner-mode">{t('pinball.game.controls.winnerMode')}</label>
              <select id="winner-mode">
                <option value="first">{t('pinball.game.controls.firstPlace')}</option>
                <option value="last">{t('pinball.game.controls.lastPlace')}</option>
                <option value="custom">{t('pinball.game.controls.customRank')}</option>
                <option value="topN">{t('pinball.game.controls.topNPlaces')}</option>
              </select>
              <input type="number" id="custom-rank" min="1" defaultValue="1" style={{display: 'none'}} />
              <input type="number" id="top-n-count" min="1" max="50" defaultValue="5" style={{display: 'none'}} placeholder="Number of winners (max 50)" />
            </div>
            <div className="setting-group">
              <label htmlFor="speed-slider">{t('pinball.game.controls.speed')}</label>
              <div className="speed-control">
                <input type="range" id="speed-slider" min="0.1" max="0.5" step="0.1" defaultValue="0.3" />
                <span id="speed-value">{t('pinball.game.controls.speedNormal')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div id="toast-container"></div>

      {/* Map Selection Modal */}
      <div id="map-selection-modal" className="map-modal-overlay hidden">
        <div className="map-modal">
          <div className="modal-header">
            <h2>{t('pinball.game.mapModal.title')}</h2>
            <div className="modal-controls">
              <select id="map-sort-select" className="sort-select">
                <option value="name">{t('pinball.game.mapModal.sortByName')}</option>
                <option value="name-desc">{t('pinball.game.mapModal.sortByNameDesc')}</option>
                <option value="date">{t('pinball.game.mapModal.sortByDate')}</option>
              </select>
              <button className="modal-close-btn" id="map-modal-close">✕</button>
            </div>
          </div>
          <div className="map-grid" id="map-grid">
            {/* Map cards will be dynamically inserted here */}
          </div>
        </div>
      </div>
      </div>

      {/* Full Screen Button */}
      <button
        className="fullscreen-btn"
        onClick={handleFullScreen}
        title="Toggle fullscreen (or press ESC to exit)"
      >
        <span>⛶</span>
        <span>{t('pinball.game.fullscreen')}</span>
      </button>
    </div>
  );
}
