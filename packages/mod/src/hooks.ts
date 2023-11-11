import { User } from "discord-types/general";
import { InternalStore } from "./util";
import { FluxDispatcher, React, UserStore, fetchUser } from "./webpack/common";

export function useInternalStore<T>(store: InternalStore, factory: () => T): T {
  const [ state, setState ] = React.useState(factory);

  React.useInsertionEffect(() => {
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
  const controller = React.useMemo(() => new AbortController(), [ ]);

  return <const>[
    controller.signal, 
    (reason?: any) => controller.abort(reason)
  ];
};

type ReactEffectWithArg<T> = (value: T) => void | (() => void);

export function useAbortEffect(effect: ReactEffectWithArg<AbortSignal>) {
  const [ signal, abort ] = useSignal();

  React.useEffect(() => {
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
  const [ user, setUser ] = React.useState(() => UserStore.getUser(userId) || null);

  useAbortEffect((signal) => {
    if (user) return;

    const fetched = fetchUser(userId); 

    fetched.then((user) => {      
      if (signal.aborted) return;

      setUser(user);
    });
  });
  
  return user;
};

interface DispatchEvent {
  type: string;
  [key: string]: any;
};

export function useFluxSubscription(name: string, actionHandler: (event: DispatchEvent) => void, otherDeps: React.DependencyList = []) {
  React.useEffect(() => {
    FluxDispatcher.subscribe("RTC_CONNECTION_STATE", actionHandler);

    return () => FluxDispatcher.unsubscribe("RTC_CONNECTION_STATE", actionHandler);
  }, [ name, actionHandler, ...otherDeps ]);
};