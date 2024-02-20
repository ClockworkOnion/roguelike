import { MobAI } from '../../interfaces/AI/MobAI';
import { GameIF } from '../../interfaces/Builder/Game';
import { Map } from '../../interfaces/Map/Map';
import { MessageLog } from '../Messages/MessageLog';
import { RandomGenerator } from '../MapModel/RandomGenerator';
import { Mob } from '../Mobs/Mob';

/**
 * Represents a game instance implementing the GameIF interface.
 */
export class Game implements GameIF {
  constructor(public rand: RandomGenerator) {}
  map: Map | null = null;

  /**
   * Retrieve the current map.
   *
   * @return {Map | null} The current map, or null if not available.
   */
  currentMap(): Map | null {
    return this.map;
  }

  player: Mob = <Mob>(<unknown>undefined);

  ai: MobAI | null = null;

  log: MessageLog = new MessageLog();

  /**
   * Adds a message to the message log.
   * @param {string} s - The message to add.
   * @returns {void}
   */
  message(s: string): void {
    this.log.message(s);
  }
}
