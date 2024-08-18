import { byStrings, getLazyByKeys } from "@webpack";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { createAbort } from "../../util";

const [ abort, getSignal ] = createAbort();

const themeSettingsModuleLazy = getLazyByKeys([ "setShouldSyncAppearanceSettings" ]);
let themeSettingsModule: any;

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      match: "canUseClientThemes:function",
      replacements: [ "canUseClientThemes", "canUsePremiumAppIcons" ].map((type) => ({
        find: new RegExp(`${type}:function\\(.{1,3}\\){return`),
        replace: "$& $enabled||"
      }))
    },
    {
      match: byStrings("isEditorOpen", ".getCurrentDesktopIcon()"),
      find: /,(.{1,3}\..{1,3}\.isPremium\(.{1,3}\.default\.getCurrentUser\(\)\))/,
      replace: ",$enabled||$1"
    },
    {
      match: "backgroundGradientPresetId:null===",
      find: /setShouldSyncAppearanceSettings\((.{1,3})\){/,
      replace: "$&$1=$enabled?false:$1;"
    }
  ],
  async start() {
    const signal = getSignal();

    themeSettingsModule = await themeSettingsModuleLazy;

    if (signal.aborted) return;

    themeSettingsModule.setShouldSyncAppearanceSettings(false);
  },
  stop() {
    abort();
    themeSettingsModule?.setShouldSyncAppearanceSettings(true);
  }
});
