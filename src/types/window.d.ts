import { RouletteGame } from '@/features/roulette/game/RouletteGame';

declare global {
  interface Window {
    rouletteGame?: RouletteGame;
    game?: any; // Pinball game
  }
}

export {};
