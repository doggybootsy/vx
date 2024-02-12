import { definePlugin } from "../";
import { Guild, GuildMember, User } from "discord-types/general";
import { Developers } from "../../constants";
import { Constants, PermissionStore } from "@webpack/common";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  
  requiresRestart: false,

  patches: {
    match: ".rolePillBorder]",
    find: /function .{1,3}\((.{1,3})\){/,
    replace: "$&if($enabled&&$self.shouldHide($1))return null;"
  },

  shouldHide(props: { user: User, guild: Guild, guildMember: GuildMember }) {    
    if (!props.guild || !props.guildMember) return false;

    const canManageUser = PermissionStore.canManageUser(Constants.Permissions.MANAGE_ROLES, props.user, props.guild);
    if (canManageUser) return false;

    return props.guildMember.roles.length === 0;
  }
});
