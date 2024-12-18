import { useEffect, useMemo, useReducer, useRef } from "react";
import { User } from "discord-types/general";
import { InternalStore } from "./util";
import { LocaleCodes, UserStore, fetchUser } from "@webpack/common";
import { useState } from "react";
import { debounce } from "common/util";
import { getLocale, onLocaleChange } from "vx:i18n";

export function useInternalStore<T>(store: InternalStore, factory: () => T): T {
  const [, forceUpdate] = useForceUpdate();
  const [ state, setState ] = useState(factory);

  useEffect(() => {
    setState(factory);
    
    function listener() {
      setState(factory);
      forceUpdate();
    }

    store.addChangeListener(listener);
    return () => {
      store.removeChangeListener(listener);
    };
  }, [ ]);

  return state;
}

export function useForceUpdate() {
  return useReducer<(num: number) => number>((num) => num + 1, 0);
}

type ReactEffectWithArg<T> = (value: T) => (void | (() => void) | Promise<void>);

export function useAbortEffect(effect: ReactEffectWithArg<AbortSignal>, deps?: React.DependencyList) {
  useEffect(() => {
    const controller = new AbortController();

    try {
      const ret = effect(controller.signal);

      return () => {
        controller.abort("End Of React Life Cycle");
        if (typeof ret === "function") ret();
      }
    } 
    catch (error) {
      return () => controller.abort("End Of React Life Cycle");
    }
  }, deps);
}

export function useUser(userId?: string): User | null {
  const [ user, setUser ] = useState(() => userId ? UserStore.getUser(userId) || null : null);

  useAbortEffect(async (signal) => {
    if (!userId) return;
    if (user && user.id === userId) return;

    const fetched = await fetchUser(userId); 

    if (signal.aborted) return;

    setUser(fetched);
  }, [ userId ]);
  
  return user;
}

export function useDiscordLocale(): LocaleCodes {
  const [ locale, setLocale ] = useState(() => getLocale());

  useEffect(() => {
    setLocale(() => getLocale());
    
    return onLocaleChange((local) => setLocale(local));
  }, [ ]);

  return locale;
}

export function useDebounce(handler: (this: any, ...args: any[]) => any, deps: React.DependencyList, timeout?: number | undefined) {
  return useMemo(() => debounce(handler, timeout), deps);
}

export function useDestructor(destructor: () => void, deps?: React.DependencyList) {
  useEffect(() => destructor, deps);
}
