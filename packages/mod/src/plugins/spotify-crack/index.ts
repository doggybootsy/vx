import { definePlugin } from "..";
import { Developers } from "../../constants";
import { spotifyStore } from "../spotify-controls/store";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    spotifyStore.isCracked = true;
    spotifyStore.emit();
  },
  stop() {
    spotifyStore.isCracked = false;
    spotifyStore.emit();
  }
});