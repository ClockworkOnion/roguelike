import { GameIF } from '../Builder/Interfaces/GameIF';
import { MapIF } from '../MapModel/Interfaces/MapIF';
import { Mob } from '../Mobs/Mob';
import { AutoHeal } from './AutoHeal';
import { LogMessage, EventCategory } from '../Messages/LogMessage';
import { WorldPoint } from '../MapModel/WorldPoint';
import { ObjectTypes } from '../ItemObjects/ObjectTypes';
import { EnvironmentChecker } from '../Environment/EnvironmentChecker';

/**
 * A class to handle adjustments to health of a mob.
 */
export class HealthAdjust {
  /**
   * Adjusts the health of a mob based on the specified amount.
   * @param {Mob} mob - The mob whose health is to be adjusted.
   * @param {number} amount - The amount by which the health will be adjusted.
   * @param {GameIF} game - The game interface.
   * @param {Mob} entity - The entity involved in the adjustment.
   */
  public static adjust(
    mob: Mob,
    amount: number,
    game: GameIF,
    entity: Mob,
  ): void {
    if (amount === 0) return;
    if (amount > 0) return this.heal(mob, amount);
    if (amount < 0) return this.damage(mob, -amount, game, entity);
  }

  /**
   * Heals the specified amount of health to the given mob.
   * @param {Mob} mob - The mob to be healed.
   * @param {number} amount - The amount of health to be healed.
   */
  public static heal(mob: Mob, amount: number): void {
    /*  console.log(`heal ${mob.hp} + ${amount}`); */
    const limit = mob.maxhp - mob.hp;
    if (amount > limit) amount = limit;
    mob.hp += amount;
    /*   console.log(`heal ${mob.hp}`); */
  }

  /**
   * Deals damage to the specified mob.
   * @param {Mob} mob - The mob to receive the damage.
   * @param {number} amount - The amount of damage to deal.
   * @param {GameIF} game - The game interface.
   * @param {Mob | null} attacker - The mob causing the damage.
   */
  static damage(
    mob: Mob,
    amount: number,
    game: GameIF,
    attacker: Mob | null,
  ): void {
    AutoHeal.combatResets(mob, attacker, game);
    /*  console.log('damage', amount, mob.hp); */
    mob.hp -= amount;
    /*     console.log('damage to', amount, mob.hp); */

    const s = this.generateDamageMessage(mob, amount);
    const msg = new LogMessage(s, EventCategory.playerDamage);
    if (mob.isPlayer) {
      game.flash(msg);
      game.addCurrentEvent(EventCategory.playerDamage);
    }

    const involvesPlayer =
      mob.isPlayer || (attacker !== null && attacker.isPlayer);

    if (mob.hp <= 0) this.mobDies(mob, game, involvesPlayer);
  }

  /**
   * Handles the death of the specified mob.
   * @param {Mob} mob - The mob that dies.
   * @param {GameIF} game - The game interface.
   */
  static mobDies(mob: Mob, game: GameIF, involvesPlayer: boolean): void {
    const s = `${mob.name} dies.`;
    const t = <EventCategory>EventCategory.mobDeath;

    const msg = new LogMessage(s, t);

    if (involvesPlayer) {
      game.message(msg);
      game.flash(msg);
      game.addCurrentEvent(EventCategory.mobDeath);
    }
    const map = <MapIF>game.currentMap();
    map.removeMob(mob);
    this.maybeDropLoot(mob, game);
  }

  /**
   * Determines if loot should be dropped for the specified mob.
   *
   * @param {Mob} mob - The mob for which loot may be dropped.
   * @param {GameIF} game - The game interface used to determine success.
   */
  static maybeDropLoot(mob: Mob, game: GameIF): void {
    if (game.rand.isOneIn(10)) this.dropLoot(mob.pos, game, mob.level);
  }

  /**
   * Drops loot at the specified position in the game map.
   *
   * @param {WorldPoint} pos - The position where the loot will be dropped.
   * @param {GameIF} game - The game interface.
   * @param {number} level - The level of the loot.
   */
  static dropLoot(pos: WorldPoint, game: GameIF, level: number): void {
    const map = <MapIF>game.currentMap();
    const lootCell = map.cell(pos);
    const canDrop = EnvironmentChecker.canItemsBeDropped(lootCell);

    if (!canDrop) {
      return;
    } else {
      const rand = game.rand;
      const objectLvl = level + 1;
      const obj = ObjectTypes.addRandomObjectForLevel(
        pos,
        map,
        rand,
        objectLvl,
      );
      const msg = new LogMessage(
        `You notice a ${obj.name()} dropping on the floor.`,
        EventCategory.drop,
      );
      game.message(msg);
    }
  }
  /**
   * Generates a message based on the damage percentage inflicted on the mob.
   *
   * @param {Mob} mob - The mob object taking the damage.
   * @param {number} amount - The amount of damage inflicted.
   * @return {string} The message describing the level of damage.
   */
  static generateDamageMessage(mob: Mob, amount: number): string {
    const damagePercentage = Math.round((amount / mob.hp) * 100);
    let message = '';

    if (damagePercentage >= 100) {
      message = `Everything around you begins to fade...`;
    } else if (damagePercentage >= 75) {
      message = `You are almost being taken out by a single blow! Run!`;
    } else if (damagePercentage >= 50) {
      message = `You take some major damage! This may end badly...`;
    } else if (damagePercentage >= 25) {
      message = `You receive a major blow!`;
    } else if (damagePercentage >= 10) {
      message = `You are feeling some pain!`;
    } else {
      message = `You take a little bit of damage.`;
    }

    return message;
  }
}
