import { definePlugin } from "../";
import { User } from "discord-types/general";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";
import { getLazyByProtoKeys } from "../../webpack";

const dataStore = new DataStore<{
  nicknames: Record<string, string>
}>("LocalNickNames");

dataStore.ensure("nicknames", {});

const localNickNames = dataStore.get("nicknames")!;

export default definePlugin({
  name: "LocalNickNames",
  description: "Adds custom local nicknames ",
  authors: [ Developers.doggybootsy ],
  async start() {
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
