import { definePlugin } from "..";
import { Developers } from "../../constants";

let IMAGE_GIF_RE: RegExp;

const OLD_SOURCE = "\\.(gif|png|jpe?g|webp)($|\\?|#)";
const NEW_SOURCE = "/\\.gif($|\\?|#)/i";

const plugin = definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      find: "/\\.gif($|\\?|#)/i",
      replace: "$self.IMAGE_GIF_RE=$&"
    }
  ],
  setSource() {
    // Maybe patch the .test method or something?
    if (IMAGE_GIF_RE instanceof RegExp) {
      IMAGE_GIF_RE.compile(plugin.getActiveState() ? NEW_SOURCE : OLD_SOURCE, "i");
    }
  },
  set IMAGE_GIF_RE(value: RegExp) {
    IMAGE_GIF_RE = value;
    
    this.setSource();
  },
  start() {
    this.setSource();
  },
  stop() {
    this.setSource();
  },
})