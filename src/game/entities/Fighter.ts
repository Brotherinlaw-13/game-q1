import Phaser from 'phaser';
import {
  FighterState,
  PlayerInput,
  CharacterId,
  MoveData,
} from '../../types/game.types';
import { GAME_CONFIG, MOVE_DATA, CHARACTER_INFO } from '../../constants/gameConstants';

type AttackState = 'high_punch' | 'low_punch' | 'high_kick' | 'low_kick';

export class Fighter extends Phaser.GameObjects.Container {
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

  private bodyRect: Phaser.GameObjects.Rectangle;
  private hitboxIndicator: Phaser.GameObjects.Rectangle;
  private isGrounded: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: 1 | 2,
    characterId: CharacterId
  ) {
    super(scene, x, y);

    this.playerId = playerId;
    this.characterId = characterId;

    // Initialize state
    this.health = GAME_CONFIG.MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.MAX_HEALTH;
    this.state = 'idle';
    this.facingDirection = playerId === 1 ? 'right' : 'left';
    this.velocityX = 0;
    this.velocityY = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.stateFrame = 0;
    this.currentMove = null;
    this.isGrounded = true;

    // Get character color
    const color = Phaser.Display.Color.HexStringToColor(
      CHARACTER_INFO[characterId].color
    ).color;

    // Create body rectangle (80x120)
    this.bodyRect = scene.add.rectangle(0, -60, 80, 120, color);
    this.bodyRect.setStrokeStyle(2, 0xffffff);
    this.add(this.bodyRect);

    // Create hitbox indicator (hidden by default)
    this.hitboxIndicator = scene.add.rectangle(0, 0, 40, 30, 0xffff00, 0.5);
    this.hitboxIndicator.setVisible(false);
    this.add(this.hitboxIndicator);

    // Add to scene
    scene.add.existing(this);
  }

  public tick(input: PlayerInput): void {
    // Handle hit stun - fighter is stunned and cannot act
    if (this.hitStun > 0) {
      this.hitStun--;
      this.applyGravity();
      this.updatePosition();
      this.updateVisuals();
      if (this.hitStun === 0 && this.isGrounded) {
        this.state = 'idle';
      }
      return;
    }

    // Handle block stun - fighter is in block recovery
    if (this.blockStun > 0) {
      this.blockStun--;
      this.updatePosition();
      this.updateVisuals();
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
      this.updateVisuals();
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

    // Update visuals
    this.updateVisuals();
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
    this.hitboxIndicator.setVisible(false);
  }

  public applyBlockStun(blockStunFrames: number, pushback: number): void {
    this.blockStun = blockStunFrames;
    this.state = 'blocking';

    // Apply pushback
    const pushDirection = this.facingDirection === 'right' ? -1 : 1;
    this.velocityX = pushback * pushDirection * 0.5;
  }

  public getHurtbox(): { x: number; y: number; width: number; height: number } {
    // Body is 80x120, centered at y=-60 relative to container
    return {
      x: this.x - 40,
      y: this.y - 120,
      width: 80,
      height: 120,
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

    return {
      x: this.x + hitboxData.x * directionMultiplier - hitboxData.width / 2,
      y: this.y - 60 + hitboxData.y - hitboxData.height / 2,
      width: hitboxData.width,
      height: hitboxData.height,
    };
  }

  public isBlocking(): boolean {
    return this.state === 'blocking' || this.state === 'crouching';
  }

  public setFacingDirection(direction: 'left' | 'right'): void {
    this.facingDirection = direction;
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.health = this.maxHealth;
    this.state = 'idle';
    this.velocityX = 0;
    this.velocityY = 0;
    this.hitStun = 0;
    this.blockStun = 0;
    this.stateFrame = 0;
    this.currentMove = null;
    this.isGrounded = true;
    this.hitboxIndicator.setVisible(false);
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
      this.hitboxIndicator.setVisible(false);
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

  private updateVisuals(): void {
    // Update body color based on state
    let alpha = 1;
    if (this.state === 'hit_stun') {
      // Flash when hit
      alpha = this.hitStun % 4 < 2 ? 0.5 : 1;
    } else if (this.state === 'blocking') {
      alpha = 0.8;
    } else if (this.state === 'crouching') {
      // Scale body to appear crouching
      this.bodyRect.setScale(1, 0.7);
      this.bodyRect.setY(-42);
    } else {
      this.bodyRect.setScale(1, 1);
      this.bodyRect.setY(-60);
    }

    this.bodyRect.setAlpha(alpha);

    // Update hitbox indicator
    if (this.currentMove) {
      const startup = this.currentMove.startup;
      const active = this.currentMove.active;

      if (this.stateFrame >= startup && this.stateFrame < startup + active) {
        // Show hitbox during active frames
        const hitboxData = this.currentMove.hitbox;
        const directionMultiplier = this.facingDirection === 'right' ? 1 : -1;

        this.hitboxIndicator.setPosition(
          hitboxData.x * directionMultiplier,
          -60 + hitboxData.y
        );
        this.hitboxIndicator.setSize(hitboxData.width, hitboxData.height);
        this.hitboxIndicator.setVisible(true);
      } else {
        this.hitboxIndicator.setVisible(false);
      }
    } else {
      this.hitboxIndicator.setVisible(false);
    }

    // Flip body based on facing direction
    this.bodyRect.setScale(this.facingDirection === 'left' ? -1 : 1, this.bodyRect.scaleY);
  }
}
