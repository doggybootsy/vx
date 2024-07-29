import { definePlugin } from "..";
import { ErrorBoundary } from "../../components";
import { Developers } from "../../constants";

import * as styler from "./index.css?managed";

import { SettingType, createSettings } from "../settings";
import { spotifyStore } from "./store";
import { SpotifyPanel } from "./panel";
import { forwardRef } from "react";

export const settings = createSettings("SpotifyControls", {
  altSkipBackwards: {
    type: SettingType.SWITCH,
    default: false,
    title: "Alternative Skip Backwards",
    description: "When enabled, if you click skip backwards after the 5s mark, it will restart the song instead of skipping backwards"
  },
  altDuration: {
    type: SettingType.SWITCH,
    default: false,
    title: "Alternative Duration",
    description: "When enabled, it tells you long you have left until the song ends"
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
      find: /\("section",({(ref:.{1,3},)?className:.{1,3}\.panels,"aria-label":.{1,3}\.(?:default|Z|ZP)\.Messages\.ACCOUNT_A11Y_LABEL,)/,
      replace: "($self.Section,$1"
    },
    {
      identifier: "dispatch-more-info",
      match: "hm://pusher/v1/connections/",
      find: /function .{1,3}\(.{1,3},.{1,3},(.{1,3})\){(?:var|let) .{1,3},.{1,3},.+?repeat:"off"!==(.{1,3}),/,
      replace: "$&currentlyPlayingType:$1.currently_playing_type,shuffle_state:$1.shuffle_state,repeatState:$2,"
    }
  ],
  styler,
  Section: forwardRef((props: { children: React.ReactElement[] }, ref: React.ForwardedRef<HTMLElement>) => {
    props.children.splice(
      props.children.length - 1, 
      0,
      <ErrorBoundary>
        <SpotifyPanel />
      </ErrorBoundary>
    );    

    return <section {...props} ref={ref} />;
  }),
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
