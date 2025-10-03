'use client';

import { useEffect, useRef } from 'react';

export default function PinballGamePage() {
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in development
    if (initialized.current) return;
    initialized.current = true;

    // Dynamic import to ensure client-side only execution
    import('@/features/pinball/game/core/GameInitializer').then(({
      initializeSettings,
      initializePhysicsWorld,
      setupCanvas,
      initializeParticipantsAndMarbles
    }) => {
      import('@/features/pinball/game/core/GameLoop').then(({ GameLoop }) => {
        import('@/features/pinball/game/map/MapLoader').then(async ({ loadMapFromServer }) => {
          try {
            // Initialize game
            const settings = initializeSettings();
            const world = initializePhysicsWorld();
            const canvases = setupCanvas();

            // Load map
            const currentMap = await loadMapFromServer(settings.mapType);

            // Initialize participants and marbles
            const { participants, marbles } = initializeParticipantsAndMarbles(
              canvases.canvas,
              currentMap
            );

            // Start game loop
            const gameLoop = new GameLoop(
              world,
              canvases.canvas,
              canvases.ctx,
              canvases.minimapCanvas,
              canvases.minimapCtx,
              marbles,
              participants,
              currentMap,
              settings
            );

            gameLoop.start();
          } catch (error) {
            console.error('Failed to initialize game:', error);
          }
        });
      });
    });
  }, []);

  return (
    <div className="game-container">
      <canvas id="game-canvas"></canvas>
      <canvas id="minimap-canvas"></canvas>
      <div id="leaderboard"></div>
      <div id="controls"></div>
      <div id="fps-display"></div>

      <style jsx>{`
        .game-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #1a1a1a;
        }

        #game-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        #minimap-canvas {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 200px;
          height: 200px;
          border: 2px solid #333;
          background: rgba(0, 0, 0, 0.5);
        }

        #leaderboard {
          position: absolute;
          top: 20px;
          left: 20px;
          min-width: 250px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #333;
          border-radius: 8px;
          padding: 15px;
          color: white;
          font-family: monospace;
        }

        #controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #333;
          border-radius: 8px;
          padding: 15px;
          color: white;
        }

        #fps-display {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #333;
          border-radius: 8px;
          padding: 10px 15px;
          color: #0f0;
          font-family: monospace;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
