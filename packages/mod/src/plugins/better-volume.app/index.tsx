// Does web support this? Discords code doesnt seem to say it does
// If it does i'll make it so this plugin exists on both

import { definePlugin } from "..";
import { Developers } from "../../constants";
import { MenuComponents } from "../../api/menu";
import { useState } from "react";
import { getProxyByKeys, getProxyStore } from "@webpack";
import { MegaModule } from "../../components";
import { useForceUpdate } from "../../hooks";

import * as styler from "./index.css?managed";

const MediaEngineStore = getProxyStore("MediaEngineStore");
const AudioConvert = getProxyByKeys<{
  amplitudeToPerceptual(amplitude: number): number,
  perceptualToAmplitude(perceptual: number): number
}>([ "amplitudeToPerceptual", "perceptualToAmplitude" ]);
const MediaEngineActions = getProxyByKeys([ "setLocalVolume", "toggleSelfMute" ])

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: [
    {
      match: "2022-09_remote_audio_settings",
      find: /shouldReadWriteAudioSettings:function\(\){return (.{1,3})}/,
      replace: "shouldReadWriteAudioSettings:function(){return $enabled?()=>false:$1}"
    },
    {
      match: ".default.Messages.STREAM_VOLUME:",
      replacements: [
        {
          find: /\(0,.{1,3}\.jsx\)\(.{1,3}\.MenuControlItem,{.+}\)}\)/,
          replace: "$self.addTextInput($&,$enabled,...arguments)"
        },
        {
          find: ".isPlatformEmbedded?200:100",
          replace: ".isPlatformEmbedded?$enabled?1000:200:100"
        }
      ]
    }
  ],
  addTextInput(children: React.ReactNode, enabled: boolean, userId: string, context: any) {
    const forceUpdate = useForceUpdate();

    const [ isEmpty, setIsEmpty ] = useState(false);
    
    if (!enabled || !children) return;

    return [
      children,
      <MenuComponents.MenuItem 
        id="better-user-volume"
        render={() => (
          <div className="vx-bv">
            <MegaModule.TextInput
              className="vx-bv-input"
              value={isEmpty ? "" : Math.round(AudioConvert.amplitudeToPerceptual(MediaEngineStore.getLocalVolume(userId, context)))}
              type="number"
              size={MegaModule.TextInput.Sizes.MINI}
              placeholder="100"
              max={1000}
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
