import { definePlugin } from "../";
import { User } from "discord-types/general";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";
import { getLazyByKeys, getLazyByProtoKeys } from "../../webpack";
import { GuildMemberStore } from "discord-types/stores";
import { MenuComponents, patch } from "../../api/menu";
import { openPromptModal } from "../../api/modals";
import { findInReactTree } from "../../util";

type PatchedUser = User & { _globalName: string | null, globalName: string | null };

const dataStore = new DataStore<Record<string, string>>("LocalNicknames", {
  version: 1
});

async function patchUser() {
  const UserModule = await getLazyByProtoKeys<typeof User>([ "isClaimed", "isSystemUser" ]);
  
  Object.defineProperty(UserModule.prototype, "globalName", {
    get(this: PatchedUser) {
      if (this.id in dataStore.proxy) {
        return dataStore.proxy[this.id];
      };

      return this._globalName;
    },
    set(this: PatchedUser, v) {
      this._globalName = v;
      return true;
    }
  });
};
async function patchGuildMember() {
  const GuildMemberStore = await getLazyByKeys<GuildMemberStore>([ "getMember", "getMemberIds" ]);
  
  const getMember = GuildMemberStore.getMember;
  GuildMemberStore.getMember = function(guildId, userId) {
    const res = getMember.call(this, guildId, userId);

    if (res && userId in dataStore.proxy) {
      res.nick = dataStore.proxy[userId];
    };

    return res;
  };
};

function useMenu(user: PatchedUser) {
  const label = user.id in dataStore.proxy ? "Edit Local Nickname" : "Add Local Nickname";

  return (
    <MenuComponents.MenuItem 
      label={label}
      id="local-nickname"
      action={async () => {
        const value = await openPromptModal(label, {
          placeholder: user._globalName ?? user.username,
          value: user.globalName ?? user.username
        });

        if (value === null) return;
        if (value === "") {
          delete dataStore.proxy[user.id];
          return;
        };
        dataStore.proxy[user.id] = value;
      }}
    />
  );
};

export default definePlugin({
  name: "LocalNicknames",
  description: "Adds custom local nicknames",
  authors: [ Developers.doggybootsy ],
  start() {
    patchUser();
    patchGuildMember();

    patch("LocalNicknames", "user-context", (props, res) => {
      const menu = useMenu(props.user);

      const innerProps = findInReactTree<{ children: React.ReactNode[] }>(res, (item) => {
        if (!Array.isArray(item?.children)) return false;
        return item.children.find((child: any) => child?.props?.id === "user-profile");
      });
      
      if (innerProps) {
        innerProps.children.push(menu);
        return;
      };

      // Fallback
      res.props.children.push(
        <MenuComponents.MenuGroup>
          <MenuComponents.MenuSeparator />
          {menu}
        </MenuComponents.MenuGroup>
      );
    });
  }
});
