import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "FreeHighQualityStream",
  description: "Allows you to stream at higher quality stream",
  authors: [ Developers.doggybootsy ],
  patches: [
    {
      match: "canUseHighVideoUploadQuality:",
      replacements: [
        {
          find: /canUseHighVideoUploadQuality:/,
          replace: "canUseHighVideoUploadQuality:(()=>true)??"
        },
        {
          find: /canStreamQuality:/,
          replace: "canStreamQuality:(()=>true)??"
        }
      ]
    },
    {
      match: "STREAM_FPS_OPTION.format",
      find: /guildPremiumTier:\i\.\i\.TIER_\d,?/g,
      replace: ""
    },
    {
      identifier: "no-upsell",
      match: ".default.Messages.STREAM_PREMIUM_UPSELL_BANNER_PRESET_DOCUMENTS",
      find: /,.{1,3}\?\(0,.{1,3}\.jsx\)\(.{1,3}\.default,{.+?openStreamUpsellModal:.{1,3}}\):null/g,
      replace: ""
    }
  ]
});
