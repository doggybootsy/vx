import { menuPatches, Props } from "./patch";

export function addItem(caller: string, callback: (props: Props) => React.ReactNode) {
  if (!menuPatches.has(caller)) menuPatches.set(caller, new Set());

  menuPatches.get(caller)!.add(callback);

  return () => removeItem(caller, callback);
}
export function removeItem(caller: string, callback?: (props: Props) => React.ReactNode) {
  if (!menuPatches.has(caller)) return;

  const patches = menuPatches.get(caller)!;

  if (typeof callback === "function") {
    patches.delete(callback);
    return;
  }

  patches.clear();
}