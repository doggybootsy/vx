import { definePlugin } from "..";
import { Developers } from "../../constants";
import { spotifyStore } from "../spotify-controls/store";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  fluxEvents: {
    SPOTIFY_PROFILE_UPDATE(data) {
      data.vx_original = data.isPremium;
      data.isPremium = true;
    }
  },
  start() {
    spotifyStore.isCracked = true;
    spotifyStore.emit();
  },
  stop() {
    spotifyStore.isCracked = false;
    spotifyStore.emit();
  }
});