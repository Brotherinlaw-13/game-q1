export type FighterState =
  | 'idle'
  | 'walking_forward'
  | 'walking_backward'
  | 'jumping'
  | 'crouching'
  | 'high_punch'
  | 'low_punch'
  | 'high_kick'
  | 'low_kick'
  | 'blocking'
  | 'hit_stun'
  | 'knocked_down'
  | 'victory'
  | 'defeat';

export type CharacterId = 'will' | 'ed';

export interface PlayerInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  highPunch: boolean;
  lowPunch: boolean;
  highKick: boolean;
  lowKick: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  health: number;
  maxHealth: number;
  state: FighterState;
  facingDirection: 'left' | 'right';
  hitStun: number;
  blockStun: number;
  roundsWon: number;
  characterId: CharacterId;
  currentFrame: number;
  stateFrame: number;
}

export interface GameState {
  player1: PlayerState;
  player2: PlayerState;
  currentRound: number;
  maxRounds: number;
  roundTimer: number;
  matchPhase: 'intro' | 'fighting' | 'round_end' | 'match_end';
  frameNumber: number;
  winner: 1 | 2 | null;
  roundWinner: 1 | 2 | null;
}

export interface MoveData {
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  hitStun: number;
  blockStun: number;
  knockback: number;
  hitbox: { x: number; y: number; width: number; height: number };
}

export interface HitResult {
  damage: number;
  hitStun: number;
  blockStun: number;
  knockback: number;
  isBlocked: boolean;
}

export type GameMode = 'local' | 'online-host' | 'online-guest';
