import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Boot scene - immediately transition to PreloadScene
    this.scene.start('PreloadScene');
  }
}
