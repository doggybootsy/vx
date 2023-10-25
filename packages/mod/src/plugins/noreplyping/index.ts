import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "NoReplyPing",
  description: "Automatically tells discord not to ping the user when replying",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: 'type:"CREATE_PENDING_REPLY"',
    find: /(dispatch\({type:"CREATE_PENDING_REPLY",.+?,shouldMention:).+?(,.+?)}\)/,
    replace: "$1false$2})"
  }
});
