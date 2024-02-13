import { Patch, Props, miniPopoverPatches } from "./patch";

type MiniPopoverComponent = React.ComponentType<Props>;
type InserterFunction = (children: React.ReactNode[], item: React.ReactNode) => void;

export function patch(caller: string, patch: Patch) {
  if (!miniPopoverPatches.has(caller)) miniPopoverPatches.set(caller, new Set());

  const patches = miniPopoverPatches.get(caller)!;

  patches.add(patch);
  return () => patches.delete(patch);
}

export function addItem(caller: string, Component: MiniPopoverComponent, inserter: InserterFunction = (children, item) => children.unshift(item)) {
  return patch(caller, (returnValue, props) => {
    if (!Array.isArray(returnValue.props.children)) return;
    inserter(
      returnValue.props.children, 
      <Component 
        {...props} 
        author={props.message.author} 
      />
    );
  });
}

export function unpatchAll(caller: string) {
  if (!miniPopoverPatches.has(caller)) return;

  const patches = miniPopoverPatches.get(caller)!;

  patches.clear();
}