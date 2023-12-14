import { definePlugin } from "../";
import { Developers } from "../../constants";
import { MessageStore, UserStore, dirtyDispatch } from "../../webpack/common";

export default definePlugin({
  name: "DoubleClickEdit",
  description: "Double clicking a message will allow you to edit a message",
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "getElementFromMessage:",
    find: /"li",{id:.{1,3},/,
    replace: "$&onClick:$self.onClick.bind(null,()=>$enabled),"
  },
  onClick(enabled: () => boolean, event: React.MouseEvent<HTMLElement>) {
    if (!enabled()) return;
    
    if (event.detail !== 2) return;

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
    };
  }
});
