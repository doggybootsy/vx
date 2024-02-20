import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";

import * as styler from "./index.css?managed";

import { SettingType, createSettings } from "../settings";
import { spotifyStore } from "./store";
import { SpotifyPanel } from "./panel";

export const settings = createSettings("SpotifyControls", {
  altSkipBackwards: {
    type: SettingType.SWITCH,
    default: false,
    title: "Alternative Skip Backwards",
    description: "When enabled, if you click skip backwards after the 5s mark, it will restart the song instead of skipping backwards"
  },
  openInApp: {
    type: SettingType.SWITCH,
    default: false,
    props: {
      hideBorder: true
    },
    title: "Open In App",
    description: "When enabled, it will open in the spotify app instead of the spotify webpage"
  }
});

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  settings,
  patches: [
    {
      identifier: "panel",
      find: ".default.Messages.ACCOUNT_A11Y_LABEL,children:[",
      replace: "$&$enabled&&$react.createElement($self.SpotifyPanel),"
    },
    {
      identifier: "dispatch-more-info",
      match: "hm://pusher/v1/connections/",
      find: /function .{1,3}\(.{1,3},.{1,3},(.{1,3})\){let .{1,3},.{1,3},.+?repeat:"off"!==(.{1,3}),/,
      replace: "$&currentlyPlayingType:$1.currently_playing_type,shuffle_state:$1.shuffle_state,repeatState:$2,"
    }
  ],
  styler,
  SpotifyPanel: ErrorBoundary.wrap(SpotifyPanel),
  fluxEvents: {
    SPOTIFY_PLAYER_STATE(data) {      
      if (data.currentlyPlayingType === "unknown") return;
      
      spotifyStore.device = data.device ?? null;
      spotifyStore.track = data.track;
      spotifyStore.isPlaying = data.isPlaying;
      spotifyStore.position = data.position ?? 0;
      spotifyStore.repeat = data.repeatState || spotifyStore.repeat;
      spotifyStore.accountId = data.accountId;
      spotifyStore.shuffleState = data.shuffle_state ?? spotifyStore.shuffleState;      

      spotifyStore.emit();
    },
    SPOTIFY_PROFILE_UPDATE(data: any) {
      spotifyStore.accounts[data.accountId] = data;

      spotifyStore.accountId = data.accountId;
      spotifyStore.emit();
    }
  }
});
