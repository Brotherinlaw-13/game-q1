import { Fighter } from '../entities/Fighter';
import { HitResult } from '../../types/game.types';

export class CollisionSystem {
  /**
   * Check if the attacker's active hitbox overlaps with the defender's hurtbox
   * @param attacker The attacking fighter
   * @param defender The defending fighter
   * @returns HitResult if there's a hit, null otherwise
   */
  public checkHit(attacker: Fighter, defender: Fighter): HitResult | null {
    // Get attacker's active hitbox (only available during active attack frames)
    const hitbox = attacker.getActiveHitbox();
    if (!hitbox) {
      return null;
    }

    // Get defender's hurtbox
    const hurtbox = defender.getHurtbox();

    // Check for rectangle overlap using AABB collision detection
    if (!this.rectanglesOverlap(hitbox, hurtbox)) {
      return null;
    }

    // Get the current move data from the attacker
    const moveData = attacker.currentMove;
    if (!moveData) {
      return null;
    }

    // Determine if the hit is blocked
    // To block, defender must be blocking AND facing the attacker
    const isBlocked = this.isHitBlocked(attacker, defender);

    return {
      damage: moveData.damage,
      hitStun: moveData.hitStun,
      blockStun: moveData.blockStun,
      knockback: moveData.knockback,
      isBlocked,
    };
  }

  /**
   * Check if two rectangles overlap (AABB collision)
   */
  private rectanglesOverlap(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Determine if a hit is blocked
   * - Defender must be in a blocking state
   * - Defender must be facing the attacker
   */
  private isHitBlocked(attacker: Fighter, defender: Fighter): boolean {
    // Check if defender is blocking
    if (!defender.isBlocking()) {
      return false;
    }

    // Check if defender is facing the attacker
    // Defender needs to be facing towards the attacker to block
    const defenderFacingAttacker = this.isFacingOpponent(defender, attacker);

    return defenderFacingAttacker;
  }

  /**
   * Check if fighter1 is facing fighter2
   */
  private isFacingOpponent(fighter1: Fighter, fighter2: Fighter): boolean {
    if (fighter1.facingDirection === 'right') {
      return fighter2.x > fighter1.x;
    } else {
      return fighter2.x < fighter1.x;
    }
  }

  /**
   * Check if two fighters' hurtboxes overlap (for push collision)
   */
  public checkBodyCollision(fighter1: Fighter, fighter2: Fighter): boolean {
    const hurtbox1 = fighter1.getHurtbox();
    const hurtbox2 = fighter2.getHurtbox();

    return this.rectanglesOverlap(hurtbox1, hurtbox2);
  }

  /**
   * Resolve body collision by pushing fighters apart
   */
  public resolveBodyCollision(fighter1: Fighter, fighter2: Fighter): void {
    const hurtbox1 = fighter1.getHurtbox();
    const hurtbox2 = fighter2.getHurtbox();

    // Calculate overlap
    const overlapX = Math.min(
      hurtbox1.x + hurtbox1.width - hurtbox2.x,
      hurtbox2.x + hurtbox2.width - hurtbox1.x
    );

    if (overlapX > 0) {
      // Push both fighters apart by half the overlap
      const pushAmount = overlapX / 2;

      if (fighter1.x < fighter2.x) {
        fighter1.x -= pushAmount;
        fighter2.x += pushAmount;
      } else {
        fighter1.x += pushAmount;
        fighter2.x -= pushAmount;
      }
    }
  }
}
