import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "this.removeObscurity",
    find: /this\.removeObscurity/g,
    replace: "$self.removeObscurity.bind(null,()=>$enabled,$&),__vx_ras__:this"
  },
  removeObscurity(isEnabled: () => boolean, original: (event: React.MouseEvent) => void, event: React.MouseEvent) {
    if (event.ctrlKey && isEnabled()) {
      for (const child of event.currentTarget.parentElement!.childNodes) {
        if (!(child instanceof HTMLElement)) continue;
        if (!child.matches("[class^=spoilerContent_]")) continue;
        child.__reactFiber$?.alternate?.memoizedProps?.__vx_ras__?.removeObscurity(event)
      }
    }
    else original(event);
  }
});