import { definePlugin } from "../";
import { Guild, GuildMember, User } from "discord-types/general";
import { Developers } from "../../constants";
import { PermissionStore, PermissionsBits } from "../../webpack/common";
import { Messages } from "@i18n";

export default definePlugin({
  name: () => Messages.REMOVE_NO_ROLES_NAME,
  description: () => Messages.REMOVE_NO_ROLES_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  
  requiresRestart: false,

  patches: {
    match: ".rolePillBorder]",
    find: /function .{1,3}\((.{1,3})\){/,
    replace: "$&if($enabled&&$self.shouldHide($1))return null;"
  },

  shouldHide(props: { user: User, guild: Guild, guildMember: GuildMember }) {    
    if (!props.guild || !props.guildMember) return false;

    const canManageUser = PermissionStore.canManageUser(PermissionsBits.MANAGE_ROLES, props.user, props.guild);
    if (canManageUser) return false;

    return props.guildMember.roles.length === 0;
  }
});
