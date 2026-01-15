import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { InputSystem } from '../systems/InputSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { SoundSystem } from '../systems/SoundSystem';
import { EventBus, GameEvents } from '../EventBus';
import { GAME_CONFIG } from '../../constants/gameConstants';

interface RoundState {
  player1RoundsWon: number;
  player2RoundsWon: number;
  currentRound: number;
  timer: number;
  phase: 'intro' | 'fighting' | 'round_end' | 'match_end';
}

export class FightScene extends Phaser.Scene {
  private player1!: Fighter;
  private player2!: Fighter;
  private inputSystem!: InputSystem;
  private collisionSystem!: CollisionSystem;

  private roundState!: RoundState;
  private lastTimerUpdate: number = 0;
  private roundEndTimer: number = 0;

  // Track hits that have already been processed to prevent multi-hits
  private processedHits: Set<string> = new Set();

  // Previous health values for change detection
  private prevPlayer1Health: number = GAME_CONFIG.MAX_HEALTH;
  private prevPlayer2Health: number = GAME_CONFIG.MAX_HEALTH;

  constructor() {
    super({ key: 'FightScene' });
  }

  create(): void {
    // Draw the background
    this.drawBackground();

    // Initialize round state
    this.roundState = {
      player1RoundsWon: 0,
      player2RoundsWon: 0,
      currentRound: 1,
      timer: GAME_CONFIG.ROUND_TIME,
      phase: 'intro',
    };

    // Create fighters
    this.player1 = new Fighter(this, 300, GAME_CONFIG.GROUND_Y, 1, 'will');
    this.player2 = new Fighter(this, 980, GAME_CONFIG.GROUND_Y, 2, 'ed');

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.collisionSystem = new CollisionSystem();

    // Initialize timer tracking
    this.lastTimerUpdate = this.time.now;

    // Reset health tracking
    this.prevPlayer1Health = this.player1.health;
    this.prevPlayer2Health = this.player2.health;

    // Start the round after a brief intro
    this.time.delayedCall(1500, () => {
      this.startRound();
    });

    // Emit initial state to UI
    this.emitHealthUpdate();
    this.emitTimerUpdate();
  }

  update(time: number, _delta: number): void {
    // Don't process game logic during certain phases
    if (this.roundState.phase === 'intro') {
      return;
    }

    if (this.roundState.phase === 'match_end') {
      return;
    }

    if (this.roundState.phase === 'round_end') {
      this.roundEndTimer -= 1;
      if (this.roundEndTimer <= 0) {
        this.startNextRound();
      }
      return;
    }

    // Get inputs for both players
    const player1Input = this.inputSystem.getInput(1);
    const player2Input = this.inputSystem.getInput(2);

    // Update fighters with their inputs
    this.player1.tick(player1Input);
    this.player2.tick(player2Input);

    // Auto-face opponents
    this.updateFacingDirections();

    // Check collisions and handle combat
    this.handleCombat();

    // Handle body collision (push apart)
    if (this.collisionSystem.checkBodyCollision(this.player1, this.player2)) {
      this.collisionSystem.resolveBodyCollision(this.player1, this.player2);
    }

    // Emit health updates if changed
    if (this.player1.health !== this.prevPlayer1Health ||
        this.player2.health !== this.prevPlayer2Health) {
      this.emitHealthUpdate();
      this.prevPlayer1Health = this.player1.health;
      this.prevPlayer2Health = this.player2.health;
    }

    // Update timer (every second)
    if (time - this.lastTimerUpdate >= 1000) {
      this.lastTimerUpdate = time;
      this.roundState.timer--;
      this.emitTimerUpdate();

      // Play warning sound when timer is low
      if (this.roundState.timer <= 10 && this.roundState.timer > 0) {
        SoundSystem.playTimerWarning();
      }

      // Check for time out
      if (this.roundState.timer <= 0) {
        this.handleTimeOut();
      }
    }

    // Check for KO
    this.checkRoundEnd();
  }

  private drawBackground(): void {
    const width = GAME_CONFIG.CANVAS_WIDTH;
    const height = GAME_CONFIG.CANVAS_HEIGHT;
    const groundY = GAME_CONFIG.GROUND_Y;

    // Dark gradient sky
    const skyGradient = this.add.graphics();
    skyGradient.fillGradientStyle(0x0f0f23, 0x0f0f23, 0x1a1a3e, 0x1a1a3e, 1);
    skyGradient.fillRect(0, 0, width, groundY);

    // Stars
    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
      const starX = Phaser.Math.Between(0, width);
      const starY = Phaser.Math.Between(0, groundY - 100);
      const starSize = Phaser.Math.Between(1, 3);
      const starAlpha = Phaser.Math.FloatBetween(0.3, 1);

      const star = this.add.circle(starX, starY, starSize, 0xffffff, starAlpha);
      star.setDepth(-10);
    }

