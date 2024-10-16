import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { InternalStore } from "../../util";

const spotifyStore = cache(() => InternalStore.getStore<typeof import("../spotify-controls/store")["spotifyStore"]>("SpotifyStore")!);

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    spotifyStore().isCracked = true;
    spotifyStore().emit();
  },
  stop() {
    spotifyStore().isCracked = false;
    spotifyStore().emit();
  }
});