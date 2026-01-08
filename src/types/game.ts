export interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  currentGuess: string | null; // Player ID of their guess
}

export interface GameMessage {
  id: string;
  content: string;
  authorId: string;
  timestamp: Date;
}

export type GamePhase =
  | 'lobby'
  | 'initial-guess'
  | 'multiple-choice'
  | 'round-summary'
  | 'end-game';

export interface GameState {
  players: Player[];
  currentRound: number;
  roundMessages: GameMessage[];
  currentMessage: GameMessage | null;
  phase: GamePhase;
  timer: number;
  isHost: boolean;
  gameStarted: boolean;
  totalRounds: number;
  multipleChoiceOptions: Player[];
}

export interface GameActions {
  // Player management
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerScore: (playerId: string, points: number) => void;
  setPlayerGuess: (playerId: string, guessedPlayerId: string | null) => void;

  // Game flow
  startGame: () => void;
  endGame: () => void;
  nextRound: () => void;
  setPhase: (phase: GamePhase) => void;

  // Timer
  setTimer: (seconds: number) => void;
  decrementTimer: () => void;

  // Messages
  setRoundMessages: (messages: GameMessage[]) => void;
  setCurrentMessage: (message: GameMessage | null) => void;
  setMultipleChoiceOptions: (players: Player[]) => void;

  // Reset
  resetGame: () => void;
}