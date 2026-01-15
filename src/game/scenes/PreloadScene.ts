import Phaser from 'phaser';
import { CHARACTER_INFO } from '../../constants/gameConstants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    this.createFighterTextures();
    this.createHitboxTexture();
    this.createEffectTextures();

    // All textures created, start the fight scene
    this.scene.start('FightScene');
  }

  private createFighterTextures(): void {
    // Create Will's texture (red fighter)
    const willGraphics = this.make.graphics({ x: 0, y: 0 });
    willGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(CHARACTER_INFO.will.color).color, 1);
    willGraphics.fillRect(0, 0, 80, 120);
    // Add some details - head area
    willGraphics.fillStyle(0xffd6c4, 1); // Skin tone
    willGraphics.fillRect(20, 5, 40, 35);
    // Body outline
    willGraphics.lineStyle(2, 0x000000, 1);
    willGraphics.strokeRect(0, 0, 80, 120);
    willGraphics.generateTexture('fighter-will', 80, 120);
    willGraphics.destroy();

    // Create Ed's texture (blue fighter)
    const edGraphics = this.make.graphics({ x: 0, y: 0 });
    edGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(CHARACTER_INFO.ed.color).color, 1);
    edGraphics.fillRect(0, 0, 80, 120);
    // Add some details - head area
    edGraphics.fillStyle(0xffd6c4, 1); // Skin tone
    edGraphics.fillRect(20, 5, 40, 35);
    // Body outline
    edGraphics.lineStyle(2, 0x000000, 1);
    edGraphics.strokeRect(0, 0, 80, 120);
    edGraphics.generateTexture('fighter-ed', 80, 120);
    edGraphics.destroy();

    // Create crouching variants (shorter height)
    const willCrouchGraphics = this.make.graphics({ x: 0, y: 0 });
    willCrouchGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(CHARACTER_INFO.will.color).color, 1);
    willCrouchGraphics.fillRect(0, 0, 90, 70);
    willCrouchGraphics.fillStyle(0xffd6c4, 1);
    willCrouchGraphics.fillRect(25, 5, 40, 30);
    willCrouchGraphics.lineStyle(2, 0x000000, 1);
    willCrouchGraphics.strokeRect(0, 0, 90, 70);
    willCrouchGraphics.generateTexture('fighter-will-crouch', 90, 70);
    willCrouchGraphics.destroy();

    const edCrouchGraphics = this.make.graphics({ x: 0, y: 0 });
    edCrouchGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(CHARACTER_INFO.ed.color).color, 1);
    edCrouchGraphics.fillRect(0, 0, 90, 70);
    edCrouchGraphics.fillStyle(0xffd6c4, 1);
    edCrouchGraphics.fillRect(25, 5, 40, 30);
    edCrouchGraphics.lineStyle(2, 0x000000, 1);
    edCrouchGraphics.strokeRect(0, 0, 90, 70);
    edCrouchGraphics.generateTexture('fighter-ed-crouch', 90, 70);
    edCrouchGraphics.destroy();

    // Create attack pose variants
    this.createAttackTexture('will', CHARACTER_INFO.will.color, 'punch', 100, 120);
    this.createAttackTexture('will', CHARACTER_INFO.will.color, 'kick', 110, 120);
    this.createAttackTexture('ed', CHARACTER_INFO.ed.color, 'punch', 100, 120);
    this.createAttackTexture('ed', CHARACTER_INFO.ed.color, 'kick', 110, 120);
  }

  private createAttackTexture(character: string, color: string, attackType: 'punch' | 'kick', width: number, height: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
    graphics.fillRect(0, 0, 80, height);

    // Extended arm/leg for attack
    if (attackType === 'punch') {
      graphics.fillRect(80, 30, width - 80, 25); // Extended arm
    } else {
      graphics.fillRect(80, 70, width - 80, 30); // Extended leg
    }

    // Head
    graphics.fillStyle(0xffd6c4, 1);
    graphics.fillRect(20, 5, 40, 35);

    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, 80, height);
    if (attackType === 'punch') {
      graphics.strokeRect(80, 30, width - 80, 25);
    } else {
      graphics.strokeRect(80, 70, width - 80, 30);
    }

    graphics.generateTexture(`fighter-${character}-${attackType}`, width, height);
    graphics.destroy();
  }

  private createHitboxTexture(): void {
    // Yellow semi-transparent hitbox indicator
    const hitboxGraphics = this.make.graphics({ x: 0, y: 0 });
    hitboxGraphics.fillStyle(0xffff00, 0.5);
    hitboxGraphics.fillRect(0, 0, 50, 40);
    hitboxGraphics.lineStyle(2, 0xffff00, 1);
    hitboxGraphics.strokeRect(0, 0, 50, 40);
    hitboxGraphics.generateTexture('hitbox', 50, 40);
    hitboxGraphics.destroy();

    // Red hurtbox indicator (body collision)
    const hurtboxGraphics = this.make.graphics({ x: 0, y: 0 });
    hurtboxGraphics.fillStyle(0x00ff00, 0.3);
    hurtboxGraphics.fillRect(0, 0, 60, 100);
    hurtboxGraphics.lineStyle(2, 0x00ff00, 1);
    hurtboxGraphics.strokeRect(0, 0, 60, 100);
    hurtboxGraphics.generateTexture('hurtbox', 60, 100);
    hurtboxGraphics.destroy();
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
