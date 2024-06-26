import { GameIF } from '../Builder/Interfaces/GameIF';
import { MapIF } from './Interfaces/MapIF';
import { DrawableTerminal } from '../Terminal/Interfaces/DrawableTerminal';
import { TerminalPoint } from '../Terminal/TerminalPoint';
import { Glyph } from '../Glyphs/Glyph';
import { GlyphInfo } from '../Glyphs/GlyphInfo';
import { GlyphMap } from '../Glyphs/GlyphMap';
import { MapCell } from './MapCell';
import { WorldPoint } from './WorldPoint';
import { BuffIF } from '../Buffs/Interfaces/BuffIF';
import { MapRenderer } from './MapRenderer';
import { EventCategory } from '../Messages/LogMessage';
import { ImageHandler } from '../ImageHandler/ImageHandler';
import { StatsDisplay } from '../UI/StatsDisplay';
import { MessagesDisplay } from '../UI/MessagesDisplay';
import { BuffsDisplay } from '../UI/BuffsDisplay';
import { EquipmentDisplay } from '../UI/EquipmentDisplay';

/**
 * Represents a utility class for drawing a map on a drawable terminal.
 */
export class DrawMap {
  /**
   * Draws a map on a drawable terminal. The whole map is visible.
   * @param {DrawableTerminal} term - The drawable terminal to draw on.
   * @param {MapIF} map - The map to draw.
   * @param {WorldPoint} vp - The viewport representing the point in the world where drawing starts.
   */
  static drawMap0(term: DrawableTerminal, map: MapIF, vp: WorldPoint) {
    const terminalDimensions = term.dimensions;
    const t = new TerminalPoint();
    const w = new WorldPoint();
    const mapOffSet = 0;

    // Loop through each row and column of the terminal
    for (
      t.y = mapOffSet, w.y = vp.y;
      t.y < terminalDimensions.y + mapOffSet;
      ++t.y, ++w.y
    ) {
      // Loop through each column of the terminal
      for (t.x = 0, w.x = vp.x; t.x < terminalDimensions.x; ++t.x, ++w.x) {
        // Get the cell from the map corresponding to the world point
        const cell: MapCell = map.isLegalPoint(w) ? map.cell(w) : this.outside;
        // Get the glyph info for the cell's glyph
        const i: GlyphInfo = GlyphMap.getGlyphInfo(cell.glyph());
        // Draw the glyph on the terminal
        term.drawAt(t.x, t.y, i.char, i.fgCol, i.bgCol);
      }
    }
  }
  /**
   * Represents the map cell used for points outside the map boundaries.
   * @type {MapCell}
   */
  static outside: MapCell = new MapCell(Glyph.Unknown);

  /**
   * Draws a map with considerations for player position and lighting conditions.
   * @param {DrawableTerminal} term - The drawable terminal to draw on.
   * @param {MapIF} map - The map to draw.
   * @param {WorldPoint} vp - The viewport representing the point in the world where drawing starts.
   * @param {WorldPoint} playerPos - The position of the player.
   * @param {GameIF} g - The game interface.
   */
  static drawMap(
    term: DrawableTerminal,
    map: MapIF,
    vp: WorldPoint,
    playerPos: WorldPoint,
    g: GameIF,
  ) {
    const currentMap = g.currentMap();
    const isInOverworld = currentMap && currentMap.level === 0;

    isInOverworld
      ? MapRenderer.drawMap_Normal(term, map, vp, playerPos, g)
      : MapRenderer.drawMap_RayCast(term, map, vp, playerPos, g);
  }

  /**
   * Draw the player on the map.
   *
   * @param {DrawableTerminal} term - the terminal to draw on
   * @param {MapIF} map - the map to draw
   * @param {WorldPoint} player_pos - the position of the player
   * @param {GameIF} g - the game interface
   */
  static drawMapPlayer(
    term: DrawableTerminal,
    map: MapIF,
    playerPos: WorldPoint,
    g: GameIF,
  ) {
    if (!playerPos) playerPos = new WorldPoint();

    const viewport: WorldPoint = new WorldPoint(
      -Math.floor(term.dimensions.x * 0.5) + playerPos.x,
      -Math.floor(term.dimensions.y * 0.5) + playerPos.y,
    );
    this.drawMap(term, map, viewport, playerPos, g);
  }

