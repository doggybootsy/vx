import { getProxyByKeys } from "@webpack"
import { InternalStore } from "../../util"
import { openNotification } from "../../api/notifications";
import { Icons } from "../../components";
import { settings } from ".";

const SpotifyUtil = getProxyByKeys([ "getAccessToken", "SpotifyAPI" ]);

export const spotifyStore = new class SpotifyStore extends InternalStore {
  constructor() {
    super();
  }

  displayName = "SpotifyStore";

  public isDragging = false;
  public isCracked = false;

  public accounts: Record<string, { isPremium: boolean, vx_original?: boolean }> = {};
  public isPremium() {    
    if (this.isCracked) return true;

    if (!this.accountId) return false;
    const account = this.accounts[this.accountId];
    if (!account) return false;
    return account.vx_original ?? account.isPremium;
  }

  public track: Spotify.Track | null = null;
  public device: Spotify.Device | null = null;
  public isPlaying = false;
  public shuffleState = false;

  // Sometimes this is off by a few seconds and to upwards of 40 seconds?
  // https://github.com/spotify/web-playback-sdk/issues/106#issuecomment-590708153
  #start!: number;
  #position!: number;
  public get position(): number {
    if (!this.isPlaying) return this.#position;

    let position = this.#position + (Date.now() - this.#start);

    let duration = 0;
    if (this.track) duration = this.track.duration;

    return position > duration ? duration : position;
  }
  public set position(p: number) {
    this.#position = p;
    this.#start = Date.now();
  }

  public repeat: Spotify.ShuffleState = "off";
  
  public accountId: string | null = null;
  public accessToken: string | null = null;

  public pause() {
    return this.request("/v1/me/player/pause", "put");
  }
  public play() {
    return this.request("/v1/me/player/play", "put");
  }
  public next() {
    return this.request("/v1/me/player/next", "post");
  }
  public previous() {
    return this.request("/v1/me/player/previous", "post");
  }
  public seek(position: number) {
    position = Math.round(position);

    this.position = position;
    return this.request("/v1/me/player/seek", "put", {
      position_ms: position
    });
  }
  public setRepeat(state: Spotify.ShuffleState) {
    this.request("/v1/me/player/repeat", "put", { state });
  }
  public setShuffle(state: boolean) {
    this.request("/v1/me/player/shuffle", "put", { state });
  }

  #cache = new Map<string, Promise<Spotify.ArtistFull>>();
  async #getArtist(id: string): Promise<Spotify.ArtistFull> {
    const response = await this.request(`/v1/artists/${id}`, "get");
    return await response.json();
  }
  public getArtist(id: string) {
    if (this.#cache.has(id)) return this.#cache.get(id)!;
    
    const artist = this.#getArtist(id);
    this.#cache.set(id, artist);

    return artist;
  }

  #requests = 0;
  private async request(path: string, method: string, data: any = {}): Promise<Response> {
    if (!this.accessToken) {
      const data = await SpotifyUtil.getAccessToken(this.accountId);
      this.accessToken = data.body.access_token;
    }

    const url = new URL(`https://api.spotify.com${path}`);

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];
        url.searchParams.set(key, element);
      }
    }

    url.searchParams.set("device_id", this.device!.id);

    const request = await window.fetch(url, {
      method: method.toUpperCase(),
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      }
    });

    // 401 === Token Expired
    if (request.status === 401) {
      // Give it 3 tries
      if (this.#requests++ <= 3) {
        this.accessToken = null;
        return this.request(path, method, data);
      }

      openNotification({
        id: "spotify-bad-401",
        title: "Unable to get Spotify Auth2 Token",
        icon: Icons.Spotify,
        type: "danger"
      });

      this.#requests = 0;
      return request;
    }
    if (!request.ok) {
      const { error } = await request.json();
      
      openNotification({
        id: `spotify-bad-${request.status}`,
        title: `${request.status} Bad Request`,
        icon: Icons.Spotify,
        type: "danger",
        description: error.message
      });
    }

    this.#requests = 0;
    return request;
  }

  openPage(type: Spotify.PageType, id: string) {
    if (settings.openInApp.get()) {
      window.open(`spotify:${type}:${id}`);
      return;
    }

    window.open(`https://open.spotify.com/${type}/${id}`);
  }
}