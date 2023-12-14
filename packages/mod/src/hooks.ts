import { useEffect, useInsertionEffect, useMemo } from "react";
import { User } from "discord-types/general";
import { InternalStore } from "./util";
import { UserStore, fetchUser } from "./webpack/common";
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

export function useUser(userId: string): User | null {
  const [ user, setUser ] = useState(() => UserStore.getUser(userId) || null);

  useAbortEffect(async (signal) => {
    if (user) return;

    const fetched = await fetchUser(userId); 

    if (signal.aborted) return;

    setUser(fetched);
  });
  
  return user;
};
