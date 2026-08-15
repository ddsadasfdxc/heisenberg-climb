/**
 * Entry point — BCS & BB: The Climb
 * @typedef {import('./src/core/Game.js').Game} Game
 */
import { Game } from './src/core/Game.js';

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('game-canvas'));
const uiLayer = /** @type {HTMLElement} */ (document.getElementById('ui-layer'));
const mudLayer = /** @type {HTMLElement} */ (document.getElementById('mud-layer'));

const game = new Game({ canvas, uiLayer, mudLayer });
game.boot();

// Expose for debug
// @ts-ignore
window.__climb = game;
