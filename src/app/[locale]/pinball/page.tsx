'use client';

import React, { useEffect, useRef, useState } from 'react';
import '../../../features/pinball/game/game.css';
import { useTranslations } from '@/lib/i18n/useTranslations';

export default function PinballGamePage() {
  const { t } = useTranslations('pages');
  const initialized = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);
  const [contentData, setContentData] = useState<any>(null);

  // Load translation data for content sections
  useEffect(() => {
    const loadContent = async () => {
      try {
        const pathname = window.location.pathname;
        const locale = pathname.split('/')[1] || 'en';
        const data = await import(`@/../locales/${locale}/pages.json`);
        setContentData(data.default?.pinball?.content || data.pinball?.content);
      } catch (error) {
        // Fallback to English
        const data = await import(`@/../locales/en/pages.json`);
        setContentData(data.default?.pinball?.content || data.pinball?.content);
      }
    };
    loadContent();
  }, []);

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
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{t('pinball.game.winner.title')}</h2>
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

      {/* Content Sections */}
      <div className="pinball-content-sections" style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        {/* Main Heading */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center', color: '#06b6d4' }}>
          {t('pinball.title')}
        </h1>

        {/* Introduction */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>{t('pinball.content.introduction.title')}</h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>{t('pinball.content.introduction.content')}</p>
        </section>

        {/* How to Play */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>{t('pinball.content.howToPlay.title')}</h2>
          <div
            style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{
              __html: t('pinball.content.howToPlay.content').replace(
                /\*\*([^*]+)\*\*:/g,
                '<strong style="color: #06b6d4; font-weight: 600;">$1</strong>:'
              )
            }}
          />
        </section>

        {/* Visuals */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>{t('pinball.content.visuals.title')}</h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>{t('pinball.content.visuals.content')}</p>
        </section>

        {/* BGM */}
        {contentData?.bgm && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>{contentData.bgm.title}</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {contentData.bgm.items?.map((item: any, index: number) => (
                <li key={index} style={{ marginBottom: '1rem' }}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', textDecoration: 'underline' }}
                  >
                    {item.title}
                  </a>
                  {' - '}
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {contentData?.faq && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>{contentData.faq.title}</h2>
            <div>
              {contentData.faq.items?.map((item: any, index: number) => (
                <div key={index} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {item.q}
                  </h3>
                  <p style={{ lineHeight: '1.8' }}>{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Internal Links */}
        {contentData?.internalLinks && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>{contentData.internalLinks.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              {contentData.internalLinks.links?.map((link: any, index: number) => {
                // 버튼 색상 결정
                const buttonColors = [
                  { bg: 'rgb(37, 99, 235)', hover: 'rgb(29, 78, 216)' }, // blue-600/700 - 룰렛
                  { bg: 'rgb(147, 51, 234)', hover: 'rgb(126, 34, 206)' }, // purple-600/700 - About
                  { bg: 'rgb(22, 163, 74)', hover: 'rgb(21, 128, 61)' }, // green-600/700 - 홈
                ];
                const colors = buttonColors[index] || buttonColors[0];

                return (
                  <div key={index} style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                    <a
                      href={link.href}
                      style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: colors.bg,
                        color: 'white',
                        borderRadius: '0.5rem',
                        fontWeight: '500',
                        fontSize: '1.125rem',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.bg}
                    >
                      {link.text}
                    </a>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'rgb(156, 163, 175)' }}>
                      {link.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
