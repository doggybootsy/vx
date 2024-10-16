import { UserStore, openUserContextMenu } from "@webpack/common";
import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".Messages.USER_SETTINGS_WITH_BUILD_OVERRIDE.format({webBuildOverride",
    find: /renderAvatarWithPopout\(\){.+?"aria-label":.{1,3}\.(?:default|Z|ZP)\.Messages\.SET_STATUS/,
    replace: "$&,onContextMenu:(event)=>$enabled&&$self.onContextMenu(event)"
  },
  onContextMenu(event: React.MouseEvent) {
    openUserContextMenu(event, UserStore.getCurrentUser(), true);
  }
});
