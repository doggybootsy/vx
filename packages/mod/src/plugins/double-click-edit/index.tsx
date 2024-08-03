import { definePlugin } from "../";
import { Developers } from "../../constants";
import { MessageStore, UserStore, dirtyDispatch } from "@webpack/common";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: ".interactionSending]:",
    find: /"li",{id:.{1,3},/,
    replace: "$&onDoubleClick:$self.onDoubleClick.bind(null,()=>$enabled),"
  },
  onDoubleClick(enabled: () => boolean, event: React.MouseEvent<HTMLElement>) {
    if (!enabled()) return;
    if (event.currentTarget.querySelector("[class^='channelTextArea_']")) return;

    const [ channelId, messageId ] = event.currentTarget.id.split("-").slice(-2);

    const message = MessageStore.getMessage(channelId, messageId);

    const currentUser = UserStore.getCurrentUser();

    if (message.author.id === currentUser.id) {
      dirtyDispatch({
        type: "MESSAGE_START_EDIT",
        channelId,
        messageId,
        content: message.content
      });
    }
  }
});
