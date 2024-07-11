import { Channel, Guild } from "discord-types/general";
import { definePlugin } from "..";
import { ErrorBoundary, Icons, Tooltip } from "../../components";
import { getProxyByKeys } from "@webpack";
import { className, clipboard } from "../../util";
import { Developers } from "../../constants";
import { Messages } from "vx:i18n";

const classes = getProxyByKeys<Record<string, string>>([ "iconItem", "selected" ]);

function CopyButton(props: {
  guild: Guild,
  channel: Channel,
  forceShowButtons: boolean
}) {  
  return (
    <Tooltip text={Messages.COPY_LINK}>
      {(ttProps) => (
        <div
          {...ttProps}
          className={className([ classes.iconItem, props.forceShowButtons && classes.alwaysShown, classes.iconNoChannelInfo ])}
          onClick={() => {
            if (clipboard.SUPPORTS_COPY) {
              clipboard.copy(new URL(`/channels/${props.guild.id}/${props.channel.id}`, location.href).href);
            }
            
            ttProps.onClick();
          }}
        >
          <Icons.Copy width={16} height={16} className={classes.actionIcon} />
        </div>
      )}
    </Tooltip>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "renderAcceptSuggestionButton",
    find: /\[(.{1,3}&&this\.renderAcceptSuggestionButton\(\))/g,
    replace: "[$enabled&&$jsx($self.CopyButton, this.props),$1"
  },
  CopyButton: ErrorBoundary.wrap(CopyButton)
});
