import { Channel, Guild } from "discord-types/general";
import { definePlugin } from "..";
import { Icons, Tooltip } from "../../components";
import { getProxyByKeys } from "../../webpack";
import { clipboard } from "../../util";
import { Developers } from "../../constants";

const classes = getProxyByKeys<Record<string, string>>([ "iconItem", "summary" ]);

export default definePlugin({
  name: "CopyChannelLink",
  description: "Quickly copy channel links",
  authors: [ Developers.doggybootsy ],
  patches: [
    {
      match: /\[.{1,3}&&.{1,3}\.renderAcceptSuggestionButton\(\)/,
      replacements: [
        {
          find: /\[(.{1,3}&&(.{1,3})\.renderAcceptSuggestionButton\(\))/g,
          replace: "[$self._renderCopyButton($2), $1"
        }
      ]
    }
  ],
  _renderCopyButton(component: React.Component<{
    guild: Guild,
    channel: Channel
  }>) {
    return (
      <Tooltip
        text="Copy Link"
      >
        {(props) => (
          <div
            {...props}
            className={classes.iconItem}
            onClick={() => {
              if (clipboard.SUPPORTS_COPY) {
                clipboard.copy(new URL(`/channels/${component.props.guild.id}/${component.props.channel.id}`, location.href).href);
              };
              
              props.onClick();
            }}
          >
            <Icons.Copy width={16} height={16} className={classes.actionIcon} />
          </div>
        )}
      </Tooltip>
    )
  }
});