  /**
   * Renders the player stats on the terminal.
   *
   * @param {GameIF} game - the game instance to retrieve player stats from
   * @return {void}
   */
  static renderStats(game: GameIF): void {
    const player = game.player;
    const hp = player.hp;
    const maxhp = player.maxhp;
    const lvl = game.dungeon.level;
    const nEA = game.equipment?.armorClass_reduce().toFixed(2);
    const nAC = game.equipment?.armorClass();
    const nAP = game.equipment?.weaponDamage();

    const hpDisplayText = `HP: ${hp}/${maxhp}`;
    const lvlDisplayText = `LVL: ${lvl}`;
    const nEADisplayText = `nEA: ${nEA}`;
    const nACDisplayText = `nAC: ${nAC}`;
    const nAPDisplayText = `nAP: ${nAP}`;

    const display = `${hpDisplayText} ${nEADisplayText} ${nACDisplayText} ${nAPDisplayText} ${lvlDisplayText}`;

    const statsDisplay = document.querySelector(
      'stats-display',
    ) as StatsDisplay;
    if (statsDisplay) statsDisplay.setStats(display);

    this.renderBuffs(game);
  }

  static remain(b: BuffIF): number {
    return b.time;
  }

  /**
   * Renders the active buffs of the player on the terminal.
   *
   * @param {GameIF} game - the game instance containing the player's buffs
   * @return {void}
   */
  static renderBuffs(game: GameIF): void {
    const playerBuffs = game.player.buffs;
    const buffMap = playerBuffs._map;

    const buffsDisplay = document.querySelector(
      'buffs-display',
    ) as BuffsDisplay;
    if (buffsDisplay) buffsDisplay.setBuffs(buffMap);
  }

  /**
   * Renders the equipment on the terminal based on the provided game state.
   *
   * @param {GameIF} game - the game instance containing the equipment state
   * @return {void}
   */
  static renderEquipment(game: GameIF): void {
    const equipment = game.equipment;
    const equipmentDisplay = document.querySelector(
      'equipment-display',
    ) as EquipmentDisplay;
    if (equipmentDisplay) equipmentDisplay.setEquipment(equipment);
  }

  /**
   * Renders the log messages on the terminal.
   *
   * @param {GameIF} game - the game instance to retrieve player stats from
   * @return {void}
   */
  static renderMessage(game: GameIF): void {
    const log = game.log;
    const messageLog = log.archive.slice(-30);

    const messagesDisplay = document.querySelector(
      'messages-display',
    ) as MessagesDisplay;
    if (messagesDisplay) messagesDisplay.setMessages(messageLog);
  }

  static renderActionImage(game: GameIF): void {
    const imageHandler = ImageHandler.getInstance();

    const currentEventCategory = game.log.currentEvent;

    switch (currentEventCategory) {
      case EventCategory.attack:
        imageHandler.handleAttackImageDisplay(game);
        break;
      case EventCategory.mobDamage:
        imageHandler.handleAttackImageDisplay(game);
        break;
      case EventCategory.playerDamage:
        imageHandler.handleHurtImageDisplay(game);
        break;
      case EventCategory.mobDeath:
        imageHandler.handleSmileImageDisplay(game);
        break;
      case EventCategory.moving:
        imageHandler.handleMovingImageDisplay(game);
        break;
      case EventCategory.rangedAttack:
        imageHandler.handlePistolImageDisplay(game);
        break;
      case EventCategory.wait:
        imageHandler.handleNeutralImageDisplay(game);
        break;
      default:
        break;
    }
  }

  static renderFlash(term: DrawableTerminal, game: GameIF): void {
    const log = game.log;

    if (!log) return;

    const topMessage = log.top();
    let s = topMessage ? topMessage.message : '';

    s = this.extend(s, term);

    const x = term.dimensions.x - s.length;
    const y = term.dimensions.y - 1;
    term.drawText(x, y, s, 'yellow', '#00000000');
  }

  /**
   * Use an empty string as the mask.
   * @type {string}
   */
  static mask: string = '';

  /**
   * Extends the given string to fit the terminal width.
   * @param {string} s - The string to extend.
   * @param {DrawableTerminal} term - The terminal.
   * @returns {string} - The extended string.
   */
  static extend(s: string, term: DrawableTerminal): string {
    const dimensions = term.dimensions;

    if (!this.mask) this.mask = ' '.repeat(dimensions.x);

    return s + this.mask.substring(0, dimensions.x - s.length);
  }
}
