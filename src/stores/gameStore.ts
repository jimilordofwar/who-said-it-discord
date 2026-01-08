import { create } from 'zustand';
import { GameState, GameActions, Player, GameMessage, GamePhase } from '../types/game';

interface GameStore extends GameState, GameActions {}

const initialState: GameState = {
  players: [],
  currentRound: 0,
  roundMessages: [],
  currentMessage: null,
  phase: 'lobby',
  timer: 0,
  isHost: false,
  gameStarted: false,
  totalRounds: 10,
  multipleChoiceOptions: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Player management
  addPlayer: (player: Player) => {
    set((state) => ({
      players: [...state.players.filter(p => p.id !== player.id), player],
    }));
  },

  removePlayer: (playerId: string) => {
    set((state) => ({
      players: state.players.filter(p => p.id !== playerId),
    }));
  },

  updatePlayerScore: (playerId: string, points: number) => {
    set((state) => ({
      players: state.players.map(p =>
        p.id === playerId ? { ...p, score: p.score + points } : p
      ),
    }));
  },

  setPlayerGuess: (playerId: string, guessedPlayerId: string | null) => {
    set((state) => ({
      players: state.players.map(p =>
        p.id === playerId ? { ...p, currentGuess: guessedPlayerId } : p
      ),
    }));
  },

  // Game flow
  startGame: () => {
    const { players } = get();
    if (players.length >= 3) {
      set({
        gameStarted: true,
        currentRound: 1,
        phase: 'initial-guess',
        timer: 15,
      });
    }
  },

  endGame: () => {
    set({
      phase: 'end-game',
      gameStarted: false,
    });
  },

  nextRound: () => {
    const { currentRound, totalRounds } = get();

    if (currentRound >= totalRounds) {
      get().endGame();
    } else {
      set((state) => ({
        currentRound: state.currentRound + 1,
        phase: 'initial-guess',
        timer: 15,
        players: state.players.map(p => ({ ...p, currentGuess: null })),
      }));
    }
  },

  setPhase: (phase: GamePhase) => {
    set({ phase });

    // Set appropriate timer for each phase
    if (phase === 'initial-guess') {
      set({ timer: 15 });
    } else if (phase === 'multiple-choice') {
      set({ timer: 15 });
    } else if (phase === 'round-summary') {
      set({ timer: 5 });
    }
  },

  // Timer
  setTimer: (seconds: number) => {
    set({ timer: seconds });
  },

  decrementTimer: () => {
    const { timer, phase } = get();

    if (timer > 0) {
      set({ timer: timer - 1 });
    } else {
      // Handle timer expiry based on current phase
      if (phase === 'initial-guess') {
        get().setPhase('multiple-choice');
      } else if (phase === 'multiple-choice') {
        get().setPhase('round-summary');
      } else if (phase === 'round-summary') {
        get().nextRound();
      }
    }
  },

  // Messages
  setRoundMessages: (messages: GameMessage[]) => {
    set({ roundMessages: messages });
  },

  setCurrentMessage: (message: GameMessage | null) => {
    set({ currentMessage: message });
  },

  setMultipleChoiceOptions: (players: Player[]) => {
    set({ multipleChoiceOptions: players });
  },

  // Reset
  resetGame: () => {
    set({
      ...initialState,
      players: get().players.map(p => ({ ...p, score: 0, currentGuess: null })),
    });
  },
}))