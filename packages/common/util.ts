type anyFN = (this: any, ...args: any[]) => any;

type ParametersWithThis<T extends anyFN> = T extends (this: any, ...args: infer P) => any ? P : never;

export interface Debouncer<F extends anyFN> {
  (this: ThisParameterType<F>, ...args: ParametersWithThis<F>): void;
};

export function debounce<F extends anyFN>(handler: F, timeout?: number | undefined): Debouncer<F> {
  let timer: number | NodeJS.Timeout | null = null;

  const resolvers = new Set<(value: ReturnType<F>) => void>();

  function debouncer(this: ThisParameterType<F>, ...args: ParametersWithThis<F>) {
    clearTimeout(timer!);

    timer = setTimeout(() => {
      handler.apply(this, args);
    }, timeout);
  };
  
  return debouncer;
};