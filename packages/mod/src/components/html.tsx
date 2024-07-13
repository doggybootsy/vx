import { useLayoutEffect, useMemo, useRef } from "react"
import { getInternalInstance } from "../util";

interface ElementFactory {
  (previous: Element | null): Element
}

interface HTMLProps {
  factory: ElementFactory
}

// Always updates
export function HTML({ factory }: HTMLProps) {
  return useHTML(factory);
}
// Never updates
export function htmlToComponent<T extends object>(factory: (props: T) => HTMLElement): (props: T) => React.ReactNode {
  return (props: T) => useHTML(() => factory(props), [ ]);
}
// Updates depending on deps
export function useHTML(factory: ElementFactory, deps?: React.DependencyList) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef<Element>(null);

  const element = useMemo(() => (previous as any).current = factory(previous.current), deps);

  useLayoutEffect(() => {
    if (!ref.current) return;
    
    const fiber = getInternalInstance(ref.current)!;

    element.__reactFiber$ = fiber;
    
    fiber.stateNode = element;
    ref.current.replaceWith(element);
    (ref as any).current = element;
  }, [ element ]);

  return <div ref={ref} />;
}