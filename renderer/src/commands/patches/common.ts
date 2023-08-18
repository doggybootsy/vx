import { command } from "renderer/commands/types";

export const section = {
  id: "vx",
  type: 0,
  name: "VX"
};

export function setLikeArray<T extends any>(array: T[], predicate: (a: T, b: T) => boolean): T[] {
  const arr = Array.from(new Set(array)) as T[];
  
  return arr.filter((a, index) => {
    return array.findIndex((b) => predicate(a, b)) === index;
  });
};

export const commands = new Set<command>();