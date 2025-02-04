export type GameItem = {
  name: string;
  similar: string;
};

export type SubLO = {
  id: number;
  name: string;
  items: GameItem[];
};

export type GameVariation = 1 | 2 | 3;

export type Reinforcement = {
  text: string;
  type: 'set1' | 'set2';
};

export type GameState = {
  currentSubLO: number;
  currentVariation: GameVariation;
  currentTarget: string;
  score: number;
  attempts: number;
  consecutiveNoResponse: number;
  stars: number;
  isGameOver: boolean;
};