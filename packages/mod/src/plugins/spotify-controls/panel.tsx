import { getProxyByKeys, getProxyByStrings } from "@webpack";
import { Button, Icons, TextOverflowScroller } from "../../components";
import { className } from "../../util";

import { useInternalStore } from "../../hooks";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { openExternalWindowModal, openImageModal } from "../../api/modals";

import { spotifyStore } from "./store";
import { settings } from ".";
import { openMenu } from "../../api/menu";
import { SpotifyMenu } from "./menu";

const voicePanelClasses = getProxyByKeys([ "buttonContents", "buttonColor" ]);

const getTime = (elapsed: string | number | Date) => new Date(elapsed).toUTCString().split(" ").at(-2)!.split(":").slice(-2).join(":").replace(/^0/, "");

const PanelButton = getProxyByStrings<React.ComponentType<any>>([ "{tooltipText:", ".default.Masks.PANEL_BUTTON," ]);

export function SpotifyPanel() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);

  const [ position, setPosition ] = useState(spotifyStore.position);
  const data = useInternalStore(spotifyStore, () => ({
    track: spotifyStore.track!,
    device: spotifyStore.device!,
    isPlaying: spotifyStore.isPlaying,
    repeat: spotifyStore.repeat,
    isPremium: spotifyStore.isPremium(),
    isDragging: spotifyStore.isDragging,
    shuffleState: spotifyStore.shuffleState
  }));

  useEffect(() => {
    function frame() {
      id = requestAnimationFrame(frame);
      setPosition(spotifyStore.position);

      if (sliderRef.current && spotifyStore.track && !spotifyStore.isDragging) {
        const percent = Math.round((spotifyStore.position / spotifyStore.track.duration) * 100);
        if (sliderRef.current.style.width === `${percent}%`) return;
        sliderRef.current.style.width = `${percent}%`;
        if (seekRef.current) seekRef.current.style.left = `${percent}%`;
      }
    }
    let id = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(id);
  }, [ ]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    const target = event.currentTarget;
    spotifyStore.isDragging = true;

    let percent = Math.round((spotifyStore.position / spotifyStore.track!.duration) * 100);

    function onMouseMove(event: MouseEvent) {
      event.preventDefault();
  
      const rect = target.getBoundingClientRect();

      if (!(event.clientX >= rect.left && event.clientX <= rect.left + rect.width)) return; 

      percent = Math.round((event.clientX - rect.left) / rect.width * 100);
        
      sliderRef.current!.style.width = `${percent}%`;
      if (seekRef.current) seekRef.current.style.left = `${percent}%`;
    }
    function onMouseUp() {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.body.style.cursor = "unset";

      spotifyStore.seek(percent / 100 * spotifyStore.track!.duration);
      spotifyStore.isDragging = false;
    }

    document.body.style.cursor = "ew-resize";
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
  }, [ ]);

  if (!data.track) return null;

  return (
    <div 
      className="vx-spotify-panel" 
      onContextMenu={(event) => {
        openMenu(event, SpotifyMenu);
      }}
      data-is-premium={data.isPremium.toString()}
    >
      <div className="vx-spotify-details">
        <div 
          className="vx-spotify-img-wrapper"
          onClick={() => openImageModal(data.track.album.image.url)}
        >
          <img className="vx-spotify-img" src={data.track.album.image.url} />
        </div>
        <div className="vx-spotify-info">
          <TextOverflowScroller 
            className="vx-spotify-name"
            onClick={() => spotifyStore.openPage("track", data.track.id)}
          >
            {data.track.name}
          </TextOverflowScroller>
          <TextOverflowScroller className="vx-spotify-artists">
            {data.track.artists.map((artist, index) => (
              <Fragment key={index} >
                <span className="vx-spotify-artist">{artist.name}</span>
                {(index + 1) !== data.track.artists.length && (
                  <span className="vx-spotify-sep">{", "}</span>
                )}
              </Fragment>
            ))}
          </TextOverflowScroller>
          {false && (
            <TextOverflowScroller className="vx-spotify-album">{data.track.album.name}</TextOverflowScroller>
          )}
        </div>
        <div className="vx-spotify-buttons">
          <PanelButton 
            // tooltipText={data.shuffleState ? "Disable shuffle" : "Enable shuffle"}
            innerClassName={className([ data.shuffleState && "vx-spotify-selected" ])}
            role="switch"
            aria-checked={String(data.shuffleState)}
            onClick={() => {
              spotifyStore.setShuffle(!data.shuffleState);
            }}
            icon={Icons.Shuffle}
          />
          <PanelButton 
            // tooltipText={data.repeat === "off" ? "Enable repeat" : data.repeat === "context" ? "Enable repeat one" : "Disable repeat"}
            innerClassName={className([ data.repeat !== "off" && "vx-spotify-selected" ])}
            role="checkbox"
            aria-checked={data.repeat === "off" ? "false" : data.repeat === "context" ? "true" : "mixed"}
            onClick={() => {
              let mode: Spotify.ShuffleState = "off";
              switch (data.repeat) {
                case "off":
                  mode = "context";
                  break;
                case "context":
                  mode = "track";
                  break;
              }

              spotifyStore.setRepeat(mode);
            }}
            icon={data.repeat === "track" ? Icons.Repeat1 : Icons.Repeat}
          />
        </div>
      </div>
      <div className="vx-spotify-time-wrapper">
        <div className="vx-spotify-time">{getTime(position)}</div>
        <div className="vx-spotify-slider-wrapper" onMouseDown={data.isPremium ? onMouseDown : () => {}}>
          <div ref={sliderRef} className="vx-spotify-slider" />
          {data.isPremium && (
            <div ref={seekRef} className="vx-spotify-seek" />
          )}
        </div>
        <div className="vx-spotify-time">{getTime(data.track.duration)}</div>
      </div>
      {data.isPremium && (
        <div className={voicePanelClasses.actionButtons}>
          <Button
            size={Button.Sizes.SMALL}
            className={className([ voicePanelClasses.button, voicePanelClasses.buttonColor ])}
            onClick={(event) => {
              if (settings.altSkipBackwards.get() && event.detail === 2) {
                spotifyStore.previous();
                return;
              }

              if (settings.altSkipBackwards.get()) {
                if (spotifyStore.position > 5000) return spotifyStore.seek(0);
              }

              spotifyStore.previous();
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              
              spotifyStore.seek(Math.max(spotifyStore.position - 10_000, 0));
            }}
            innerClassName={voicePanelClasses.buttonContents}
            wrapperClassName={voicePanelClasses.button}
          >
            <Icons.SkipBackwards size={20} />
          </Button>
          <Button
            size={Button.Sizes.SMALL}
            className={className([ voicePanelClasses.button, voicePanelClasses.buttonColor ])}
            onClick={() => data.isPlaying ? spotifyStore.pause() : spotifyStore.play()}
            innerClassName={voicePanelClasses.buttonContents}
            wrapperClassName={voicePanelClasses.button}
          >
            {data.isPlaying ? (
              <Icons.Pause size={20} />
            ) : (
              <Icons.Play size={20} />
            )}
          </Button>
          <Button
            size={Button.Sizes.SMALL}
            className={className([ voicePanelClasses.button, voicePanelClasses.buttonColor ])}
            onClick={() => spotifyStore.next()}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();

              spotifyStore.seek(Math.min(spotifyStore.position + 10_000, data.track.duration));
            }}
            innerClassName={voicePanelClasses.buttonContents}
            wrapperClassName={voicePanelClasses.button}
          >
            <Icons.SkipForward size={20} />
          </Button>
        </div>
      )}
    </div>
  )
}