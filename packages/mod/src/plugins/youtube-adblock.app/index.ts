import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    window.VXNative!.adblock.setState(true);
  },
  stop() {
    window.VXNative!.adblock.setState(false);
  }
});