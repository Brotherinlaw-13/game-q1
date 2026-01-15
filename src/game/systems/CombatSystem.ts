import { Fighter } from '../entities/Fighter';
import { HitResult } from '../../types/game.types';

export class CombatSystem {
  private static readonly CHIP_DAMAGE = 1;

  /**
   * Apply hit result to the defender
   * @param attacker The attacking fighter (unused but kept for potential extensions)
   * @param defender The defending fighter
   * @param hitResult The hit result containing damage, stun, etc.
   * @returns true if the defender is KO'd (health <= 0), false otherwise
   */
  public applyHit(
    _attacker: Fighter,
    defender: Fighter,
    hitResult: HitResult
  ): boolean {
    if (hitResult.isBlocked) {
      // Blocked hit - apply chip damage and block stun
      defender.takeDamage(CombatSystem.CHIP_DAMAGE, 0, 0);
      defender.applyBlockStun(hitResult.blockStun, hitResult.knockback);
    } else {
      // Clean hit - apply full damage, hit stun, and knockback
      defender.takeDamage(
        hitResult.damage,
        hitResult.knockback,
        hitResult.hitStun
      );
    }

    // Check for KO
    return defender.health <= 0;
  }

  /**
   * Process combat between two fighters
   * Called each frame to check and apply hits
   * @param fighter1 First fighter
   * @param fighter2 Second fighter
   * @param collisionSystem Reference to collision system for hit detection
   * @returns Object indicating if either fighter was KO'd
   */
  public processCombat(
    fighter1: Fighter,
    fighter2: Fighter,
    checkHit: (attacker: Fighter, defender: Fighter) => HitResult | null
  ): { fighter1KO: boolean; fighter2KO: boolean } {
    let fighter1KO = false;
    let fighter2KO = false;

    // Check if fighter1 hits fighter2
    const hit1to2 = checkHit(fighter1, fighter2);
    if (hit1to2) {
      fighter2KO = this.applyHit(fighter1, fighter2, hit1to2);
    }

    // Check if fighter2 hits fighter1
    const hit2to1 = checkHit(fighter2, fighter1);
    if (hit2to1) {
      fighter1KO = this.applyHit(fighter2, fighter1, hit2to1);
    }

    return { fighter1KO, fighter2KO };
  }

  /**
   * Calculate winner based on health when time runs out
   * @param fighter1 First fighter
   * @param fighter2 Second fighter
   * @returns 1 if fighter1 wins, 2 if fighter2 wins, null if draw
   */
  public determineTimeoutWinner(
    fighter1: Fighter,
    fighter2: Fighter
  ): 1 | 2 | null {
    if (fighter1.health > fighter2.health) {
      return 1;
    } else if (fighter2.health > fighter1.health) {
      return 2;
    }
    return null; // Draw
  }

  /**
   * Calculate health percentage for UI display
   */
  public getHealthPercentage(fighter: Fighter): number {
    return (fighter.health / fighter.maxHealth) * 100;
  }
}
