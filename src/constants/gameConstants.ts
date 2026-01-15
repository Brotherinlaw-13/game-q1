export const GAME_CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TIMESTEP: 1000 / 60,
  GRAVITY: 1.5,
  GROUND_Y: 550,
  ROUND_TIME: 99,
  ROUNDS_TO_WIN: 2,
  MAX_ROUNDS: 3,
  PLAYER_SPEED: 5,
  JUMP_FORCE: -20,
  MAX_HEALTH: 100,
  STAGE_LEFT_BOUND: 50,
  STAGE_RIGHT_BOUND: 1230,
};

// Using Phaser KeyCodes (numeric values)
export const INPUT_MAPPINGS = {
  player1: {
    left: 65,      // A
    right: 68,     // D
    up: 87,        // W
    down: 83,      // S
    highPunch: 84, // T
    lowPunch: 89,  // Y
    highKick: 71,  // G
    lowKick: 72,   // H
  },
  player2: {
    left: 37,      // ArrowLeft
    right: 39,     // ArrowRight
    up: 38,        // ArrowUp
    down: 40,      // ArrowDown
    highPunch: 85, // U
    lowPunch: 73,  // I
    highKick: 74,  // J
    lowKick: 75,   // K
  },
};

export const MOVE_DATA = {
  high_punch: {
    startup: 4,
    active: 2,
    recovery: 8,
    damage: 8,
    hitStun: 12,
    blockStun: 6,
    knockback: 10,
    hitbox: { x: 50, y: -30, width: 40, height: 30 },
  },
  low_punch: {
    startup: 3,
    active: 2,
    recovery: 6,
    damage: 5,
    hitStun: 8,
    blockStun: 4,
    knockback: 5,
    hitbox: { x: 45, y: 10, width: 35, height: 25 },
  },
  high_kick: {
    startup: 6,
    active: 3,
    recovery: 12,
    damage: 12,
    hitStun: 16,
    blockStun: 8,
    knockback: 20,
    hitbox: { x: 55, y: -20, width: 50, height: 35 },
  },
  low_kick: {
    startup: 5,
    active: 2,
    recovery: 10,
    damage: 10,
    hitStun: 14,
    blockStun: 6,
    knockback: 15,
    hitbox: { x: 50, y: 30, width: 45, height: 30 },
  },
};

export const CHARACTER_INFO = {
  will: {
    name: 'Will',
    color: '#e63946',
    description: 'A balanced fighter with solid fundamentals.',
  },
  ed: {
    name: 'Ed',
    color: '#457b9d',
    description: 'A technical fighter who rewards precision.',
  },
};
