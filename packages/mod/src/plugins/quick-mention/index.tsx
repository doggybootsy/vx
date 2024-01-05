import { Messages } from "i18n";
import { definePlugin } from "..";
import { addItem, removeItem } from "../../api/minipopover";
import { Icons, MiniPopover } from "../../components";
import { Developers } from "../../constants";
import { PermissionStore, Constants, TextAreaInput, useStateFromStores } from "@webpack/common";

export default definePlugin({
  name: () => Messages.QUICK_MENTION_NAME,
  description: () => Messages.QUICK_MENTION_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    addItem("QuickMention", (props) => {
      const canSendMessages = useStateFromStores<boolean>([ PermissionStore ], () => {
        if (props.channel.isDM() || props.channel.isMultiUserDM() || props.channel.isGroupDM()) return true;
        return PermissionStore.can(Constants.Permissions.SEND_MESSAGES, props.channel);
      });

      return (
        <MiniPopover.Button 
          icon={Icons.At}
          text={Messages.MENTION}
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