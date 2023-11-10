import { definePlugin } from "..";
import { ErrorBoundary, Icons } from "../../components";
import { Developers } from "../../constants";
import { className } from "../../util";
import { React } from "../../webpack/common";

import { addStyle } from "./index.css?managed";

function PIP() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [ video, setVideo ] = React.useState<null | HTMLVideoElement>(null);
  const [ active, setActive ] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!ref.current) return;    
    const video = ref.current.parentElement!.parentElement!.querySelector<HTMLVideoElement>("video")!;

    setVideo(video);
  }, [ ]);

  React.useEffect(() => {
    if (!video) return;

    function listener() {
      setActive(true);
    };
    video.addEventListener("enterpictureinpicture", listener);
    return () => void video.removeEventListener("enterpictureinpicture", listener);
  }, [ video ]);

  React.useEffect(() => {
    if (!video) return;

    function listener() {
      setActive(false);
    };
    video.addEventListener("leavepictureinpicture", listener);
    return () => void video.removeEventListener("leavepictureinpicture", listener);
  }, [ video ]);

  const open = React.useCallback(async () => {
    if (!video) return;
    if (active) return document.exitPictureInPicture();

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    };

    if (video.readyState === 4) {
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
};

export default definePlugin({
  name: "PIP",
  description: "Adds a PIP button to videos",
  authors: [ Developers.doggybootsy ],
  patches: [
    {
      match: "this.renderPlayIcon()",
      find: /(this\.renderPlayIcon\(\),.+?),(.{1,3}])/,
      replace: "$1,this.props.type==='VIDEO'&&$react.createElement($self.PIP),$2"
    }
  ],
  PIP: ErrorBoundary.wrap(PIP),
  start() {
    addStyle();
  }
});
