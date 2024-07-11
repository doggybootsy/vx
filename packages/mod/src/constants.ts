export interface Developer {
  username: string,
  discord: string
};

export const Developers: Record<string, Developer> = {
  doggybootsy: {
    username: "doggybootsy",
    discord: "515780151791976453"
  }
};

export const DEBUG_SYMBOL = Symbol.for("vx.debug");

export function addDebug(item: Object, value: any) {
  // @ts-expect-error
  const arr = item[DEBUG_SYMBOL] ??= [];

  arr.push(value);
}