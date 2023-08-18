// Simple store class to be used with 'useStatesFromStores'

type callback = () => void;

export const CHANGE_SYMBOL = Symbol.for("VX.store.change");

class Store {
  constructor() {
    const callbacks = new Set<callback>();

    this.#callbacks = callbacks;
    this[CHANGE_SYMBOL] = {
      add(callback) {
        callbacks.add(callback);
      },
      remove(callback) {
        callbacks.delete(callback);
      }
    }    
  };
  #callbacks = new Set<callback>();
  [CHANGE_SYMBOL]: {
    add(callback: callback): void,
    remove(callback: callback): void
  };

  emit() {
    for (const callback of this.#callbacks) callback();
  };
};

export default Store;