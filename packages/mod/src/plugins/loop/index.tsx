import { definePlugin } from "..";
import { ErrorBoundary, Icons } from "../../components";
import { Developers } from "../../constants";
import { className } from "../../util";
import { React } from "../../webpack/common";
import { SettingType, createSettings } from "../settings";

import { addStyle } from "./index.css?managed";

const settings = createSettings("loop", {
  autoLoop: {
    type: SettingType.SWITCH,
    default: false,
    title: "Automatically loop",
    props: { hideBorder: true }
  }
});

function Loop() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [ media, setMedia ] = React.useState<null | HTMLMediaElement>(null);
  const [ isLooping, setIsLooping ] = React.useState(() => settings.autoLoop.get());

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const media = ref.current.parentElement!.parentElement!.querySelector<HTMLMediaElement>(":is(video, audio)")!;

    setMedia(media);
    media.loop = isLooping;
  }, [ ]);

  const toggleLoop = React.useCallback(() => {
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
};

export default definePlugin({
  name: "Loop",
  description: "Adds a loop button to videos",
  authors: [ Developers.doggybootsy ],
  settings,
  patches: [
    {
      find: "this.renderPlayIcon()",
      replace: "$&,$react.createElement($self.Loop)"
    }
  ],
  Loop: ErrorBoundary.wrap(Loop),
  start() {
    addStyle();
  }
});
