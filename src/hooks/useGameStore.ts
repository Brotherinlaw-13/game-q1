import { create } from 'zustand';
import type { CharacterId, GameMode, GameState, PlayerState } from '../types/game.types';
import { GAME_CONFIG } from '../constants/gameConstants';

interface GameStore {
  // Menu state
  gameMode: GameMode | null;
  player1Character: CharacterId | null;
  player2Character: CharacterId | null;
  roomCode: string | null;
  isConnected: boolean;

  // Game state
  gameState: GameState | null;
  isGameRunning: boolean;
  isPaused: boolean;
  showTutorial: boolean;

  // Actions
  setGameMode: (mode: GameMode | null) => void;
  setPlayer1Character: (char: CharacterId | null) => void;
  setPlayer2Character: (char: CharacterId | null) => void;
  setRoomCode: (code: string | null) => void;
  setConnected: (connected: boolean) => void;
  setGameState: (state: GameState | null) => void;
  setGameRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setShowTutorial: (show: boolean) => void;
  updateHealth: (player: 1 | 2, health: number) => void;
  updateRoundsWon: (player: 1 | 2, rounds: number) => void;
  resetGame: () => void;
}

const createInitialPlayerState = (
  playerId: 1 | 2,
  characterId: CharacterId
): PlayerState => ({
  x: playerId === 1 ? 300 : GAME_CONFIG.CANVAS_WIDTH - 300,
  y: GAME_CONFIG.GROUND_Y,
  velocityX: 0,
  velocityY: 0,
  health: GAME_CONFIG.MAX_HEALTH,
  maxHealth: GAME_CONFIG.MAX_HEALTH,
  state: 'idle',
  facingDirection: playerId === 1 ? 'right' : 'left',
  hitStun: 0,
  blockStun: 0,
  roundsWon: 0,
  characterId,
  currentFrame: 0,
  stateFrame: 0,
});

export const useGameStore = create<GameStore>((set, get) => ({
  gameMode: null,
  player1Character: null,
  player2Character: null,
  roomCode: null,
  isConnected: false,
  gameState: null,
  isGameRunning: false,
  isPaused: false,
  showTutorial: true,

  setGameMode: (mode) => set({ gameMode: mode }),
  setPlayer1Character: (char) => set({ player1Character: char }),
  setPlayer2Character: (char) => set({ player2Character: char }),
  setRoomCode: (code) => set({ roomCode: code }),
  setConnected: (connected) => set({ isConnected: connected }),
  setGameState: (state) => set({ gameState: state }),
  setGameRunning: (running) => set({ isGameRunning: running }),
  setPaused: (paused) => set({ isPaused: paused }),
  setShowTutorial: (show) => set({ showTutorial: show }),

  updateHealth: (player, health) => {
    const { gameState } = get();
    if (!gameState) return;

    if (player === 1) {
      set({ gameState: { ...gameState, player1: { ...gameState.player1, health } } });
    } else {
      set({ gameState: { ...gameState, player2: { ...gameState.player2, health } } });
    }
  },

  updateRoundsWon: (player, rounds) => {
    const { gameState } = get();
    if (!gameState) return;

    if (player === 1) {
      set({ gameState: { ...gameState, player1: { ...gameState.player1, roundsWon: rounds } } });
    } else {
      set({ gameState: { ...gameState, player2: { ...gameState.player2, roundsWon: rounds } } });
    }
  },

  resetGame: () => {
    const { player1Character, player2Character } = get();
    if (!player1Character || !player2Character) return;

    set({
      gameState: {
        player1: createInitialPlayerState(1, player1Character),
        player2: createInitialPlayerState(2, player2Character),
        currentRound: 1,
        maxRounds: GAME_CONFIG.MAX_ROUNDS,
        roundTimer: GAME_CONFIG.ROUND_TIME,
        matchPhase: 'intro',
        frameNumber: 0,
        winner: null,
        roundWinner: null,
      },
      isGameRunning: true,
      isPaused: false,
    });
  },
}));
