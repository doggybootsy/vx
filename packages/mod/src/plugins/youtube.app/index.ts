import { definePlugin } from "..";
import { Icons } from "../../components";
import { Developers } from "../../constants";
import { createSettings, SettingType } from "../settings";

const settings = createSettings("youtube", {
  adblock: {
    type: SettingType.SWITCH,
    default: true,
    title: "Adblock",
    description: "Adds a adblock",
    onChange(state) {
      window.VXNative!.adblock.setState(state);
    }
  },
  alwaysPlay: {
    type: SettingType.SWITCH,
    default: true,
    title: "Always Play",
    description: "Removes the cannot play video warning",
    onChange(state) {
      window.VXNative!.alwaysPlay.setState(state);
    }
  }
});

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  icon: Icons.DiscordIcon.from("YoutubeNeutralIcon"),
  settings,
  start() {
    window.VXNative!.adblock.setState(settings.adblock.get());
    window.VXNative!.alwaysPlay.setState(settings.alwaysPlay.get());
  },
  stop() {
    window.VXNative!.adblock.setState(false);
    window.VXNative!.alwaysPlay.setState(false);
  }
});