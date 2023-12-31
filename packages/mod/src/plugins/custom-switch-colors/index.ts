import { useMemo } from "react";

import { definePlugin } from "../";
import { Developers } from "../../constants";
import { SettingType, createSettings } from "../settings";
import { Messages } from "i18n";

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
  name: () => Messages.CUSTOM_SWITCH_COLORS_NAME,
  description: () => Messages.CUSTOM_SWITCH_COLORS_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  settings,
  patches: {
    match: ".unsafe_rawColors.PRIMARY_400).spring()",
    replacements: [
      {
        find: /=\(0,.{1,3}\.useToken\)\(.{1,3}\.default\.unsafe_rawColors\.GREEN_360\)\.spring\(\),/,
        replace: "=$self.useColor('on'),"
      },
      {
        find: /=\(0,.{1,3}\.useToken\)\(.{1,3}\.default\.unsafe_rawColors\.PRIMARY_400\)\.spring\(\),/,
        replace: "=$self.useColor('off'),"
      }
    ]
  },
  useColor(type: "on" | "off") {
    const color = settings[type].use();

    return useMemo(() => `#${color.toString(16).padStart(6, "0")}`, [ color ]);
  }
});