import { definePlugin } from "../";
import { getProxyStore } from "../../webpack";
import { Developers } from "../../constants";
import { UserStore, fluxDispatchEvent } from "../../webpack/common";

const MessageStore = getProxyStore("MessageStore");

export default definePlugin({
  name: "DoubleClickEdit",
  description: "Double clicking a message will allow you to edit a message",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: "getElementFromMessage:",
    find: /"li",{id:.{1,3},/,
    replace: "$&onClick:$self.onClick,"
  },
  onClick(event: React.MouseEvent<HTMLElement>) {
    if (event.detail !== 2) return;

    const [ channelId, messageId ] = event.currentTarget.id.split("-").slice(-2);

    const message = MessageStore.getMessage(channelId, messageId);

    const currentUser = UserStore.getCurrentUser();

    if (message.author.id === currentUser.id) {
      fluxDispatchEvent({
        type: "MESSAGE_START_EDIT",
        channelId,
        messageId,
        content: message.content
      });
    };
  }
});
