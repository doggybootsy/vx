import { getLocale } from "vx:i18n";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { createState } from "../../util";
import { useEffect } from "react";
import { useForceUpdate } from "../../hooks";

import * as styler from "./index.css?managed";
import { SettingType, createSettings } from "../settings";

const settings = createSettings("guild-clock", {
  hour12: {
    type: SettingType.SWITCH,
    default: true,
    props: {
      hideBorder: true
    },
    title: "Use 12-hour Clock",
    description: "When enabled, the clock will display time using the 12-hour clock system, with AM and PM indicators. When disabled, the clock will display time using the 24-hour clock system"
  }
});

function getTime() {
  return new Date().toLocaleTimeString(getLocale(), {
    hour: "numeric",
    minute: "numeric",
    hour12: settings.hour12.get()
  });
}

const [ isEnabled, setEnabledState ] = createState(false);

export function GuildClock() {
  const enabled = isEnabled();
  const [ state, forceUpdate ] = useForceUpdate();

  useEffect(() => {
    if (!enabled) return;
    
    const id = setTimeout(() => {
      forceUpdate();
    }, 1000);

    return () => clearInterval(id);
  }, [ enabled, state ]);

  if (!enabled) return null;

  return (
    <div className="vx-guild-clock">
      {getTime()}
    </div>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  settings,
  start() {
    setEnabledState(true);
  },
  stop() {
    setEnabledState(false);
  }
});