    // City silhouette - distant buildings
    const buildingColors = [0x0a0a15, 0x0d0d1a, 0x10101f];
    const buildingData = [
      { x: 50, width: 80, height: 200 },
      { x: 130, width: 60, height: 280 },
      { x: 200, width: 100, height: 240 },
      { x: 310, width: 70, height: 320 },
      { x: 390, width: 90, height: 260 },
      { x: 490, width: 120, height: 300 },
      { x: 620, width: 80, height: 220 },
      { x: 710, width: 100, height: 340 },
      { x: 820, width: 70, height: 280 },
      { x: 900, width: 110, height: 260 },
      { x: 1020, width: 80, height: 320 },
      { x: 1110, width: 90, height: 240 },
      { x: 1210, width: 70, height: 300 },
    ];

    // Draw buildings
    buildingData.forEach((building, index) => {
      const color = buildingColors[index % buildingColors.length];
      const buildingRect = this.add.rectangle(
        building.x + building.width / 2,
        groundY - building.height / 2,
        building.width,
        building.height,
        color
      );
      buildingRect.setDepth(-5);

      // Add some windows (small lit rectangles)
      const windowsPerRow = Math.floor(building.width / 15);
      const windowsPerCol = Math.floor(building.height / 20);

      for (let row = 0; row < windowsPerCol; row++) {
        for (let col = 0; col < windowsPerRow; col++) {
          // Only some windows are lit
          if (Phaser.Math.Between(0, 100) < 30) {
            const windowX = building.x + 8 + col * 15;
            const windowY = groundY - building.height + 10 + row * 20;
            const windowColor = Phaser.Math.Between(0, 100) < 70 ? 0xffee88 : 0x88ccff;
            const windowRect = this.add.rectangle(windowX, windowY, 8, 10, windowColor, 0.6);
            windowRect.setDepth(-4);
          }
        }
      }
    });

    // Ground platform
    const ground = this.add.rectangle(
      width / 2,
      groundY + (height - groundY) / 2,
      width,
      height - groundY,
      0x2a2a4a
    );
    ground.setDepth(-3);

    // Ground line highlight
    const groundLine = this.add.rectangle(
      width / 2,
      groundY,
      width,
      4,
      0x4a4a6a
    );
    groundLine.setDepth(-2);

    // Stage boundaries (subtle indicators)
    const leftBound = this.add.rectangle(
      GAME_CONFIG.STAGE_LEFT_BOUND,
      groundY - 60,
      4,
      120,
      0x3a3a5a,
      0.5
    );
    leftBound.setDepth(-1);

