import { useState } from "react";

import { definePlugin } from "..";
import { openImageModal } from "../../api/modals";
import { ErrorBoundary, Icons, Spinner } from "../../components";
import { Developers } from "../../constants";
import { useAbortEffect } from "../../hooks";
import { download } from "../../util";
import { byStrings, getProxy, getProxyByKeys } from "../../webpack";
import { WindowUtil } from "../../webpack/common";

import { addStyle, removeStyle } from "./index.css?managed";
import { Messages } from "@i18n";

function getID(embedLink: string) {
  return embedLink.split("/").at(-1)!.split("?").at(0)!;
};

const filter = byStrings(".default.minWidth", ".default.Types.VIDEO", ".MAX_VIDEO_HEIGHT||");
const MediaPlayer = getProxy<React.FunctionComponent<any>>((m) => filter(m.prototype?.render))
const ImageDetails = getProxyByKeys<{
  MEDIA_MOSAIC_MAX_WIDTH: number,
  MEDIA_MOSAIC_MAX_HEIGHT: number,
  MediaLayoutType: Record<"MOSAIC", "string">
}>([ "MEDIA_MOSAIC_MAX_HEIGHT", "MEDIA_MOSAIC_MAX_WIDTH" ]);
const volumeSettings = getProxyByKeys([ "getMuted", "setMuted", "setVolume", "getVolume" ]);

function OverlayContent({ src, filename }: { src: string, filename: string }) {
  // no 'Access-Control-Allow-Origin' is set, so it can't download. 
  // Should i make my own Invidious thing or? Also window.fetch always gets to many requests
  // I couldnt figure out how to override that header on mv3
  const CAN_DOWNLOAD = false;

  return (
    <div className="vx-yt-overlay">
      {CAN_DOWNLOAD && (
        <div className="vx-yt-button"
          onClick={async () => {
            const request = await window.fetch(src);

            download(filename, await request.blob());
          }}
        >
          <Icons.Download />
        </div>
      )}
    </div>
  );
};

function getMiddle<T>(array: Array<T>): T {
  const sub = array.length % 2 ? 0 : 1;
  return array.at(Math.floor(array.length / 2) - sub)!;
};

const cache = new Map<string, { video: string, pfp: string }>();

async function getYoutubeData(id: string) {
  if (cache.has(id)) return cache.get(id)!;

  const response = await window.fetch(`https://www.youtube.com/watch?v=${id}`);
  const text = await response.text();
  const DOM = new DOMParser().parseFromString(text, "text/html");
  
  const scripts = Array.from(DOM.getElementsByTagName("script"));

  const ytInitialPlayerResponseScript = scripts.find(script => script.innerHTML.includes("adaptiveFormats"));
  (0, eval)(ytInitialPlayerResponseScript!.innerHTML);

  // @ts-expect-error
  const ytInitialPlayerResponse = window.ytInitialPlayerResponse;
  // @ts-expect-error
  delete window.ytInitialPlayerResponse;

  const ytInitialDataScript = scripts.find(script => script.innerHTML.includes("var ytInitialData"));
  (0, eval)(ytInitialDataScript!.innerHTML);

  // @ts-expect-error
  const ytInitialData = window.ytInitialData;
  // @ts-expect-error
  delete window.ytInitialData;

  const data = {
    // 0 worst, -1 best, so we pick a middle item but lean towards worse
    video: getMiddle(ytInitialPlayerResponse!.streamingData.formats as { url: string }[]).url as string,
    pfp: ytInitialData!.contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer.thumbnail.thumbnails.at(-1).url as string
  };

  // Cache Video, but stil let it to attempt to play at first, this takes to long
  (async () => {
    const res = await window.fetch(data.video);
    if (res.status >= 400 && res.status < 500) {
      cache.delete(id);      
      return;
    };

    const blob = await res.blob();
  
    data.video = URL.createObjectURL(blob);

    window.addEventListener("unload", () => {
      URL.revokeObjectURL(data.video);
    });
  })();

  cache.set(id, data);

  return data;
};

