import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "onContextMenu:this.renderUserContextMenu",
    find: /(guildId:.{1,3},.+applicationStream:.{1,3},isOwner):(.{1,3}),/,
    replace: "$1:$enabled?$vx.webpack.common.GuildStore.getGuild(this.props.guildId).ownerId===this.props.user.id:$2,"
  }
});
