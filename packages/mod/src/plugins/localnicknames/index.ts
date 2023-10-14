import { definePlugin } from "../";
import { User } from "discord-types/general";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";
import { getLazyByKeys, getLazyByProtoKeys } from "../../webpack";
import { GuildMemberStore } from "discord-types/stores";

const dataStore = new DataStore<Record<string, string>>("LocalNickNames", {
  version: 2,
  upgrader(version, oldData) {
    if (version === 1) {
      if ("nicknames" in oldData) return oldData.nicknames;
    };
  }
});

async function patchUser() {
  const User = await getLazyByProtoKeys<any>([ "isClaimed", "isSystemUser" ]);
  
  Object.defineProperty(User.prototype, "globalName", {
    get(this: User & { _globalName: string }) {
      if (this.id in dataStore.proxy) {
        return dataStore.proxy[this.id];
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

    if (res && userId in dataStore.proxy) {
      res.nick = dataStore.proxy[userId];
    };

    return res;
  };
};

export default definePlugin({
  name: "LocalNickNames",
  description: "Adds custom local nicknames",
  authors: [ Developers.doggybootsy ],
  start() {
    patchUser();
    patchGuildMember();
  },
  addNickName(id: string, nickname: string) {
    dataStore.proxy[id] = nickname;
  },
  removeNickName(id: string) {    
    delete dataStore.proxy[id];
  }
});
