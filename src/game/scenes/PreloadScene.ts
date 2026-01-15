import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Show loading text
    const loadingText = this.add.text(640, 360, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    loadingText.setOrigin(0.5);

    // Load sprite sheets (128x128 frames)
    this.load.spritesheet('fighter-will', '/assets/sprites/will/spritesheet.png', {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.spritesheet('fighter-ed', '/assets/sprites/ed/spritesheet.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create(): void {
    // Create animations for both characters
    this.createAnimations('will');
    this.createAnimations('ed');

    // Create effect textures
    this.createEffectTextures();

    // Start the fight scene
    this.scene.start('FightScene');
  }

  private createAnimations(character: 'will' | 'ed'): void {
    const key = `fighter-${character}`;
    const anims = this.anims;

    // Animation config based on spritesheet.json
    const animConfigs = [
      { name: 'idle', start: 0, end: 3, frameRate: 8, repeat: -1 },
      { name: 'walk', start: 4, end: 9, frameRate: 10, repeat: -1 },
      { name: 'jump', start: 10, end: 13, frameRate: 10, repeat: 0 },
      { name: 'crouch', start: 14, end: 15, frameRate: 8, repeat: 0 },
      { name: 'high_punch', start: 16, end: 20, frameRate: 15, repeat: 0 },
      { name: 'low_punch', start: 21, end: 24, frameRate: 15, repeat: 0 },
      { name: 'high_kick', start: 25, end: 30, frameRate: 12, repeat: 0 },
      { name: 'low_kick', start: 31, end: 35, frameRate: 12, repeat: 0 },
      { name: 'hit', start: 36, end: 38, frameRate: 10, repeat: 0 },
      { name: 'block', start: 39, end: 40, frameRate: 8, repeat: 0 },
      { name: 'victory', start: 41, end: 44, frameRate: 6, repeat: -1 },
      { name: 'defeat', start: 45, end: 49, frameRate: 8, repeat: 0 },
    ];

    for (const config of animConfigs) {
      const animKey = `${character}-${config.name}`;

      // Skip if animation already exists
      if (anims.exists(animKey)) continue;

      anims.create({
        key: animKey,
        frames: anims.generateFrameNumbers(key, { start: config.start, end: config.end }),
        frameRate: config.frameRate,
        repeat: config.repeat,
      });
    }
  }

  private createEffectTextures(): void {
    // Hit spark effect
    const sparkGraphics = this.make.graphics({ x: 0, y: 0 });
    sparkGraphics.fillStyle(0xffffff, 1);
    sparkGraphics.fillCircle(15, 15, 15);
    sparkGraphics.fillStyle(0xffff00, 1);
    sparkGraphics.fillCircle(15, 15, 10);
    sparkGraphics.fillStyle(0xff6600, 1);
    sparkGraphics.fillCircle(15, 15, 5);
    sparkGraphics.generateTexture('hit-spark', 30, 30);
    sparkGraphics.destroy();

    // Block spark effect
    const blockGraphics = this.make.graphics({ x: 0, y: 0 });
    blockGraphics.fillStyle(0x4444ff, 0.8);
    blockGraphics.fillCircle(12, 12, 12);
    blockGraphics.fillStyle(0x8888ff, 1);
    blockGraphics.fillCircle(12, 12, 6);
    blockGraphics.generateTexture('block-spark', 24, 24);
    blockGraphics.destroy();
  }
}
