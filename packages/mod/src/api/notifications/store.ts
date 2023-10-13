import { Notification } from ".";
import { InternalStore } from "../../util";

export const notificationStore = new class extends InternalStore {
  constructor() {
    super();
  };

  clear() {
    this.#state.clear();
    this.emit();
  };

  #order = 0;
  #state = new Map<string, Notification & { order: number }>();
  getState() {
    const state = Array.from(this.#state.values());

    return state.sort((a, b) => a.order - b.order);
  };

  add(id: string, notification: Notification) {
    this.#state.set(id, {
      ...notification,
      order: this.#order++
    });
    this.emit();

    return () => this.delete(id);
  };
  delete(id: string) {    
    this.#state.delete(id);
    this.emit();
  };
};