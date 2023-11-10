import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "ExpandCollapsedMessages",
  description: "Expands collapsed messages by default",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: "collapsed-message-item",
    find: /{hasJumpTarget:(.{1,3})=!1}=(.{1,3}),/,
    replace: "{hasJumpTarget:$1=!0}=$2,"
  }
});
