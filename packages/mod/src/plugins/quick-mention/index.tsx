import { Messages } from "vx:i18n";
import { definePlugin } from "..";
import * as minipopover from "../../api/minipopover";
import { Icons, MiniPopover } from "../../components";
import { Developers } from "../../constants";
import { PermissionStore, Constants, TextAreaInput, useStateFromStores } from "@webpack/common";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    minipopover.addItem("QuickMention", (props) => {
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
    minipopover.unpatchAll("QuickMention");
  }
});