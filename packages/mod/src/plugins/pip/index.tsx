import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { definePlugin, isPluginEnabled } from "..";
import {Button, ErrorBoundary, Icons, Popout, SystemDesign} from "../../components";
import { Developers } from "../../constants";
import { base64, className, proxyCache } from "../../util";

import * as styler from "./index.css?managed";
import * as popout from "./popout.css?managed";

import { DataStore } from "../../api/storage";
import { closeWindow, openWindow } from "../../api/window";
import { settings } from "../loop";
import { getProxy, getProxyByStrings } from "@webpack";
import { IS_DESKTOP } from "vx:self";
import { DiscordIcon } from "../../components/icons";
import exp from "node:constants";
import {openModal} from "../../api/modals";
import {closeMenu, MenuComponents, openMenu} from "../../api/menu";

const storage = new DataStore<{
  volume: number,
  muted: boolean
}>("pip", {});

const enum VideoState {
  PLAYING, PAUSED, ENDED
}

interface DurationBar extends React.ComponentClass<{
  buffers: number[][],
  type: "VOLUME" | "DURATION",
  value: number,
  onDrag(percent: number): void,
  onDragEnd(): void,
  onDragStart(): void,
  ref: React.Ref<DurationBar["prototype"]>,
  currentWindow: typeof globalThis
}> {
  Types: {
    DURATION: "DURATION", 
    VOLUME: "VOLUME"
  }

  prototype: {
    setGrabber(percent: number): void;
  }
}

function calcTime(time: number, minutePadding?: number) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - (minutes * 60));
  
  return `${minutes.toString().padStart(minutePadding || 0, "0")}:${10 > seconds ? `0${seconds}` : seconds}`
}

const DurationBar = getProxy<DurationBar>(m => m.Types?.DURATION);

const VolumeSlider = getProxyByStrings<React.ComponentClass<{
  onToggleMute(): void,
  muted: boolean,
  sliderClassName: string,
  currentWindow: typeof globalThis,
  minValue: number,
  maxValue: number,
  value: number,
  onValueChange(value: number): void
}>>([ "sliderClassName:", "onDragEnd:this.handleDragEnd", "handleValueChange" ]);

function useCurrentVolume() {
  const [ muted, setMuted ] = useState(() => storage.get("muted") ?? false);
  const [ volume, setVolume ] = useState(() => storage.get("volume") ?? 1);
  
  return useMemo(() => {
    return {
      muted: {
        get: () => muted,
        set: (value: boolean) => {
          storage.set("muted", value);
          setMuted(value);
        }
      },
      volume: {
        get: () => volume,
        set: (value: number) => {
          storage.set("volume", value);
          setVolume(value);
        }
      }
    }
  }, [ muted, volume ]);
}

function getBuffers(node: HTMLVideoElement) {
  const buffers = [];
  for (let index = 0; index < node.buffered.length; index++) {
    const start = node.buffered.start(index);
    const end = node.buffered.end(index);
    if (!(end - start < 1)) {
      buffers.push([ start / node.duration, (end - start) / node.duration ]);
    };
  };
  return buffers;
};

export function openPip(name, download)
{
  const key = `DISCORD_VX_${window.crypto.randomUUID()}`;
  openWindow({
    id: key,
    title: res.name,
    css: popout.css,
    render({window}) {
      return <PIPWindow window={window} src={res.download_url} windowKey={key}/>;
    }
  });
}

