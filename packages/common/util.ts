type anyFN = (this: any, ...args: any[]) => any;

type ParametersWithThis<T extends anyFN> = T extends (this: any, ...args: infer P) => any ? P : never;

export interface Debouncer<F extends anyFN> {
  (this: ThisParameterType<F>, ...args: ParametersWithThis<F>): void;
  isPending(): boolean;
  stop(): void
};

export function debounce<F extends anyFN>(handler: F, timeout?: number | undefined): Debouncer<F> {
  let timer: number | NodeJS.Timeout | null = null;

  function debouncer(this: ThisParameterType<F>, ...args: ParametersWithThis<F>) {
    clearTimeout(timer!);

    timer = setTimeout(() => {
      timer = null;
      handler.apply(this, args);
    }, timeout);
  }
  debouncer.isPending = () => timer !== null;
  debouncer.stop = () => {
    clearTimeout(timer!);
    timer = null;
  }
  
  return debouncer;
}

export function waitFor(condition: () => any, ms?: number): Promise<void> {
  return new Promise((resolve) => {
    const id = setInterval(() => {
      if (!condition()) return;

      clearInterval(id);
      resolve();
    }, ms);
  });
}
