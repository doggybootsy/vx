import { definePlugin } from "../";
import { User, GuildMember } from "discord-types/general";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";
import { getLazyByKeys, getLazyByProtoKeys } from "../../webpack";
import { GuildMemberStore } from "discord-types/stores";

const dataStore = new DataStore<{
  nicknames: Record<string, string>
}>("LocalNickNames");

dataStore.ensure("nicknames", {});

const localNickNames = dataStore.get("nicknames")!;

async function patchUser() {
  const User = await getLazyByProtoKeys<any>([ "isClaimed", "isSystemUser" ]);
  
  Object.defineProperty(User.prototype, "globalName", {
    get(this: User & { _globalName: string }) {
      if (this.id in localNickNames) {
        return localNickNames[this.id];
      };

      return this._globalName;
    },
    set(this: User & { _globalName: string }, v) {
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

    if (res && userId in localNickNames) {
      res.nick = localNickNames[userId];
    };

    return res;
  };
};

export default definePlugin({
  name: "LocalNickNames",
  description: "Adds custom local nicknames ",
  authors: [ Developers.doggybootsy ],
  start() {
    patchUser();
    patchGuildMember();
  },
  addNickName(id: string, nickname: string) {
    localNickNames[id] = nickname;

    dataStore.set("nicknames", structuredClone(localNickNames));
  },
  removeNickName(id: string) {
    delete localNickNames[id];
    
    dataStore.set("nicknames", structuredClone(localNickNames));
  }
});
