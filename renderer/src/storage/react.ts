import VXError from "renderer/error";
import webpack from "renderer/webpack";
import { getItem } from "renderer/storage";

export const listeners = new Map<string, Map<string, Set<(newValue: any) => void>>>();

function getListeners(id: string, key: string) {
  if (!listeners.has(id)) listeners.set(id, new Map());
  const innerListeners = listeners.get(id)!;
  if (!innerListeners.has(key)) innerListeners.set(key, new Set());

  return innerListeners.get(key)!;
};
export function fireListeners(id: string, key: string, newValue: any) {
  for (const listener of getListeners(id, key)) listener(newValue);
};

export function useItem<T>(id: string, key: string, defaultValue: T): T {
  if (!webpack.common.React) throw new VXError(VXError.codes.NO_REACT);

  const [ value, setValue ] = webpack.common.React.useState(() => getItem(id, key, defaultValue));

  webpack.common.React.useMemo(() => {
    const listeners = getListeners(id, key);

    function listener(value: T) {
      setValue(value);
    };

    listeners.add(listener);

    return () => listeners.delete(listener);
  }, [ ]);

  return value;
};