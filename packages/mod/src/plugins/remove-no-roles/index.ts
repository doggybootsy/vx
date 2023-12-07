import { definePlugin } from "../";
import { Guild, GuildMember, User } from "discord-types/general";
import { getProxy, getProxyStore } from "../../webpack";
import { Developers } from "../../constants";

const PermissionStore = getProxyStore("PermissionStore");
const PermissionsBits = getProxy<Record<string, bigint>>((m) => [ "ADMINISTRATOR", "MANAGE_ROLES", "MENTION_EVERYONE" ].every(b => typeof m[b] === "bigint"), { searchExports: true });

export default definePlugin({
  name: "RemoveNoRoles",
  description: "Removes the 'NO ROLES' section from user popouts",
  authors: [ Developers.doggybootsy ],
  patches: {
    match: ".rolePillBorder]",
    find: /function .{1,3}\((.{1,3})\){/,
    replace: "$&if($self.shouldHide($1))return null;"
  },
  shouldHide(props: { user: User, guild: Guild, guildMember: GuildMember }) {    
    if (!props.guild || !props.guildMember) return false;

    const canManageUser = PermissionStore.canManageUser(PermissionsBits.MANAGE_ROLES, props.user, props.guild);
    if (canManageUser) return false;

    return props.guildMember.roles.length === 0;
  }
});
