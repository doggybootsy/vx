import { Messages } from "@i18n";
import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: () => Messages.NO_REPLY_PING_NAME,
  description: () => Messages.NO_REPLY_PING_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: 'type:"CREATE_PENDING_REPLY"',
    find: /(dispatch\({type:"CREATE_PENDING_REPLY",.+?,shouldMention:)(.+?)(,.+?}\))/,
    replace: "$1$enabled?false:$2$3"
  }
});
