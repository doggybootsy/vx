import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: 'type:"CREATE_PENDING_REPLY"',
    find: /(dispatch\({type:"CREATE_PENDING_REPLY",.+?,shouldMention:)(.+?)(,.+?}\))/,
    replace: "$1$enabled?!$2:$2$3"
  }
});
