import { Messages } from "i18n";
import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: () => Messages.EXPAND_COLLAPSED_MESSAGES_NAME,
  description: () => Messages.EXPAND_COLLAPSED_MESSAGES_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "collapsed-message-item",
    find: /{hasJumpTarget:(.{1,3})=!1}=(.{1,3}),/,
    replace: "{hasJumpTarget:$1=$enabled}=$2,"
  }
});
