import { MapIF } from '../MapModel/Interfaces/MapIF';
import { Glyph } from '../Glyphs/Glyph';
import { RandomGenerator } from '../RandomGenerator/RandomGenerator';
import { WorldPoint } from '../MapModel/WorldPoint';

/**
 * Utility class for finding an unoccupied space on a map.
 */
export class FindFreeSpace {
  /**
   * Finds a free space on the map.
   * @param {MapIF} map - The map on which to find free space.
   * @param {RandomGenerator} rnd - The random generator to use for finding free space.
   * @returns {WorldPoint | null} A WorldPoint representing the free space found, or null if no free space is available.
   */
  public static findFree(map: MapIF, rnd: RandomGenerator): WorldPoint | null {
    return this.find(Glyph.Floor, map, rnd);
  }

  /**
   * Finds a specified character in the map and returns its position.
   * @param {Glyph} char - The character to find.
   * @param {MapIF} map - The map in which to search for the character.
   * @param {RandomGenerator} rnd - The random generator to use for finding the character.
   * @returns {WorldPoint | null} A WorldPoint representing the position of the character found, or null if the character is not found.
   * @throws {string} Throws an error if no free space is found.
   */
  public static find(
    char: Glyph,
    map: MapIF,
    rnd: RandomGenerator,
  ): WorldPoint | null {
    const e = new WorldPoint(map.dimensions.x - 2, map.dimensions.y - 2);
    const s = new WorldPoint(
      rnd.randomIntegerClosedRange(1, e.x),
      rnd.randomIntegerClosedRange(1, e.y),
    );
    for (let p = s.copy(); ; ) {
      const cell = map.cell(p);
      if (cell.env === char && !cell.mob) {
        return p;
      }
      ++p.x;
      if (p.x > e.x) {
        p.x = 1;
        ++p.y;
        if (p.y > e.y) {
          p.y = 1;
        }
        if (p.isEqual(s)) {
          throw 'No free space found';
        }
      }
    }
  }
}
