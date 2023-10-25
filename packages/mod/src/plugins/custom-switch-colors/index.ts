import { definePlugin } from "../";
import { Developers } from "../../constants";
import { React } from "../../webpack/common";
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
  name: "CustomSwitchColors",
  description: "Custom Switch Colors",
  authors: [ Developers.doggybootsy ],
  settings,
  patches: {
    match: ".unsafe_rawColors.PRIMARY_400).spring()",
    replacements: [
      {
        find: /=\(0,.{1,3}\..{1,3}\)\(.{1,3}\..{1,3}\.unsafe_rawColors\.GREEN_360\)\.spring\(\),/,
        replace: "=$self.useColor('on'),"
      },
      {
        find: /=\(0,.{1,3}\..{1,3}\)\(.{1,3}\..{1,3}\.unsafe_rawColors\.PRIMARY_400\)\.spring\(\),/,
        replace: "=$self.useColor('off'),"
      }
    ]
  },
  useColor(type: "on" | "off") {
    const color = settings[type].use();

    return React.useMemo(() => `#${color.toString(16).padStart(6, "0")}`, [ color ]);
  }
});
