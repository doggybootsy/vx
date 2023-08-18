import webpack, { Store as ModuleStore } from "renderer/webpack";
import Store, { CHANGE_SYMBOL } from "renderer/store";

export function useStateFromStores<T>(stores: (Store | ModuleStore)[], factory: () => T): T {
  const React = webpack.common.React!;

  const [ state, setState ] = React.useState(factory);

  React.useLayoutEffect(() => {
    function listener() {
      setState(() => factory());
    };

    for (const store of stores) {
      if (store[CHANGE_SYMBOL]) store[CHANGE_SYMBOL].add(listener);
      else (store as ModuleStore).addReactChangeListener(listener);
    };

    return () => {
      for (const store of stores) {
        if (store[CHANGE_SYMBOL]) store[CHANGE_SYMBOL].remove(listener);
        else (store as ModuleStore).removeReactChangeListener(listener);
      };
    };
  }, [ ]);

  return state;
};
