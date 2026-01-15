import Phaser from 'phaser';
import {
  FighterState,
  PlayerInput,
  CharacterId,
  MoveData,
} from '../../types/game.types';
import { GAME_CONFIG, MOVE_DATA } from '../../constants/gameConstants';
import { SoundSystem } from '../systems/SoundSystem';

type AttackState = 'high_punch' | 'low_punch' | 'high_kick' | 'low_kick';

export class Fighter extends Phaser.GameObjects.Sprite {
  public health: number;
  public maxHealth: number;
  public state: FighterState;
  public facingDirection: 'left' | 'right';
  public velocityX: number;
  public velocityY: number;
  public hitStun: number;
  public blockStun: number;
  public stateFrame: number;
  public currentMove: MoveData | null;

  public readonly playerId: 1 | 2;
  public readonly characterId: CharacterId;

  private isGrounded: boolean;
  private lastState: FighterState;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: 1 | 2,
    characterId: CharacterId
  ) {
    super(scene, x, y, `fighter-${characterId}`);

    this.playerId = playerId;
    this.characterId = characterId;

    // Initialize state
    this.health = GAME_CONFIG.MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.MAX_HEALTH;
    this.state = 'idle';
    this.lastState = 'idle';
    this.facingDirection = playerId === 1 ? 'right' : 'left';
    this.velocityX = 0;
    this.velocityY = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.stateFrame = 0;
    this.currentMove = null;
    this.isGrounded = true;

    // Set origin to bottom center for proper ground alignment
    this.setOrigin(0.5, 1);

    // Scale for 128x128 sprites (smaller scale since sprites are bigger now)
    this.setScale(1.5);

    // Flip based on facing direction
    this.setFlipX(this.facingDirection === 'left');

    // Add to scene
    scene.add.existing(this);

    // Play idle animation
    this.play(`${characterId}-idle`);
  }

  public tick(input: PlayerInput): void {
    // Handle hit stun - fighter is stunned and cannot act
    if (this.hitStun > 0) {
      this.hitStun--;
      this.applyGravity();
      this.updatePosition();
      this.updateAnimation();
      if (this.hitStun === 0 && this.isGrounded) {
        this.state = 'idle';
      }
      return;
    }

    // Handle block stun - fighter is in block recovery
    if (this.blockStun > 0) {
      this.blockStun--;
      this.updatePosition();
      this.updateAnimation();
      if (this.blockStun === 0) {
        this.state = 'idle';
      }
      return;
    }

    // Handle attack states
    if (this.isAttacking()) {
      this.handleAttackState();
      this.applyGravity();
      this.updatePosition();
      this.updateAnimation();
      return;
    }

    // Reset velocity
    this.velocityX = 0;

    // Handle movement input
    if (input.down) {
      // Crouching or blocking
      if (this.isGrounded) {
        const holdingBack = this.isHoldingBack(input);
        this.state = holdingBack ? 'blocking' : 'crouching';
      }
    } else if (input.up && this.isGrounded) {
      // Jump
      this.velocityY = GAME_CONFIG.JUMP_FORCE;
      this.isGrounded = false;
      this.state = 'jumping';
      SoundSystem.playJump();
    } else if (input.left) {
      this.velocityX = -GAME_CONFIG.PLAYER_SPEED;
      if (this.isGrounded) {
        this.state = this.facingDirection === 'left' ? 'walking_forward' : 'walking_backward';
      }
    } else if (input.right) {
      this.velocityX = GAME_CONFIG.PLAYER_SPEED;
      if (this.isGrounded) {
        this.state = this.facingDirection === 'right' ? 'walking_forward' : 'walking_backward';
      }
    } else if (this.isGrounded) {
      this.state = 'idle';
    }

    // Handle attack inputs (only if grounded and not already attacking)
    if (this.isGrounded && !this.isAttacking()) {
      if (input.highPunch) {
        this.startAttack('high_punch');
      } else if (input.lowPunch) {
        this.startAttack('low_punch');
      } else if (input.highKick) {
        this.startAttack('high_kick');
      } else if (input.lowKick) {
        this.startAttack('low_kick');
      }
    }

    // Apply gravity
    this.applyGravity();

    // Update position
    this.updatePosition();

    // Update animation
    this.updateAnimation();
  }

  public takeDamage(amount: number, knockback: number, hitStunFrames: number): void {
    this.health = Math.max(0, this.health - amount);

    // Apply knockback in the direction away from attacker
    const knockbackDirection = this.facingDirection === 'right' ? -1 : 1;
    this.velocityX = knockback * knockbackDirection;

    // Set hit stun
    this.hitStun = hitStunFrames;
    this.state = 'hit_stun';

    // Cancel any current attack
    this.currentMove = null;
    this.stateFrame = 0;
  }

  public applyBlockStun(blockStunFrames: number, pushback: number): void {
    this.blockStun = blockStunFrames;
    this.state = 'blocking';

    // Apply pushback
    const pushDirection = this.facingDirection === 'right' ? -1 : 1;
    this.velocityX = pushback * pushDirection * 0.5;
  }

  public getHurtbox(): { x: number; y: number; width: number; height: number } {
    // Hitbox based on sprite size (128x128 * 1.5 scale)
    const scale = 1.5;
    const width = 128 * scale;
    const height = 128 * scale;
    return {
      x: this.x - width / 2,
      y: this.y - height,
      width: width,
      height: height,
    };
  }

  public getActiveHitbox(): { x: number; y: number; width: number; height: number } | null {
    if (!this.currentMove) return null;

    const startup = this.currentMove.startup;
    const active = this.currentMove.active;

    // Check if we're in active frames
    if (this.stateFrame < startup || this.stateFrame >= startup + active) {
      return null;
    }

    // Calculate hitbox position based on facing direction
    const hitboxData = this.currentMove.hitbox;
    const directionMultiplier = this.facingDirection === 'right' ? 1 : -1;
    const scale = 1.5;

    return {
      x: this.x + (hitboxData.x * directionMultiplier * scale) - (hitboxData.width * scale) / 2,
      y: this.y - 128 * scale + hitboxData.y * scale - (hitboxData.height * scale) / 2,
      width: hitboxData.width * scale,
      height: hitboxData.height * scale,
    };
  }

  public isBlocking(): boolean {
    return this.state === 'blocking' || this.state === 'crouching';
  }

  public setFacingDirection(direction: 'left' | 'right'): void {
    this.facingDirection = direction;
    this.setFlipX(direction === 'left');
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.state = 'idle';
    this.lastState = 'idle';
    this.velocityX = 0;
    this.velocityY = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.stateFrame = 0;
    this.currentMove = null;
    this.isGrounded = true;
    this.play(`${this.characterId}-idle`);
  }

  public setVictory(): void {
    this.state = 'victory';
    this.velocityX = 0;
    this.velocityY = 0;
  }

  public setDefeat(): void {
    this.state = 'defeat';
    this.velocityX = 0;
    this.velocityY = 0;
  }

  private isAttacking(): boolean {
    return (
      this.state === 'high_punch' ||
      this.state === 'low_punch' ||
      this.state === 'high_kick' ||
      this.state === 'low_kick'
    );
  }

  private startAttack(attackType: AttackState): void {
    this.state = attackType;
    this.currentMove = MOVE_DATA[attackType];
    this.stateFrame = 0;
    this.velocityX = 0;

    // Play attack sound
    if (attackType === 'high_punch' || attackType === 'low_punch') {
      SoundSystem.playPunch();
    } else {
      SoundSystem.playKick();
    }
  }

  private handleAttackState(): void {
    if (!this.currentMove) return;

    this.stateFrame++;

    const totalFrames =
      this.currentMove.startup + this.currentMove.active + this.currentMove.recovery;

    // Check if attack animation is complete
    if (this.stateFrame >= totalFrames) {
      this.state = 'idle';
      this.currentMove = null;
      this.stateFrame = 0;
    }
  }

  private isHoldingBack(input: PlayerInput): boolean {
    if (this.facingDirection === 'right') {
      return input.left;
    } else {
      return input.right;
    }
  }

  private applyGravity(): void {
    if (!this.isGrounded) {
      this.velocityY += GAME_CONFIG.GRAVITY;
    }
  }

  private updatePosition(): void {
    // Update X position
    this.x += this.velocityX;

    // Clamp to stage bounds
    this.x = Phaser.Math.Clamp(
      this.x,
      GAME_CONFIG.STAGE_LEFT_BOUND,
      GAME_CONFIG.STAGE_RIGHT_BOUND
    );

    // Update Y position
    this.y += this.velocityY;

    // Check ground collision
    if (this.y >= GAME_CONFIG.GROUND_Y) {
      this.y = GAME_CONFIG.GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
      if (this.state === 'jumping') {
        this.state = 'idle';
      }
    } else {
      this.isGrounded = false;
    }

    // Dampen horizontal velocity when grounded (for knockback)
    if (this.isGrounded && this.hitStun > 0) {
      this.velocityX *= 0.9;
    }
  }

  private updateAnimation(): void {
    // Map state to animation name
    let animName: string;

    switch (this.state) {
      case 'idle':
        animName = 'idle';
        break;
      case 'walking_forward':
      case 'walking_backward':
        animName = 'walk';
        break;
      case 'jumping':
        animName = 'jump';
        break;
      case 'crouching':
        animName = 'crouch';
        break;
      case 'blocking':
        animName = 'block';
        break;
      case 'high_punch':
        animName = 'high_punch';
        break;
      case 'low_punch':
        animName = 'low_punch';
        break;
      case 'high_kick':
        animName = 'high_kick';
        break;
      case 'low_kick':
        animName = 'low_kick';
        break;
      case 'hit_stun':
        animName = 'hit';
        break;
      case 'victory':
        animName = 'victory';
        break;
      case 'defeat':
        animName = 'defeat';
        break;
      default:
        animName = 'idle';
    }

    const fullAnimKey = `${this.characterId}-${animName}`;

    // Only change animation if state changed
    if (this.state !== this.lastState) {
      this.play(fullAnimKey);
      this.lastState = this.state;
    }

    // Flash when hit
    if (this.state === 'hit_stun') {
      this.setAlpha(this.hitStun % 4 < 2 ? 0.5 : 1);
    } else {
      this.setAlpha(1);
    }
  }
}
