import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "AlwaysShowMentionToggle",
  description: "Always show the mention toggle when repling to messages",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: 'type:"CREATE_PENDING_REPLY"',
    find: /(dispatch\({type:"CREATE_PENDING_REPLY",.+?,showMentionToggle:).+?}\)/,
    replace: "$1true})"
  }
});
