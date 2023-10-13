type anyFN = (this: any, ...args: any[]) => any;

type ParametersWithThis<T extends anyFN> = T extends (this: any, ...args: infer P) => any ? P : never;

export interface Debouncer<F extends anyFN> {
  (this: ThisParameterType<F>, ...args: ParametersWithThis<F>): Promise<ReturnType<F>>;
  clear(): void,
  isAwaiting(): boolean
};

export function debounce<F extends anyFN>(handler: F, timeout?: number | undefined): Debouncer<F> {
  let timer: number | NodeJS.Timeout | null = null;

  const resolvers = new Set<(value: ReturnType<F>) => void>();

  function debouncer(this: ThisParameterType<F>, ...args: ParametersWithThis<F>) {
    debouncer.clear();

    timer = setTimeout(() => {
      const value = handler.apply(this, args);

      for (const resolve of resolvers) resolve(value);
    }, timeout);

    return new Promise<ReturnType<F>>((resolve) => {
      resolvers.add(resolve);
    });
  };

  debouncer.clear = () => {
    if (timer !== null) return;
    clearTimeout(timer!);
    timer = null;
  };
  debouncer.isAwaiting = () => {
    return timer !== null; 
  };
  
  return debouncer;
};