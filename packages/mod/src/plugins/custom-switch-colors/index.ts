import { useMemo } from "react";

import { definePlugin } from "../";
import { Developers } from "../../constants";
import { SettingType, createSettings } from "../settings";

const settings = createSettings("CustomSwitchColors", {
  on: {
    type: SettingType.COLOR,
    default: 0x23A55A,
    title: "Enabled Switch Color"
  },
  off: {
    type: SettingType.COLOR,
    default: 0x80848E,
    title: "Disabled Switch Color"
  },
  demoSwitch: {
    type: SettingType.SWITCH,
    default: true,
    props: {
      hideBorder: true
    },
    title: "Demo Switch"
  }
});

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  settings,
  patches: {
    match: ".unsafe_rawColors.PRIMARY_400).spring()",
    replacements: [
      {
        find: /=(\(0,.{1,3}\.useToken\)\(.{1,3}\.(?:default|Z|ZP)\.unsafe_rawColors\.GREEN_360\)\.spring\(\)),/,
        replace: "=((n,o)=>$enabled?n:o)($self.useColor('on'),$1),"
      },
      {
        find: /=(\(0,.{1,3}\.useToken\)\(.{1,3}\.(?:default|Z|ZP)\.unsafe_rawColors\.PRIMARY_400\)\.spring\(\)),/,
        replace: "=((n,o)=>$enabled?n:o)($self.useColor('off'),$1),"
      }
    ]
  },
  useColor(type: "on" | "off") {    
    const color = settings[type].use();

    return useMemo(() => `#${color.toString(16).padStart(6, "0")}`, [ color ]);
  }
});