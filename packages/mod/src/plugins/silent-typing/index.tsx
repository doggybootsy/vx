import { definePlugin } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { getLazyByKeys } from "../../webpack";
import { SettingType, createSettings } from "../settings";

import { KeyboardButton } from "./button";
import { addStyle } from "./index.css?managed"

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
    disabled(settings) { return !settings.button.use(); },
    props: { hideBorder: true, style: { margin: 0 } }
  }
});

async function patchSilentTyping() {
  const typing = await getLazyByKeys<{
    startTyping: (channelId: string) => void
  }>([ "startTyping", "stopTyping" ]);

  injector.instead(typing, "startTyping", (that, args, startTyping) => {
    if (settings.shouldShowTyping.get() && !settings.shouldShowTyping.get()) return;

    return startTyping.apply(that, args);
  });
};

export default definePlugin({
  name: "SilentTyping",
  description: "Tricks discord into thinking that you aren't typing",
  authors: [ Developers.doggybootsy ],
  settings,
  patches: {
    match: "ChannelTextAreaButtons",
    find: /.{1,3}&&.{1,3}\.type===.{1,3}\.ChannelTypes\.GUILD_TEXT&&null==.{1,3}&&(.{1,3})\.push\(\(0,.{1,3}jsx\)\(.{1,3}\.default,{disabled:(.{1,3}),channel:.{1,3},type:(.{1,3})}/,
    replace: ",$self._addButton($1,$2,$3)$&"
  },
  start() {
    patchSilentTyping();
    addStyle();
  },
  _addButton(buttons: React.ReactNode[], disabled: boolean, type: { analyticsName: string }) {
    const shouldAddButton = settings.button.use();
    const alwaysShowButton = settings.alwaysShowButton.use();
    
    if (type.analyticsName !== "normal") return;
    if (!shouldAddButton || (disabled && !alwaysShowButton)) return;

    buttons.push(
      <KeyboardButton key="silent-typing-keyboard-button" />
    );
  }
});
