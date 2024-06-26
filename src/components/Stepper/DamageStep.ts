import { GameIF } from '../Builder/Interfaces/GameIF';
import { HealthAdjust } from '../Commands/HealthAdjust';
import { MapIF } from '../MapModel/Interfaces/MapIF';
import { WorldPoint } from '../MapModel/WorldPoint';
import { Mob } from '../Mobs/Mob';
import { StepIF } from './Interfaces/StepIF';
import { TimedStep } from './TimedStep';

/**
 * Represents a timed step that damages a mob at its current position.
 */
export class DamageStep extends TimedStep {
  target: Mob | null = null;
  pos: WorldPoint | null = null;
  rangedWeaponType = RangedWeaponType[this._rangedWeaponType];

  constructor(
    public amount: number,
    public _rangedWeaponType: RangedWeaponType,
    public actor: Mob,
    public game: GameIF,
  ) {
    super();
  }

  /**
   * Sets the target of the function to the specified Mob.
   *
   * @param {Mob} tgt - The Mob object to set as the target.
   * @return {void} This function does not return anything.
   */
  setTarget(tgt: Mob): void {
    this.target = tgt;
  }

  /**
   * Sets the position of the object to the specified world point.
   *
   * @param {WorldPoint} pos - The world point to set the position to.
   * @return {void} This function does not return anything.
   */
  setPos(pos: WorldPoint): void {
    this.pos = pos.copy();
  }

  /**
   * Executes the step and damages the target.
   *
   * @return {StepIF | null} The executed step or null if no target is found.
   */
  executeStep(): StepIF | null {
    let tgt = this.target;
    if (!tgt) tgt = this.targetFromPosition();
    if (tgt) {
      const rangedWeaponType = RangedWeaponType[this._rangedWeaponType];

      this.game.message(
        ` ${tgt.name} gets hit by a ${rangedWeaponType}for ${this.amount} damage`,
      );
      HealthAdjust.damage(tgt, this.amount, this.game, this.actor);
    } else {
      console.log('did not hit any target');
    }
    return null;
  }

  /**
   * Retrieves the target Mob based on the current position.
   *
   * @return {Mob | null} The target Mob if found, otherwise null.
   */
  targetFromPosition(): Mob | null {
    if (this.pos) {
      const map = <MapIF>this.game.currentMap();
      const cell = map.cell(this.pos);
      if (cell.mob) return cell.mob;
    }
    return null;
  }
}

export enum RangedWeaponType {
  Pistol,
  Rifle,
  Crossbow,
  Bow,
}
