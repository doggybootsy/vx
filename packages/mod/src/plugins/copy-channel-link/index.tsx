import { Channel, Guild } from "discord-types/general";
import { definePlugin } from "..";
import { ErrorBoundary, Icons, Tooltip } from "../../components";
import { getProxyByKeys } from "../../webpack";
import { clipboard } from "../../util";
import { Developers } from "../../constants";

const classes = getProxyByKeys<Record<string, string>>([ "iconItem", "summary" ]);

function CopyButton(props: {
  guild: Guild,
  channel: Channel
}) {
  return (
    <Tooltip
      text="Copy Link"
    >
      {(ttProps) => (
        <div
          {...ttProps}
          className={classes.iconItem}
          onClick={() => {
            if (clipboard.SUPPORTS_COPY) {
              clipboard.copy(new URL(`/channels/${props.guild.id}/${props.channel.id}`, location.href).href);
            };
            
            ttProps.onClick();
          }}
        >
          <Icons.Copy width={16} height={16} className={classes.actionIcon} />
        </div>
      )}
    </Tooltip>
  )
};

export default definePlugin({
  name: "CopyChannelLink",
  description: "Quickly copy channel links",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: "renderAcceptSuggestionButton",
    find: /\[(.{1,3}&&this\.renderAcceptSuggestionButton\(\))/g,
    replace: "[$react.createElement($self.CopyButton, this.props), $1"
  },
  CopyButton: ErrorBoundary.wrap(CopyButton)
});
