import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { definePlugin } from "..";
import { ErrorBoundary, Icons } from "../../components";
import { Developers } from "../../constants";
import { className } from "../../util";

import * as styler from "./index.css?managed";

function PIP() {
  const ref = useRef<HTMLDivElement>(null);
  const [ video, setVideo ] = useState<null | HTMLVideoElement>(null);
  const [ active, setActive ] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) return;    
    const video = ref.current.parentElement!.querySelector<HTMLVideoElement>("video")!;

    setVideo(video);
  }, [ ]);

  useEffect(() => {
    if (!video) return;

    function listener() {
      setActive(true);
    };
    video.addEventListener("enterpictureinpicture", listener);
    return () => void video.removeEventListener("enterpictureinpicture", listener);
  }, [ video ]);

  useEffect(() => {
    if (!video) return;

    function listener() {
      setActive(false);
    };
    video.addEventListener("leavepictureinpicture", listener);
    return () => void video.removeEventListener("leavepictureinpicture", listener);
  }, [ video ]);

  const open = useCallback(async () => {
    if (!video) return;
    if (active) return document.exitPictureInPicture();

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    };

    if (video.readyState >= 2) {
      video.requestPictureInPicture();
    }
    else {
      video.addEventListener("canplay", open);
    };
  }, [ active, video ]);

  return (
    <div 
      ref={ref} 
      onClick={open}
      className={className([ "vx-pip-button", active && "vx-pip-active" ])}
    >
      <Icons.PIP />
    </div>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "this.renderVideo()",
    find: /this\.renderVideo\(\)/g,
    replace: "[$enabled&&$jsx($self.PIP),$&]"
  },
  PIP: ErrorBoundary.wrap(PIP),
  styler
});