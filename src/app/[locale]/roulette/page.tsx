'use client';

import { useEffect, useRef } from 'react';
import '../../../features/roulette/game/styles/base.css';
import '../../../features/roulette/game/styles/components.css';
import '../../../features/roulette/game/styles/animations.css';
import { useTranslations } from '@/lib/i18n/useTranslations';

export default function RoulettePage() {
  const { t } = useTranslations('pages');
  const initialized = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Inject translations into window for game logic to use
  useEffect(() => {
    window.rouletteTranslations = {
      participants: t('roulette.game.settings.participants'),
      participantsCount: t('roulette.game.logic.participantsCount'),
      participantsMin: t('roulette.game.logic.participantsMin'),
      shuffled: t('roulette.game.logic.shuffled'),
      sortAsc: t('roulette.game.logic.sortAsc'),
      sortDesc: t('roulette.game.logic.sortDesc'),
      sortAscTitle: t('roulette.game.logic.sortAscTitle'),
      sortDescTitle: t('roulette.game.logic.sortDescTitle'),
      sortedAsc: t('roulette.game.logic.sortedAsc'),
      sortedDesc: t('roulette.game.logic.sortedDesc'),
      alreadySpinning: t('roulette.game.logic.alreadySpinning'),
      minParticipantsRequired: t('roulette.game.logic.minParticipantsRequired'),
      winnerNotFound: t('roulette.game.logic.winnerNotFound'),
      cannotRemoveWinner: t('roulette.game.logic.cannotRemoveWinner'),
      winnerRemoved: t('roulette.game.logic.winnerRemoved'),
    };
  }, [t]);

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
            <h4>{t('roulette.game.settings.title')}</h4>
          </div>
          <div className="roulette-settings-content">
            <div className="roulette-setting-group">
              <label htmlFor="roulette-names-input">{t('roulette.game.settings.participants')}</label>

              {/* Utility buttons above textarea */}
              <div className="roulette-utility-buttons">
                <button id="roulette-shuffle-btn" className="roulette-utility-btn" title={t('roulette.game.settings.shuffle')}>
                  {t('roulette.game.settings.shuffle')}
                </button>
                <button id="roulette-sort-btn" className="roulette-utility-btn" title={t('roulette.game.settings.sort')}>
                  {t('roulette.game.settings.sort')}
                </button>
              </div>

              <textarea
                id="roulette-names-input"
                placeholder={t('roulette.game.settings.participantsPlaceholder')}
                defaultValue={t('roulette.game.settings.defaultParticipants')}
              ></textarea>
            </div>

            <div className="roulette-setting-group">
              <label>{t('roulette.game.settings.speed')}</label>
              <div className="roulette-speed-selector">
                <div className="roulette-speed-option">
                  <input type="radio" id="speed-weak" name="spin-speed" value="WEAK" />
                  <label htmlFor="speed-weak">{t('roulette.game.settings.speedWeak')}</label>
                </div>
                <div className="roulette-speed-option">
                  <input type="radio" id="speed-normal" name="spin-speed" value="NORMAL" defaultChecked />
                  <label htmlFor="speed-normal">{t('roulette.game.settings.speedNormal')}</label>
                </div>
                <div className="roulette-speed-option">
                  <input type="radio" id="speed-strong" name="spin-speed" value="STRONG" />
                  <label htmlFor="speed-strong">{t('roulette.game.settings.speedStrong')}</label>
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
              <h1>{t('roulette.game.winner.title')}</h1>
              <div id="roulette-winner-name"></div>
              <div id="roulette-winner-buttons">
                <button id="roulette-play-again-btn" className="roulette-winner-btn">{t('roulette.game.winner.playAgain')}</button>
                <button id="roulette-play-without-winner-btn" className="roulette-winner-btn secondary">
                  {t('roulette.game.winner.playWithoutWinner')}
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
        <span>{t('roulette.game.fullscreen')}</span>
      </button>
    </div>
  );
}