function PIPWindow({ window, src, windowKey }: { window: typeof globalThis, src: string, windowKey: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setVideoState] = useState(VideoState.PAUSED);
  const [canplay, setCanPlay] = useState(false);
  const [isLooping, setLooping] = useState(() => settings.autoLoop.get());
  const { muted, volume } = useCurrentVolume();
  const [show, shouldShow] = useState(false);
  const [isMouseOver, setMouseOver ] = useState(false);
  const [buffers, setBuffers] = useState<number[][]>([]);

  const [isPinned, setPinned] = useState(false);
  const isDragging = useRef(false);
  const durationBar = useRef<DurationBar["prototype"]>();
  const [duration, setDuration] = useState(0);

  const [durationFormatted, minutePadding] = useMemo(() => {
    const formatted = calcTime(duration);
    return [formatted, formatted.split(":")[0].length];
  }, [duration]);

  const currentTimeRef = useRef<HTMLDivElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 5];

  const updateCurrentTime = useCallback(() => {
    if (!video.current) return;
    currentTimeRef.current!.innerText = calcTime(video.current!.currentTime, minutePadding);
    durationBar.current?.setGrabber(video.current!.currentTime / video.current!.duration);
  }, [currentTimeRef, minutePadding]);

  const wasPaused = useRef(false);

  useLayoutEffect(() => {
    if (!video.current) return;
    video.current.volume = muted.get() ? 0 : volume.get();
    video.current.playbackRate = playbackRate;
  }, [muted, volume, playbackRate]);

  const action = useCallback(() => {
    if (!canplay) return;

    if (state === VideoState.PLAYING) {
      video.current?.pause();
      return;
    }

    video.current?.play();
  }, [video.current, canplay, state]);

  return (
      <div
          id="wrapper"
          onMouseEnter={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
      >
        <video
            src={src}
            ref={video}
            id="video"
            loop={isLooping}
            onPlay={() => setVideoState(VideoState.PLAYING)}
            onPause={() => setVideoState(VideoState.PAUSED)}
            onEnded={() => setVideoState(VideoState.ENDED)}
            onProgress={() => setBuffers(getBuffers(video.current!))}
            onCanPlay={() => {
              if (canplay) return;
              setCanPlay(true);
              video.current?.play();
            }}
            onClick={action}
            onTimeUpdate={updateCurrentTime}
            onLoadedMetadata={() => {
              setDuration(video.current!.duration);
            }}
        >
        </video>
        <div id="controls" data-should-show={canplay ? isMouseOver || state !== VideoState.PLAYING : false}>
          <div
              id="action"
              className="button"
              aria-disabled={!canplay}
              onClick={action}
          >
            {state === VideoState.PLAYING ? (
                <Icons.Pause />
            ) : state === VideoState.PAUSED ? (
                <Icons.Play />
            ) : (
                <Icons.Replay />
            )}
          </div>
          {isPluginEnabled("loop") && (
              <div id="loop" className={className(["button", isLooping && "active"])}
                   onClick={() => setLooping(v => !v)}>
                <Icons.Loop />
              </div>
          )}
          <div id="duration">
            <span ref={currentTimeRef}>0:00</span>
            <span>/</span>
            <span>{durationFormatted}</span>
          </div>
          <div id="slider">
            <DurationBar
                type={DurationBar.Types.DURATION}
                currentWindow={window}
                buffers={buffers}
                value={duration}
                onDrag={(percent) => {
                  video.current!.currentTime = percent * video.current!.duration;
                  updateCurrentTime();
                }}
                onDragEnd={() => {
                  isDragging.current = false;
                  if (!wasPaused.current && !video.current!.ended) video.current!.play();
                }}
                onDragStart={() => {
                  isDragging.current = true;
                  wasPaused.current = video.current!.paused;
                  video.current!.pause();
                }}
                ref={durationBar as any}
            />
          </div>
          <div id="volume">
            <VolumeSlider
                minValue={0}
                maxValue={1}
                value={volume.get()}
                muted={muted.get()}
                currentWindow={window}
                onValueChange={volume.set}
                onToggleMute={() => muted.set(!muted.get())}
                sliderClassName="volumeSlider"
            />
          </div>
          <div id={"gear"} className={"button"} onClick={() => shouldShow(!show)}>
            <Popout onRequestClose={() => {}}
                    position="right"
                    shouldShow={show}
                    renderPopout={(props) =>
                        <MenuComponents.Menu
                            {...props}
                            onClose={() => props.onClose?.()}
                            navId={"vx-pip-context-menu"}
                        >
                          <MenuComponents.Item id={"vx-pip-context-menu-speed"} label={"Set Playback Speed"}>
                            {speedOptions.map((speed) => (
                                <MenuComponents.MenuItem
                                    key={speed}
                                    id={`speed-${speed}`}
                                    label={`${speed}x`}
                                    action={() => {
                                      setPlaybackRate(speed);
                                      console.log(speed)
                                    }}
                                />
                            ))}
                          </MenuComponents.Item>
                        </MenuComponents.Menu>
                    }>
              {(props, state) => (
                  <Icons.Gear {...props} color={"var(--interactive-normal)"} />
              )}
            </Popout>
          </div>
          {IS_DESKTOP && (
              <div
                  id="pin"
                  className="button"
                  onClick={() => {
                    setPinned((value) => {
                      // @ts-expect-error
                      DiscordNative.window.setAlwaysOnTop(windowKey, !value);
                      return !value;
                    });
                  }}
              >
                {isPinned ? (
                    <DiscordIcon name="PinUprightSlashIcon" />
                ) : (
                    <DiscordIcon name="PinUprightIcon" />
                )}
              </div>
          )}
          <a
              id="download"
              className="button"
              role="button"
              href={src}
              target="_blank"
              rel="noreferrer noopener"
          >
            <Icons.Download />
          </a>
        </div>
      </div>
  );
}

function PIP() {
  const ref = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<null | HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const video = ref.current.parentElement!.querySelector<HTMLVideoElement>("video")!;

    setVideo(video);
  }, []);

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

    if (active) return closeWindow(`pip-${base64.encode(video.src)}`);

    const src = video.src;
    const key = `pip-${base64.encode(src)}`;

    openWindow({
      id: key,
      title: src,
      css: popout.css,
      render({ window }) {
        return <PIPWindow window={window} src={src} windowKey={`DISCORD_VX_${key}`} />
      }
    });
  }, [ active, video ]);

  useEffect(() => {
    return () => {
      if (!document.pictureInPictureElement) return;
      
      if (document.pictureInPictureElement.isEqualNode(video)) document.exitPictureInPicture();
    }
  }, [ video ]);

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
  icon: Icons.PIP,
  patches: {
    match: "this.renderVideo()",
    find: /this\.renderVideo\(\)/g,
    replace: "[$enabled&&$jsx($self.PIP),$&]"
  },
  PIP: ErrorBoundary.wrap(PIP),
  styler
});