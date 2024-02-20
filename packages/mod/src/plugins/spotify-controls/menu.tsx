import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { MenuComponents, MenuRenderProps, closeMenu } from "../../api/menu";
import { useInternalStore } from "../../hooks";
import { spotifyStore } from "./store";
import { Spinner, TextOverflowScroller } from "../../components";
import { openImageModal } from "../../api/modals";
import { Messages } from "vx:i18n";

function SpotifyTopMenu({ track }: { track: Spotify.Track }) {
  return (
    <div className="vx-spotify-menu">
      <div className="vx-spotify-img-wrapper">
        <img className="vx-spotify-img" src={track.album.image.url} />
      </div>
      <div className="vx-spotify-menu-info">
        <TextOverflowScroller className="vx-spotify-menu-name">
          {track.name}
        </TextOverflowScroller>
        <TextOverflowScroller className="vx-spotify-menu-artists">
          {track.artists.map((artist, index) => (
            <Fragment key={index} >
              <span className="vx-spotify-menu-artist">{artist.name}</span>
              {(index + 1) !== track.artists.length && (
                <span className="vx-spotify-sep">{", "}</span>
              )}
            </Fragment>
          ))}
        </TextOverflowScroller>
        <TextOverflowScroller className="vx-spotify-menu-album">
          {track.album.name}
        </TextOverflowScroller>
      </div>
    </div>
  )
}

export function SpotifyMenu(props: MenuRenderProps) {  
  const track = useInternalStore(spotifyStore, () => spotifyStore.track);
  const [ artists, setArtists ] = useState<Record<string, Spotify.ArtistFull>>({});

  useLayoutEffect(() => {
    if (!track) return void closeMenu();

    const abortController = new AbortController();

    for (const artist of track.artists) {
      spotifyStore.getArtist(artist.id).then((artist) => setArtists((p) => Object.assign({}, p, { [artist.id]: artist })));
    }

    return () => abortController.abort();
  }, [ track ]);

  if (!track) return null;
  
  return (
    <MenuComponents.Menu navId="vx-spotify-menu" onClose={closeMenu} {...props}>
      <MenuComponents.MenuGroup>
        <MenuComponents.MenuItem 
          id="track"
          keepItemStyles={false}
          render={() => <SpotifyTopMenu track={track} />}
        />
        <MenuComponents.MenuSeparator />
      </MenuComponents.MenuGroup>
      <MenuComponents.MenuItem 
        label={Messages.SPOTIFY_OPEN_TRACK}
        id="open-track"
        action={() => spotifyStore.openPage("track", track.id)}
      />
      <MenuComponents.MenuItem
        label={Messages.SPOTIFY_ARTISTS}
        id="artists"
      >
        {track.artists.map((artist, index) => (
          <MenuComponents.MenuItem 
            label={artist.name}
            action={() => spotifyStore.openPage("artist", artist.id)}
            id={`artists-${index}`}
            key={index}
          >
            {artists[artist.id] && (
              <MenuComponents.MenuItem 
                id={`artists-i-${index}`}
                render={() => (
                  <div className="vx-spotify-menu-artist-wrapper">
                    <img className="vx-spotify-menu-artist-img" src={artists[artist.id].images.at(0)!.url} />
                    <div className="vx-spotify-menu-artist-name">
                      {artist.name}
                    </div>
                    <div className="vx-spotify-menu-artist-followers">
                      {Messages.FOLLOWERS.format({ followers: artists[artist.id].followers.total })}
                    </div>
                  </div>
                )}
              />
            )}
          </MenuComponents.MenuItem>
        ))}
      </MenuComponents.MenuItem>
      <MenuComponents.MenuItem 
        label={Messages.SPOTIFY_OPEN_ALBUM}
        id="open-album"
        action={() => spotifyStore.openPage("album", track.album.id)}
      />
      <MenuComponents.MenuItem 
        label={Messages.SPOTIFY_PREVIEW_ALBUM_COVER}
        id="preview-album-cover"
        action={() => openImageModal(track.album.image.url)}
      />
    </MenuComponents.Menu>
  )
}