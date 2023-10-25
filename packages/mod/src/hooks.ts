import { User } from "discord-types/general";
import { InternalStore } from "./util";
import { React, UserStore, fetchUser } from "./webpack/common";

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

export function useUser(userId: string): User | null {
  const [ user, setUser ] = React.useState(() => UserStore.getUser(userId) || null);
  const [ signal, abort ] = useSignal();

  React.useLayoutEffect(() => {
    if (user) return;

    const fetched = fetchUser(userId); 

    fetched.then((user) => {      
      if (signal.aborted) return;

      setUser(user);
    });

    return () => abort();
  }, [ ]);
  
  return user;
};