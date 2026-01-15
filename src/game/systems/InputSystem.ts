import Phaser from 'phaser';
import { PlayerInput } from '../../types/game.types';
import { INPUT_MAPPINGS } from '../../constants/gameConstants';

export class InputSystem {
  private scene: Phaser.Scene;
  private keys: {
    player1: Record<keyof PlayerInput, Phaser.Input.Keyboard.Key>;
    player2: Record<keyof PlayerInput, Phaser.Input.Keyboard.Key>;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    if (!scene.input.keyboard) {
      throw new Error('Keyboard input not available');
    }

    const keyboard = scene.input.keyboard;

    // Initialize player 1 keys
    this.keys = {
      player1: {
        left: keyboard.addKey(INPUT_MAPPINGS.player1.left),
        right: keyboard.addKey(INPUT_MAPPINGS.player1.right),
        up: keyboard.addKey(INPUT_MAPPINGS.player1.up),
        down: keyboard.addKey(INPUT_MAPPINGS.player1.down),
        highPunch: keyboard.addKey(INPUT_MAPPINGS.player1.highPunch),
        lowPunch: keyboard.addKey(INPUT_MAPPINGS.player1.lowPunch),
        highKick: keyboard.addKey(INPUT_MAPPINGS.player1.highKick),
        lowKick: keyboard.addKey(INPUT_MAPPINGS.player1.lowKick),
      },
      player2: {
        left: keyboard.addKey(INPUT_MAPPINGS.player2.left),
        right: keyboard.addKey(INPUT_MAPPINGS.player2.right),
        up: keyboard.addKey(INPUT_MAPPINGS.player2.up),
        down: keyboard.addKey(INPUT_MAPPINGS.player2.down),
        highPunch: keyboard.addKey(INPUT_MAPPINGS.player2.highPunch),
        lowPunch: keyboard.addKey(INPUT_MAPPINGS.player2.lowPunch),
        highKick: keyboard.addKey(INPUT_MAPPINGS.player2.highKick),
        lowKick: keyboard.addKey(INPUT_MAPPINGS.player2.lowKick),
      },
    };
  }

  public getInput(playerId: 1 | 2): PlayerInput {
    const playerKeys = playerId === 1 ? this.keys.player1 : this.keys.player2;

    return {
      // Movement uses isDown for continuous input
      left: playerKeys.left.isDown,
      right: playerKeys.right.isDown,
      up: playerKeys.up.isDown,
      down: playerKeys.down.isDown,
      // Attacks use JustDown for single press detection
      highPunch: Phaser.Input.Keyboard.JustDown(playerKeys.highPunch),
      lowPunch: Phaser.Input.Keyboard.JustDown(playerKeys.lowPunch),
      highKick: Phaser.Input.Keyboard.JustDown(playerKeys.highKick),
      lowKick: Phaser.Input.Keyboard.JustDown(playerKeys.lowKick),
    };
  }

  public getRemoteInput(remoteInput: PlayerInput): PlayerInput {
    // For online play, directly return the remote input
    // This allows the game to process input received from the network
    return { ...remoteInput };
  }

  public destroy(): void {
    // Clean up key listeners
    if (this.scene.input.keyboard) {
      Object.values(this.keys.player1).forEach((key) => {
        this.scene.input.keyboard?.removeKey(key.keyCode);
      });
      Object.values(this.keys.player2).forEach((key) => {
        this.scene.input.keyboard?.removeKey(key.keyCode);
      });
    }
  }
}
