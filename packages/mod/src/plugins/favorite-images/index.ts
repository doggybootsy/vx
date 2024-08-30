import { bySource, getLazy } from "@webpack";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { createAbort } from "../../util";
import { Injector } from "../../patcher";
import { isValidElement } from "react";

let IMAGE_GIF_RE: RegExp;

const IMAGE_GIF_RE_NEW = /\.(gif|png|jpe?g|webp)($|\?|#)/i;
const ImageModuleSearch = getLazy<{
  default: { 
    prototype: React.Component<
      { animated: boolean, renderAccessory: () => React.ReactNode }, 
      { hasMouseOver: boolean, hasFocus: boolean }
    > 
  }
}>(bySource("/\\.gif($|\\?|#)/i"), { searchDefault: false });

const [ abort, getSignal ] = createAbort();

const injector = new Injector();

const plugin = definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      find: "/\\.gif($|\\?|#)/i",
      replace: "$self.IMAGE_GIF_RE=$&"
    }
  ],
  get IMAGE_GIF_RE() { return IMAGE_GIF_RE; },
  set IMAGE_GIF_RE(value: RegExp) {
    IMAGE_GIF_RE = value;
    
    IMAGE_GIF_RE.test = function(string) {
      return RegExp.prototype.test.call(plugin.getActiveState() ? IMAGE_GIF_RE_NEW : this, string);
    }
  },
  async start() {
    const signal = getSignal();
    const ImageModule = await ImageModuleSearch;
    
    if (signal.aborted) return;

    injector.after(ImageModule.default.prototype, "render", (that, args, res) => {
      if (that.props.animated && isValidElement(res)) {
        res.props.renderAccessory = function() {
          if (that.state.hasMouseOver || that.state.hasFocus) {
            return that.props.renderAccessory();
          }
        }
      }
    });
  },
  stop() {
    abort();
    injector.unpatchAll();
  }
});