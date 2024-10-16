import { definePlugin } from "vx:plugins";
import { MenuComponents, patch, unpatch } from "../../api/menu";
import { Developers } from "../../constants";
import { byRegex, byStrings, combine, getMangledProxy, getProxyByKeys } from "@webpack";
import { GuildMemberStore, GuildStore } from "@webpack/common";

const impersonationModule = getMangledProxy<any>('dispatch({type:"IMPERSONATE_UPDATE",', {
  startImpersonating: combine(byStrings(".VIEW_AS_ROLES_SELECTED"), byRegex(/data:.{1,3}\}\),/))
});

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    patch("ViewServerAsUser", "user-context", (props, res) => {
      if (!props?.channel?.guild_id) return;
      const guild = GuildStore.getGuild(props.channel.guild_id);
      const member = GuildMemberStore.getMember(props.channel.guild_id, props.user.id);

      if (!member) return;

      res.props.children[0].props.children.push(
        <MenuComponents.MenuItem
          label="View Server As User"
          id="view-server-as-user"
          action={() => {            
            const roles = member.roles.map((id) => [ id, GuildStore.getRole(guild.id, id) ]);

            impersonationModule.startImpersonating(props.channel.guild_id, {
              type: "ROLES",
              roles: roles
            });
          }}
        />
      )
    })
  },
  stop() {
    unpatch("ViewServerAsUser");
  }
});