    const rightBound = this.add.rectangle(
      GAME_CONFIG.STAGE_RIGHT_BOUND,
      groundY - 60,
      4,
      120,
      0x3a3a5a,
      0.5
    );
    rightBound.setDepth(-1);
  }

  private startRound(): void {
    this.roundState.phase = 'fighting';
    this.roundState.timer = GAME_CONFIG.ROUND_TIME;
    this.processedHits.clear();

    // Play round start sound
    SoundSystem.playRoundStart();

    // Emit round start event
    EventBus.emit(GameEvents.ROUND_START, {
      round: this.roundState.currentRound,
    });

    this.emitTimerUpdate();
  }

  private updateFacingDirections(): void {
    // Fighters should always face each other
    if (this.player1.x < this.player2.x) {
      this.player1.setFacingDirection('right');
      this.player2.setFacingDirection('left');
    } else {
      this.player1.setFacingDirection('left');
      this.player2.setFacingDirection('right');
    }
  }

  private handleCombat(): void {
    // Generate unique hit IDs to prevent multi-hits
    const p1HitId = `p1-${this.player1.state}-${this.player1.stateFrame}`;
    const p2HitId = `p2-${this.player2.state}-${this.player2.stateFrame}`;

    // Check Player 1 hitting Player 2
    if (!this.processedHits.has(p1HitId)) {
      const hitResult = this.collisionSystem.checkHit(this.player1, this.player2);
      if (hitResult) {
        this.processedHits.add(p1HitId);
        this.applyHit(this.player2, hitResult);
        this.createHitEffect(this.player2.x, this.player2.y - 60, hitResult.isBlocked);
      }
    }

    // Check Player 2 hitting Player 1
    if (!this.processedHits.has(p2HitId)) {
      const hitResult = this.collisionSystem.checkHit(this.player2, this.player1);
      if (hitResult) {
        this.processedHits.add(p2HitId);
        this.applyHit(this.player1, hitResult);
        this.createHitEffect(this.player1.x, this.player1.y - 60, hitResult.isBlocked);
      }
    }
  }

  private applyHit(
    defender: Fighter,
    hitResult: { damage: number; hitStun: number; blockStun: number; knockback: number; isBlocked: boolean }
  ): void {
    if (hitResult.isBlocked) {
      defender.applyBlockStun(hitResult.blockStun, hitResult.knockback);
      SoundSystem.playBlock();
      EventBus.emit(GameEvents.HIT_LANDED, { blocked: true, damage: 0 });
    } else {
      defender.takeDamage(hitResult.damage, hitResult.knockback, hitResult.hitStun);
      SoundSystem.playHit();
      EventBus.emit(GameEvents.HIT_LANDED, { blocked: false, damage: hitResult.damage });
    }
  }

  private createHitEffect(x: number, y: number, isBlocked: boolean): void {
    // Create a simple hit spark effect
    const color = isBlocked ? 0x4444ff : 0xffff00;
    const spark = this.add.circle(x, y, 20, color, 0.8);

    // Animate and destroy
    this.tweens.add({
      targets: spark,
      scale: 2,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        spark.destroy();
      },
    });

    // Screen shake on hit (not on block)
    if (!isBlocked) {
      this.cameras.main.shake(100, 0.01);
    }
  }

  private checkRoundEnd(): void {
    if (this.roundState.phase !== 'fighting') return;

    let roundWinner: 1 | 2 | null = null;

    // Check for KO
    if (this.player1.health <= 0 && this.player2.health <= 0) {
      // Double KO - no winner this round, but we still end the round
      roundWinner = null;
    } else if (this.player1.health <= 0) {
      roundWinner = 2;
    } else if (this.player2.health <= 0) {
      roundWinner = 1;
    }

    if (roundWinner !== null || (this.player1.health <= 0 && this.player2.health <= 0)) {
      this.endRound(roundWinner);
    }
  }

  private handleTimeOut(): void {
    if (this.roundState.phase !== 'fighting') return;

    // Time's up - winner is whoever has more health
    let roundWinner: 1 | 2 | null = null;

    if (this.player1.health > this.player2.health) {
      roundWinner = 1;
    } else if (this.player2.health > this.player1.health) {
      roundWinner = 2;
    }
    // If health is equal, no winner (draw)

    this.endRound(roundWinner);
  }

  private endRound(winner: 1 | 2 | null): void {
    this.roundState.phase = 'round_end';
    this.roundEndTimer = 180; // ~3 seconds at 60fps

    // Play KO sound
    SoundSystem.playKO();

    if (winner === 1) {
      this.roundState.player1RoundsWon++;
      this.player1.setVictory();
      this.player2.setDefeat();
    } else if (winner === 2) {
      this.roundState.player2RoundsWon++;
      this.player2.setVictory();
      this.player1.setDefeat();
    }
    // If winner is null (draw), neither player gets a round

    // Emit round end event
    EventBus.emit(GameEvents.ROUND_END, {
      winner,
      round: this.roundState.currentRound,
      player1RoundsWon: this.roundState.player1RoundsWon,
      player2RoundsWon: this.roundState.player2RoundsWon,
    });

    // Check for match end
    if (
      this.roundState.player1RoundsWon >= GAME_CONFIG.ROUNDS_TO_WIN ||
      this.roundState.player2RoundsWon >= GAME_CONFIG.ROUNDS_TO_WIN
    ) {
      this.endMatch();
    }
  }

  private startNextRound(): void {
    if (this.roundState.phase === 'match_end') return;

    this.roundState.currentRound++;
    this.roundState.timer = GAME_CONFIG.ROUND_TIME;
    this.roundState.phase = 'intro';

    // Reset fighters for next round
    this.player1.reset(300, GAME_CONFIG.GROUND_Y);
    this.player2.reset(980, GAME_CONFIG.GROUND_Y);

    // Reset health tracking
    this.prevPlayer1Health = this.player1.health;
    this.prevPlayer2Health = this.player2.health;

    // Emit health update after reset
    this.emitHealthUpdate();

    // Brief intro before fighting
    this.time.delayedCall(1500, () => {
      this.startRound();
    });
  }

  private endMatch(): void {
    this.roundState.phase = 'match_end';

    const matchWinner = this.roundState.player1RoundsWon > this.roundState.player2RoundsWon ? 1 : 2;

    // Play victory sound
    SoundSystem.playVictory();

    EventBus.emit(GameEvents.MATCH_END, {
      winner: matchWinner,
      player1RoundsWon: this.roundState.player1RoundsWon,
      player2RoundsWon: this.roundState.player2RoundsWon,
    });
  }

  private emitHealthUpdate(): void {
    EventBus.emit(GameEvents.HEALTH_UPDATE, {
      player1Health: this.player1.health,
      player1MaxHealth: this.player1.maxHealth,
      player2Health: this.player2.health,
      player2MaxHealth: this.player2.maxHealth,
    });
  }

  private emitTimerUpdate(): void {
    EventBus.emit(GameEvents.TIMER_UPDATE, {
      timer: this.roundState.timer,
      round: this.roundState.currentRound,
    });
  }

  shutdown(): void {
    // Clean up
    this.inputSystem.destroy();
    this.player1.destroy();
    this.player2.destroy();
  }
}
