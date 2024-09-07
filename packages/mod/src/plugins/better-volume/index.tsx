// Does web support this? Discords code doesnt seem to say it does
// If it does i'll make it so this plugin exists on both

import { definePlugin } from "..";
import { Developers } from "../../constants";
import { MenuComponents } from "../../api/menu";
import { useState } from "react";
import { byStrings, getMangledProxy, getProxyByKeys, getProxyStore } from "@webpack";
import { SystemDesign } from "../../components";
import { useForceUpdate } from "../../hooks";

import * as styler from "./index.css?managed";
import { IS_DESKTOP } from "vx:self";

const MediaEngineStore = getProxyStore("MediaEngineStore");

const AudioConvert = getMangledProxy<{
  amplitudeToPerceptual(amplitude: number): number,
  perceptualToAmplitude(perceptual: number): number
}>("*50-50", {
  amplitudeToPerceptual: byStrings("log10"),
  perceptualToAmplitude: byStrings("pow")
});

const MediaEngineActions = getProxyByKeys([ "setLocalVolume", "toggleSelfMute" ])

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: [
    {
      match: "2022-09_remote_audio_settings",
      find: /return .{1,3}\.getCurrentConfig/,
      replace: "if($enabled)return false;$&"
    },
    {
      match: ".Messages.STREAM_VOLUME:",
      find: /\(0,.{1,3}\.jsx\)\(.{1,3}\.MenuControlItem,{.+}\)}\)/,
      replace: "$self.addTextInput($&,$enabled,...arguments)"
    }
  ],
  addTextInput(children: React.ReactNode, enabled: boolean, userId: string, context: any) {
    const [, forceUpdate ] = useForceUpdate();

    const [ isEmpty, setIsEmpty ] = useState(false);
    
    if (!enabled || !children) return children;

    return [
      children,
      <MenuComponents.MenuItem 
        id="better-user-volume"
        render={() => (
          <div className="vx-bv">
            <SystemDesign.TextInput
              className="vx-bv-input"
              value={isEmpty ? "" : Math.round(AudioConvert.amplitudeToPerceptual(MediaEngineStore.getLocalVolume(userId, context)))}
              type="number"
              size={SystemDesign.TextInput.Sizes.MINI}
              placeholder="100"
              max={IS_DESKTOP ? 200 : 100}
              min={0}
              onChange={(value: string) => {
                setIsEmpty(!value.length);

                value = Math.round(Number(value)).toString();

                MediaEngineActions.setLocalVolume(
                  userId,
                  AudioConvert.perceptualToAmplitude(Number(value)),
                  context
                );

                forceUpdate();
              }}
              onBlur={() => {
                if (!isEmpty) return;
                setIsEmpty(false);
              }}
            />
            <span className="vx-bv-percent">%</span>
          </div>
        )}
      />
    ]
  }
});
