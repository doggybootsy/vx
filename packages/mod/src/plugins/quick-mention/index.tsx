import { definePlugin } from "..";
import { addItem, removeItem } from "../../api/minipopover";
import { Icons, MiniPopover } from "../../components";
import { Developers } from "../../constants";
import { I18n, insertText } from "../../webpack/common";

export default definePlugin({
  name: "QuickMention",
  description: "Quickly mention people",
  authors: [ Developers.doggybootsy ],
  start() {
    addItem("QuickMention", (props) => (
      <MiniPopover.Button 
        icon={Icons.At}
        text={I18n.Messages.MENTION}
        onClick={() => {
          insertText(`<@${props.author.id}>`);
        }}
      />
    ));
  },
  stop() {
    removeItem("QuickMention");
  }
});