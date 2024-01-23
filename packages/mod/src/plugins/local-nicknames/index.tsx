import { definePlugin, isPluginEnabled } from "../";
import { User } from "discord-types/general";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";
import { getLazyByKeys } from "@webpack";
import { GuildMemberStore, UserStore } from "discord-types/stores";
import { MenuComponents, patch, unpatch } from "../../api/menu";
import { openPromptModal } from "../../api/modals";
import { createAbort, findInReactTree } from "../../util";
import { Injector } from "../../patcher";
import { Messages } from "vx:i18n";

const [ abort, getCurrentSignal ] = createAbort();

const injector = new Injector();

type PatchedUser = User & { globalName: string | null, _globalName: string | null };

const dataStore = new DataStore<Record<string, string>>("LocalNicknames", {
  version: 1
});

async function patchUser() {
  const signal = getCurrentSignal();

  const UserStore = await getLazyByKeys<UserStore>([ "getCurrentUser", "getUser" ]);

  if (signal.aborted) return;
  
  injector.after(UserStore, "getUser", (that, [ userId ], res) => {
    if (!res) return;
    // Is patched
    if ("_globalName" in res) return;

    let globalName = (res as PatchedUser).globalName;

    Object.defineProperty(res, "globalName", {
      get() {        
        if (isPluginEnabled("LocalNicknames") && userId in dataStore.proxy) {
          return dataStore.proxy[userId];
        };
  
        return globalName;
      },
      set(v) {
        globalName = v;
        return true;
      }
    });

    Object.defineProperty(res, "_globalName", {
      get() {
        return globalName;
      }
    });
  });
};
async function patchGuildMember() {
  const signal = getCurrentSignal();

  const GuildMemberStore = await getLazyByKeys<GuildMemberStore>([ "getMember", "getMemberIds" ]);

  if (signal.aborted) return;
  
  injector.after(GuildMemberStore, "getMember", (that, [ guildId, userId ], res) => {
    if (isPluginEnabled("LocalNicknames") && res && userId in dataStore.proxy) {
      res.nick = dataStore.proxy[userId];
    };
  });
};

function useMenu(user?: PatchedUser) {
  if (!user) return null;
  
  const label = user.id in dataStore.proxy ? Messages.EDIT_LOCAL_NICKNAME : Messages.ADD_LOCAL_NICKNAME;

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
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  start() {
    patchUser();
    patchGuildMember();

    patch("LocalNicknames", "user-context", (props, res) => {      
      const menu = useMenu(props.user);
      if (!menu) return;

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
  },
  stop() {
    abort();
    unpatch("LocalNicknames");
    injector.unpatchAll();
  }
});
