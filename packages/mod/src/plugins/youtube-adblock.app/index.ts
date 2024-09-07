import { definePlugin } from "..";
import { DiscordIcon } from "../../components/icons";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  icon: DiscordIcon.from("YoutubeNeutralIcon"),
  start() {
    window.VXNative!.adblock.setState(true);
  },
  stop() {
    window.VXNative!.adblock.setState(false);
  }
});