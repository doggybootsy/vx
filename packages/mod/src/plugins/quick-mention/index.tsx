import { definePlugin } from "..";
import { addItem, removeItem } from "../../api/minipopover";
import { Icons, MiniPopover } from "../../components";
import { Developers } from "../../constants";
import { I18n, PermissionStore, PermissionsBits, TextAreaInput, useStateFromStores } from "../../webpack/common";

export default definePlugin({
  name: "QuickMention",
  description: "Quickly mention people",
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    addItem("QuickMention", (props) => {
      const canSendMessages = useStateFromStores<boolean>([ PermissionStore ], () => {
        if (props.channel.isDM() || props.channel.isMultiUserDM() || props.channel.isGroupDM()) return true;
        return PermissionStore.can(PermissionsBits.SEND_MESSAGES, props.channel);
      });

      return (
        <MiniPopover.Button 
          icon={Icons.At}
          text={I18n.Messages.MENTION}
          disabled={!canSendMessages}
          onClick={() => {
            TextAreaInput.insertText(`<@${props.author.id}>`);
          }}
        />
      );
    });
  },
  stop() {
    removeItem("QuickMention");
  }
});