import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "AlwaysShowMentionToggle",
  description: "Always show the mention toggle when replying to messages",
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: 'type:"CREATE_PENDING_REPLY"',
    find: /(dispatch\({type:"CREATE_PENDING_REPLY",.+?,showMentionToggle:)(.+?)}\)/,
    replace: "$1$enabled?true:$2})"
  }
});
