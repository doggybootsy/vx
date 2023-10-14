/**
 * Code is mostly from {@link https://github.com/Vendicated/Vencord/blob/main/src/plugins/_core/noTrack.ts}
 * Only changes are to adapt it to VX api from Vencords api
 */

import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "NoTrack",
  description: "Disable Discord's tracking ('science'), metrics and Sentry crash reporting",
  authors: [ Developers.vencord ],
  required: true,
  patches: [
    {
      match: "TRACKING_URL:",
      replacements: [
        {
          find: /^.+$/,
          replace: "()=>{}",
        }
      ],
    },
    {
      match: "window.DiscordSentry=",
      replacements: [
        {
          find: /^.+$/,
          replace: "()=>{}",
        }
      ]
    },
    {
      match: ".METRICS,",
      replacements: [
        {
          find: /this\._intervalId.+?12e4\)/,
          replace: ""
        },
        {
          find: /(?<=increment=function\(\i\){)/,
          replace: "return;"
        }
      ]
    },
    {
      match: ".installedLogHooks)",
      replacements: [
        {
          find: /if\(\i\.getDebugLogging\(\)&&!\i\.installedLogHooks\)/,
          replace: "if(false)"
        }
      ]
    },
  ]
});