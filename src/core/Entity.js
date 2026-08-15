/**
 * Minimal ECS-lite entity container.
 */
export class Entity {
  /**
   * @param {string} id
   */
  constructor(id) {
    this.id = id;
    /** @type {Map<string, any>} */
    this.components = new Map();
    /** @type {Set<string>} */
    this.tags = new Set();
  }

  /**
   * @param {string} type
   * @param {any} data
   */
  addComponent(type, data) {
    this.components.set(type, data);
    return this;
  }

  /**
   * @param {string} type
   */
  getComponent(type) {
    return this.components.get(type);
  }

  /**
   * @param {string} type
   */
  hasComponent(type) {
    return this.components.has(type);
  }

  /**
   * @param {string} tag
   */
  addTag(tag) {
    this.tags.add(tag);
    return this;
  }

  /**
   * @param {string} tag
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }
}
