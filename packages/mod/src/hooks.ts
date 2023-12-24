import { useEffect, useInsertionEffect, useMemo } from "react";
import { User } from "discord-types/general";
import { InternalStore } from "./util";
import { I18n, LocaleCodes, UserStore, fetchUser } from "./webpack/common";
import { useState } from "react";

export function useInternalStore<T>(store: InternalStore, factory: () => T): T {
  const [ state, setState ] = useState(factory);

  useInsertionEffect(() => {
    function listener() {
      setState(factory);
    };

    store.addChangeListener(listener);
    return () => {
      store.removeChangeListener(listener);
    };
  }, [ ]);

  return state;
};

export function useSignal() {
  const controller = useMemo(() => new AbortController(), [ ]);

  return <const>[
    controller.signal, 
    (reason?: any) => controller.abort(reason)
  ];
};

type ReactEffectWithArg<T> = (value: T) => (void | (() => void) | Promise<void>);

export function useAbortEffect(effect: ReactEffectWithArg<AbortSignal>) {
  const [ signal, abort ] = useSignal();

  useEffect(() => {
    try {
      const ret = effect(signal);

      return () => {
        abort();
        if (typeof ret === "function") ret();
      };
    } 
    catch (error) {
      return () => abort();
    }
  }, [ ]);
};

export function useUser(userId?: string): User | null {
  const [ user, setUser ] = useState(() => userId ? UserStore.getUser(userId) || null : null);

  useAbortEffect(async (signal) => {
    if (!userId || user) return;

    const fetched = await fetchUser(userId); 

    if (signal.aborted) return;

    setUser(fetched);
  });
  
  return user;
};

export function useDiscordLocale(awaitPromise: boolean = true): LocaleCodes {
  const [ locale, setLocale ] = useState(() => I18n.getLocale());

  useEffect(() => {
    setLocale(I18n.getLocale());

    async function listener() {
      if (awaitPromise) await I18n.loadPromise;
      setLocale(I18n.getLocale());
    };

    I18n.on("locale", listener);
    return () => I18n.off("locale", listener);
  }, [ ]);

  return locale;
};