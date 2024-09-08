export interface Developer {
  username: string,
  discord?: string,
  github?: string
};

export const Developers = {
  doggybootsy: {
    username: "doggybootsy",
    discord: "515780151791976453",
    github: "doggybootsy"
  },
  kaan: {
    username: "kaan",
    github: "zrodevkaan"
  }
} satisfies Record<string, Developer>;

export const DEBUG_SYMBOL = Symbol.for("vx.debug");

export function addDebug(item: Object, value: any) {
  // @ts-expect-error
  const arr = item[DEBUG_SYMBOL] ??= [];

  arr.push(value);
}