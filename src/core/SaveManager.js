const KEY = 'heisenberg-climb-save-v1';

/**
 * localStorage persistence (meta + optional mid-run).
 */
export class SaveManager {
  /**
   * @returns {import('../data/types.js').SaveData}
   */
  static defaultSave() {
    return {
      version: '1.0.0',
      unlockedCharacters: ['walter', 'saul', 'jesse', 'mike'],
      characterProgress: {
        walter: { xp: 0, skillTree: [], ascension: 0, wins: 0, deaths: 0 },
        saul: { xp: 0, skillTree: [], ascension: 0, wins: 0, deaths: 0 },
        jesse: { xp: 0, skillTree: [], ascension: 0, wins: 0, deaths: 0 },
        mike: { xp: 0, skillTree: [], ascension: 0, wins: 0, deaths: 0 },
      },
      globalUnlocks: { cards: [], relics: [], events: [], easterEggs: [] },
      settings: { sfx: 0.8, music: 0.6, textSpeed: 'fast', screenShake: true, language: 'en' },
      currentRun: null,
    };
  }

  static load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return this.defaultSave();
      return { ...this.defaultSave(), ...JSON.parse(raw) };
    } catch {
      return this.defaultSave();
    }
  }

  /**
   * @param {any} data
   */
  static save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  /**
   * Debounced autosave helper.
   * @param {() => any} getter
   * @param {number} [delayMs]
   */
  static createAutosave(getter, delayMs = 500) {
    let timer = 0;
    return () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        try { this.save(getter()); } catch (e) { console.warn('autosave failed', e); }
      }, delayMs);
    };
  }
}
