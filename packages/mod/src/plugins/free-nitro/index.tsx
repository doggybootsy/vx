import { byStrings, getLazyByKeys } from "@webpack";
import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { createAbort } from "../../util";
import { createSettings, SettingType } from "vx:plugins/settings";
import { Icons } from "../../components";

const [ abort, getSignal ] = createAbort();

const themeSettingsModuleLazy = getLazyByKeys([ "setShouldSyncAppearanceSettings" ]);
let themeSettingsModule: any;

const settings = createSettings("free-nitro", {
  freeStream: {
    title: "Free High Quality Stream",
    type: SettingType.SWITCH,
    default: true,
    description: "Allows you to stream at higher quality stream for free"
  },
  freeAppearance: {
    title: "Free Appearance",
    type: SettingType.SWITCH,
    default: true,
    description: "Gives access to nitro themes / app icon for free"
  }
})

const plugin = definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  settings,
  icon: Icons.DiscordIcon.from("NitroWheelIcon"),

  get freeStream(): boolean {
    return plugin.getActiveState() && settings.freeStream.get();
  },
  get freeAppearance(): boolean {
    return plugin.getActiveState() && settings.freeAppearance.get();
  },
  
  patches: [
    // Stream stuff
    {
      match: "canUseHighVideoUploadQuality:",
      replacements: [
        {
          find: /canUseHighVideoUploadQuality:(.+?}),/,
          replace: "canUseHighVideoUploadQuality:function(){if($self.freeStream)return true;return ($1).apply(this,arguments);},"
        },
        {
          find: /canStreamQuality:(.+?}),/,
          replace: "canStreamQuality:function(){if($self.freeStream)return true;return ($1).apply(this,arguments);},"
        }
      ]
    },
    {
      match: "STREAM_FPS_OPTION.format",
      find: /guildPremiumTier:(.{1,3}\.TIER_\d)(,?)/g,
      replace: "get guildPremiumTier(){if(!$self.freeStream)return $1}$2"
    },
    {
      identifier: "no-upsell",
      match: ".Messages.STREAM_PREMIUM_UPSELL_BANNER_PRESET_DOCUMENTS",
      find: /,(.{1,3}\?\(0,.{1,3}\.jsx\)\(.{1,3}\.(?:default|Z|ZP),{.+?openStreamUpsellModal:.{1,3}}\):null)/g,
      replace: ",$self.freeStream?false:$1"
    },
    // Theme stuff
    {
      match: "canUseClientThemes:function",
      replacements: [ "canUseClientThemes", "canUsePremiumAppIcons" ].map((type) => ({
        find: new RegExp(`${type}:function\\(.{1,3}\\){return`),
        replace: "$& $self.freeAppearance||"
      }))
    },
    {
      match: byStrings("isEditorOpen", ".getCurrentDesktopIcon()"),
      find: /,(.{1,3}\..{1,3}\.isPremium\(.{1,3}\.default\.getCurrentUser\(\)\))/,
      replace: ",$self.freeAppearance||$1"
    },
    {
      match: "backgroundGradientPresetId:null===",
      find: /setShouldSyncAppearanceSettings\((.{1,3})\){/,
      replace: "$&$1=$self.freeAppearance?false:$1;"
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
