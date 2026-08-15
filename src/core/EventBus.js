/**
 * Lightweight publish/subscribe bus for decoupling systems and UI.
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
  }

  /**
   * @param {string} event
   * @param {(payload: any) => void} callback
   * @returns {() => void} unsubscribe
   */
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * @param {string} event
   * @param {(payload: any) => void} callback
   */
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * @param {string} event
   * @param {any} [payload]
   */
  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const cb of [...set]) {
      try { cb(payload); } catch (err) { console.error(`[EventBus] ${event}`, err); }
    }
  }

  clear() {
    this.listeners.clear();
  }
}
