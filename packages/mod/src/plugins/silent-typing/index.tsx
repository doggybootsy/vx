import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { getLazyByKeys } from "@webpack";
import { SettingType, createSettings } from "../settings";

import { KeyboardButton } from "./button";
import * as styler from "./index.css?managed"

const injector = new Injector();

export const settings = createSettings("SilentTyping", {
  shouldShowTyping: {
    type: SettingType.CUSTOM,
    default: false
  },
  button: {
    type: SettingType.SWITCH,
    default: true,
    title: "Silent Typing Button",
    description: "Adds a button to toggle silent typing",
    props: { style: { margin: 0 } }
  },
  alwaysShowButton: {
    type: SettingType.SWITCH,
    default: false,
    title: "Always Show Button",
    description: "Shows the button even when you can't type",
    onChange() {},
    disabled(settings) { return !settings.button.use(); },
    props: { hideBorder: true, style: { margin: 0 } }
  }
});

let enabled = false;
async function patchSilentTyping() {
  const typing = await getLazyByKeys<{
    startTyping: (channelId: string) => void
  }>([ "startTyping", "stopTyping" ]);

  if (!enabled) return;

  injector.instead(typing, "startTyping", (that, args, startTyping) => {
    if (!settings.button.get()) return;
    if (!settings.shouldShowTyping.get()) return;

    return startTyping.apply(that, args);
  });
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  settings,
  requiresRestart: false,
  patches: {
    match: "ChannelTextAreaButtons",
    find: /\(null===\(.{1,3}=.{1,3}\.gifs\).+?&&(.{1,3})\.push.+?{disabled:(.{1,3}),type:(.{1,3})}/,
    replace: "$self._addButton($1,$2,$3,$enabled);$&"
  },
  start() {
    enabled = true;
    patchSilentTyping();
  },
  stop() {
    enabled = false;
    injector.unpatchAll();
  },
  styler,
  _addButton(buttons: React.ReactNode[], disabled: boolean, type: { analyticsName: string }, enabled: boolean) {
    const shouldAddButton = settings.button.use();
    const alwaysShowButton = settings.alwaysShowButton.use();
    
    if (type.analyticsName !== "normal") return;
    if (!shouldAddButton || (disabled && !alwaysShowButton)) return;
    if (!enabled) return;

    buttons.push(
      <KeyboardButton key="silent-typing-keyboard-button" />
    );
  }
});
