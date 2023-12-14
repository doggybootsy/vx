import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "FreeHighQualityStream",
  description: "Allows you to stream at higher quality stream",
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      match: "canUseHighVideoUploadQuality:",
      replacements: [
        {
          find: /canUseHighVideoUploadQuality:(.+?}),/,
          replace: "canUseHighVideoUploadQuality:function(){if($enabled)return true;return ($1).apply(this,arguments);},"
        },
        {
          find: /canStreamQuality:(.+?}),/,
          replace: "canStreamQuality:function(){if($enabled)return true;return ($1).apply(this,arguments);},"
        }
      ]
    },
    {
      match: "STREAM_FPS_OPTION.format",
      find: /guildPremiumTier:(.{1,3}\.TIER_\d)(,?)/g,
      replace: "get guildPremiumTier(){if(!$enabled)return $1}$2"
    },
    {
      identifier: "no-upsell",
      match: ".default.Messages.STREAM_PREMIUM_UPSELL_BANNER_PRESET_DOCUMENTS",
      find: /,(.{1,3}\?\(0,.{1,3}\.jsx\)\(.{1,3}\.default,{.+?openStreamUpsellModal:.{1,3}}\):null)/g,
      replace: ",$enabled?false:$1"
    }
  ]
});
