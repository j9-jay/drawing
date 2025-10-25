import { RouletteGame } from '@/features/roulette/game/RouletteGame';

declare global {
  interface Window {
    rouletteGame?: RouletteGame;
    game?: any; // Pinball game

    /**
     * Roulette game translations injected from React page
     */
    rouletteTranslations?: {
      participants: string;
      participantsCount: string;
      participantsMin: string;
      shuffled: string;
      sortAsc: string;
      sortDesc: string;
      sortAscTitle: string;
      sortDescTitle: string;
      sortedAsc: string;
      sortedDesc: string;
      alreadySpinning: string;
      minParticipantsRequired: string;
      winnerNotFound: string;
      cannotRemoveWinner: string;
      winnerRemoved: string;
    };
  }
}

export {};
