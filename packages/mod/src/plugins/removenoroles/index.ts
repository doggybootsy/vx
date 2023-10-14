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
  patches: [
    {
      match: ".Messages.BOT_PROFILE_REMOVE_PRIVATE_CHANNEL_INTEGRATION",
      replacements: [
        {
          find: /(function .{1,3}\((.{1,3})\){)(var .{1,3}=.{1,3}\.(?:user|guild|guildMember),.{1,3}=.{1,3}\.(?:user|guild|guildMember),)/,
          replace: "$1if($self.shouldHide($2))return;$3"
        }
      ]
    }
  ],
  shouldHide(props: { user: User, guild: Guild, guildMember: GuildMember }) {    
    if (!props.guild || !props.guildMember) return false;

    const canManageUser = PermissionStore.canManageUser(PermissionsBits.MANAGE_ROLES, props.user, props.guild);
    if (canManageUser) return false;

    return props.guildMember.roles.length === 0;
  }
});
