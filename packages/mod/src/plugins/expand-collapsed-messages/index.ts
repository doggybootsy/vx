import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "collapsed-message-item",
    find: /{hasJumpTarget:(.{1,3})=!1}=(.{1,3}),/,
    replace: "{hasJumpTarget:$1=$enabled}=$2,"
  }
});
