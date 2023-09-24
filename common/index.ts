export interface AddonMeta extends VX.Dict {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
  authorid?: string;
  source?: string;
};

export const THEME_FILENAME_REGEX = /^[\s\S]+\.(vx|theme)\.css$/;
export const PLUGIN_FILENAME_REGEX = /^[\s\S]+\.vx\.c?js$/;

export const IPC = <const>{
  PRELOAD: "@vx/preload",
  QUIT: "@vx/quit",
  STORAGE: {
    GET_ALL: "@vx/storage/get-all",
    SET_ITEM: "@vx/storage/set-item",
    DELETE_ITEM: "@vx/storage/delete-item",
    GET_ITEM: "@vx/storage/get-item",
    HAS_ITEM: "@vx/storage/has-item",
    CLEAR_CACHE: "@vx/storage/clear-cache"
  },
  THEMES: {
    OPEN: "@vx/themes/open",
    GET_ALL: "@vx/themes/get-all",
    WATCHER: "@vx/themes/watcher"
  },
  PLUGINS: {
    OPEN: "@vx/plugins/open",
    GET_ALL: "@vx/plugins/get-all",
    WATCHER: "@vx/plugins/watcher"
  }
};

type anyFN = (...args: any[]) => any;

export function debounce<F extends anyFN>(handler: F, timeout?: number | undefined): (...args: Parameters<F>) => Promise<ReturnType<F>> {
  let timer: number | NodeJS.Timeout;

  const resolvers = new Set<(value: ReturnType<F>) => void>();
  
  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      const value = handler.apply(this, args);

      for (const resolve of resolvers) resolve(value);
    }, timeout);

    return new Promise<ReturnType<F>>((resolve) => {
      resolvers.add(resolve);
    });
  };
};