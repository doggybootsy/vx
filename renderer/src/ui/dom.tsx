import VXError from "renderer/error";
import { getInternalInstance } from "renderer/util";
import webpack from "renderer/webpack";

export function useDOM(factory: () => Element, deps: React.DependencyList = [ ]) {
  const React = webpack.common.React;
  if (!React) throw new VXError(VXError.codes.NO_REACT);

  const ref = React.useRef<HTMLDivElement>(null);
  const HTML = React.useMemo(factory, deps);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const fiber = getInternalInstance(ref.current);
    if (!fiber) return;

    const stateNode = fiber.stateNode as HTMLDivElement;

    stateNode.replaceWith(HTML);
    fiber.stateNode = HTML;
  }, [ HTML, ref.current ]);

  return (
    <div ref={ref} />
  );
};