import { UserStore } from "@webpack/common";
import { definePlugin } from "vx:plugins";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";
import { getProxyStore } from "@webpack";
import { Icons } from "../../components";
import * as styler from "./index.css?managed";
import {MenuComponents, MenuProps, patch, unpatch} from "../../api/menu";
import { getParents } from "../../util";

class PinDataStore extends DataStore<Record<string, Record<string, boolean>>> {
  constructor() {
    super("pin-dms", { version: 1 });
  }

  getPins() {
    const user = UserStore.getCurrentUser();
    if (!user) return {};
    const { id } = user;

    if (!id) return {};
    
    if (!this.has(id)) this.set(id, {});
    return this.get(id)!;
  }

  isPinned(channelId: string) {
    return Boolean(this.getPins()[channelId]);
  }
  pin(channelId: string) {
    this.set(UserStore.getCurrentUser().id, { ...this.getPins(), [channelId]: true });

    if (lastInstance) lastInstance.forceUpdate();
  }
  unpin(channelId: string) {
    this.set(UserStore.getCurrentUser().id, { ...this.getPins(), [channelId]: false });

    if (lastInstance) lastInstance.forceUpdate();
  }
}

const pinStore = new PinDataStore();

const PrivateChannelSortStore = getProxyStore("PrivateChannelSortStore");

let lastInstance: React.Component | null;
export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: [
    {
      match: "private-channels-",
      find: /let{privateChannelIds:.{1,3},padding:/,
      replace: "$self.sort(this,$enabled);$&"
    },
    {
      identifier: "dms",
      match: "PrivateChannel.renderAvatar",
      find: /(,.{1,3}\?\(0,.{1,3}\.jsx\)\(.{1,3},{}\):null,.+?,onMouseDown:.{1,3}}\))\]/,
      replace: "$1,$enabled&&$jsx($self.Indicator,arguments[0])]"
    }
  ],
  Indicator(props: any) {
    if (!pinStore.isPinned(props.channel.id)) return;

    return (
        <span className="vx-pd-icon">
        <Icons.Pin size={16} />
      </span>
    );
  },
  sort(instance: React.Component, enabled: boolean) {
    lastInstance = instance;

    if (!enabled) return;

    const pinned: string[] = [];
    const unpinned: string[] = [];

    const privateChannelIds = PrivateChannelSortStore.getPrivateChannelIds();

    for (const privateChannelId of privateChannelIds) {
      if (pinStore.isPinned(privateChannelId)) pinned.push(privateChannelId);
      else unpinned.push(privateChannelId);
    }

    (instance.props as any).privateChannelIds = [ ...pinned, ...unpinned ];
  },
  start() {
    lastInstance?.forceUpdate();

    patch("pin-dms", "user-context", StartFavorites);
    patch("pin-dms-gdm", "gdm-context", StartFavorites);

    function StartFavorites(props: MenuProps, res: { props: { children: React.JSX.Element[]; }; }) {
      const li = getParents(props.target).querySelector("li[class^=channel_]");
      if (!li) return;

      const channelId = li.querySelector("a[data-list-item-id]")!.getAttribute("data-list-item-id")?.split("_").at(-1)!;

      res.props.children.push(
          <MenuComponents.MenuGroup>
            <MenuComponents.MenuItem
                label={pinStore.isPinned(channelId) ? "Unfavorite" : "Favorite"}
                id="vx-pin-dms"
                action={() => {
                  if (pinStore.isPinned(channelId)) pinStore.unpin(channelId);
                  else pinStore.pin(channelId);
                }}
            />
          </MenuComponents.MenuGroup>
      )
    }

  },
  stop() {
    lastInstance?.forceUpdate();
    unpatch("pin-dms");
    unpatch("pin-dms-gdm");
  }
});
