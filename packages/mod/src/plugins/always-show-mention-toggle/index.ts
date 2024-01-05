import { Messages } from "i18n";
import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: () => Messages.ALWAYS_SHOW_MENTION_TOGGLE_NAME,
  description: () => Messages.ALWAYS_SHOW_MENTION_TOGGLE_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: 'type:"CREATE_PENDING_REPLY"',
    find: /(dispatch\({type:"CREATE_PENDING_REPLY",.+?,showMentionToggle:)(.+?)}\)/,
    replace: "$1$enabled?true:$2})"
  }
});
