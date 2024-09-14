import { definePlugin } from "..";
import { Icons } from "../../components";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  icon: Icons.DiscordIcon.from("YoutubeNeutralIcon"),
  start() {
    window.VXNative!.adblock.setState(true);
  },
  stop() {
    window.VXNative!.adblock.setState(false);
  }
});