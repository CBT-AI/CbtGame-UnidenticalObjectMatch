import create from 'zustand';
import { GameStore, GameState } from '../types/game';

const initialState: GameState = {
  currentSubLO: 0,
  currentVariation: 1,
  currentTarget: '',
  score: 0,
  attempts: 0,
  consecutiveNoResponse: 0,
  stars: 0,
  isGameOver: false,
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: initialState,
  setGameState: (newState) =>
    set((state) => {
      if (typeof newState === 'function') {
        const functionResult = newState(state.gameState);
        return { gameState: { ...state.gameState, ...functionResult } };
      }
      return { gameState: { ...state.gameState, ...newState } };
    }),
  resetGame: () => set({ gameState: initialState }),
}));