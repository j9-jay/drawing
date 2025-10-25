'use client';

import { useEffect, useRef, useState } from 'react';
import '../../../features/roulette/game/styles/base.css';
import '../../../features/roulette/game/styles/components.css';
import '../../../features/roulette/game/styles/animations.css';
import { useTranslations } from '@/lib/i18n/useTranslations';

export default function RoulettePage() {
  const { t } = useTranslations('pages');
  const initialized = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);
  const [contentData, setContentData] = useState<any>(null);

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

  // Load translation data for content sections
  useEffect(() => {
    const loadContent = async () => {
      try {
        const pathname = window.location.pathname;
        const locale = pathname.split('/')[1] || 'en';
        const data = await import(`@/../locales/${locale}/pages.json`);
        setContentData(data.default?.roulette?.content || data.roulette?.content);
      } catch (error) {
        // Fallback to English
        const data = await import(`@/../locales/en/pages.json`);
        setContentData(data.default?.roulette?.content || data.roulette?.content);
      }
    };
    loadContent();
  }, []);

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
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{t('roulette.game.winner.title')}</h2>
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

      {/* Content Sections */}
      <div className="roulette-content-sections" style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        {/* Main Heading */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center', color: '#06b6d4' }}>
          {t('roulette.title')}
        </h1>

        {/* Introduction */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>
            {t('roulette.content.introduction.title')}
          </h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
            {t('roulette.content.introduction.content')}
          </p>
        </section>

        {/* How to Play */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>
            {t('roulette.content.howToPlay.title')}
          </h2>
          <div
            style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{
              __html: t('roulette.content.howToPlay.content').replace(
                /\*\*([^*]+)\*\*:/g,
                '<strong style="color: #06b6d4; font-weight: 600;">$1</strong>:'
              )
            }}
          />
        </section>

        {/* Visuals */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>
            {t('roulette.content.visuals.title')}
          </h2>
          <p style={{ lineHeight: '1.8', whiteSpace: 'pre-line' }}>
            {t('roulette.content.visuals.content')}
          </p>
        </section>

        {/* BGM */}
        {contentData?.bgm && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>
              {contentData.bgm.title}
            </h2>
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
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>
              {contentData.faq.title}
            </h2>
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
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#06b6d4' }}>
              {contentData.internalLinks.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              {contentData.internalLinks.links?.map((link: any, index: number) => {
                // 버튼 색상 결정
                const buttonColors = [
                  { bg: 'rgb(37, 99, 235)', hover: 'rgb(29, 78, 216)' }, // blue - 핀볼
                  { bg: 'rgb(147, 51, 234)', hover: 'rgb(126, 34, 206)' }, // purple - About
                  { bg: 'rgb(22, 163, 74)', hover: 'rgb(21, 128, 61)' }, // green - 홈
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