function YoutubePlayer(props: { embed: any, renderEmbedContent: () => React.ReactNode }) {
  const author = props.embed.author.name;
  const authorURL = props.embed.author.url;
  const url = props.embed.url;
  const thumbnail = props.embed.thumbnail.url;
  const title = props.embed.rawTitle;
  const { width, height } = props.embed.video;

  const id = getID(props.embed.video.url);

  const [ yt, setYT ] = useState<null | { video: string, pfp: string }>(null);

  useAbortEffect((signal) => {
    const fetch = getYoutubeData(id);

    fetch.then((data) => {
      if (signal.aborted) return;

      setYT(data);
    });
  });
    
  return (
    <div className="vx-yt-player" style={{ borderLeftColor: props.embed.color }}>
      <div className="vx-yt-header">
        <div className="vx-yt-pfp"
          onClick={() => {
            if (!yt) return;

            openImageModal(yt.pfp);
          }}
        >
          {yt ? (
            <img src={yt.pfp} height={40} width={40} />
          ) : (
            <Spinner type={Spinner.Type.SPINNING_CIRCLE} />
          )}
        </div>
        <div className="vx-yt-info">
          <div
            className="vx-yt-title"
            onClick={(event) => {
              WindowUtil.handleClick({ href: url }, event);
            }}
          >{title}</div>
          <div
            className="vx-yt-author"
            onClick={(event) => {
              WindowUtil.handleClick({ href: authorURL }, event);
            }}
          >
            <Icons.Youtube height="1rem" width="1rem" />
            <span>{author}</span>
          </div>
        </div>
      </div>
      <div className="vx-yt-wrapper">
        {yt ? (
          <MediaPlayer 
            autoMute={volumeSettings.getMuted}
            onMute={volumeSettings.setMuted}
            downloadable
            fileName={`${id}.mp4`}
            fileSize={0}
            naturalHeight={height}
            naturalWidth={width}
            height={height}
            width={width}
            maxHeight={ImageDetails.MEDIA_MOSAIC_MAX_HEIGHT}
            maxWidth={ImageDetails.MEDIA_MOSAIC_MAX_WIDTH}
            mediaLayoutType={ImageDetails.MediaLayoutType.MOSAIC}
            mimeType={[ "video", "mp4" ]}
            onVolumeChange={volumeSettings.setVolume}
            placeholder=""
            placeholderVersion={1}
            playable
            poster={thumbnail}
            renderOverlayContent={() => <OverlayContent src={yt.video} filename={`${id}.mp4`} />}
            responsive
            showThumbhashPlaceholder
            src={yt.video}
            useFullWidth={false}
            volume={volumeSettings.getVolume}
          />
        ) : (
          <div 
            className="vx-yt-loader"
            style={{
              aspectRatio: `${width}/${height}`,
              width: Math.min(ImageDetails.MEDIA_MOSAIC_MAX_WIDTH, width)
            }}
          >
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default definePlugin({
  name: () => Messages.DISCORD_YOUTUBE_PLAYER_NAME,
  description: () => Messages.DISCORD_YOUTUBE_PLAYER_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    find: "this.renderEmbedContent()",
    replace: "$enabled&&$self.shouldReplaceContent(this.props)?$react.createElement($self.YoutubePlayer,{embed:this.props.embed,renderEmbedContent:()=>this.renderEmbedContent()}):$&"
  },

  start() {
    addStyle();
  },
  stop() {
    removeStyle();
  },

  shouldReplaceContent(props: any) {
    try {      
      return props.embed.type === "video" && props.embed.video.url.includes("youtube.com/embed/");
    } 
    catch (error) {
      return false;
    }
  },
  YoutubePlayer: ErrorBoundary.wrap(YoutubePlayer, (props) => props.renderEmbedContent())
});
