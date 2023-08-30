// Basically just 'Object.defineProperty'
export function polyfill(object: object, prop: PropertyKey, value: any) {
  if (object[prop]) {
    object[prop].polyfilled = false;
    return;
  };
  value.polyfilled = true;
  Object.defineProperty(object, prop, { value });
};

import "polyfills/math";