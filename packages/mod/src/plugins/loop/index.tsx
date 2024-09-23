import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { definePlugin } from "..";
import { ErrorBoundary, Icons } from "../../components";
import { Developers } from "../../constants";
import { className } from "../../util";
import { SettingType, createSettings } from "../settings";

import * as styler from "./index.css?managed";

export const settings = createSettings("loop", {
  autoLoop: {
    type: SettingType.SWITCH,
    default: false,
    title: "Automatically loop",
    props: { hideBorder: true }
  }
});

function Loop() {
  const ref = useRef<HTMLDivElement>(null);
  const [ media, setMedia ] = useState<null | HTMLMediaElement>(null);
  const [ isLooping, setIsLooping ] = useState(() => settings.autoLoop.get());

  useLayoutEffect(() => {
    if (!ref.current) return;
    const media = ref.current.parentElement!.parentElement!.querySelector<HTMLMediaElement>(":is(video, audio)")!;

    setMedia(media);
    media.loop = isLooping;
  }, [ ]);

  const toggleLoop = useCallback(() => {
    if (!media) return;
    
    media.loop = !isLooping;
    setIsLooping(!isLooping);
  }, [ media, isLooping ]);

  return (
    <div 
      ref={ref} 
      onClick={toggleLoop}
      className={className([ "vx-loop-button", isLooping && "vx-loop-looping" ])}
    >
      <Icons.Loop />
    </div>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  settings,
  requiresRestart: false,
  icon: Icons.Loop,
  patches: [
    {
      find: "this.renderPlayIcon()",
      replace: "$&,$enabled&&$jsx($self.Loop)"
    }
  ],
  Loop: ErrorBoundary.wrap(Loop),
  styler
});
