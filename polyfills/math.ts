import { polyfill } from "polyfills";

// https://github.com/Richienb/proposal-math-clamp
function clamp(number: number, min: number, max: number): number {
  return Math.max(min, Math.min(number, max));
};

polyfill(Math, "clamp", clamp);
