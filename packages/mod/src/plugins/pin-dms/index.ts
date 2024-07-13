import { definePlugin } from "..";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";

const storage = new DataStore("pin-dms", { version: 1 });

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "private-channels-",
    find: /./,
    replace: "$&"
  }
});
