import { definePlugin } from "..";
import { MenuComponents } from "../../api/menu";
import { ModalComponents, openModal } from "../../api/modals";
import { Developers } from "../../constants";
import { GuildStore, RelationshipStore, useStateFromStores } from "@webpack/common";
import * as styler from "./index.css?managed";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { byStrings, getMangledProxy, getModule, getProxyStore } from "@webpack";
import { Messages } from "vx:i18n";
import { Guild } from "discord-types/general";
import { InternalStore, proxyCache } from "../../util";

const GuildMemberCountStore = getProxyStore("GuildMemberCountStore");

const quantize = getMangledProxy<{
  quantize(img: HTMLImageElement, sampleSize: number, pixelSkip: number): [ r: number, g: number, b: number ][]
}>("[[0,0,0]]", {
  quantize: byStrings(".getImageData(0,0,")
});

const cache: Record<string, any> = {};

const DEFAULT_COLOR: [ r: number, g: number, b: number ][] = [[ 0, 0, 0 ]];
async function getBannerColor(guildIcon?: string): Promise<[ r: number, g: number, b: number ][]> {
  if (!guildIcon) return DEFAULT_COLOR;

  return cache[guildIcon] ??= new Promise((resolve, reject) => {
    let img: HTMLImageElement | null = new Image();

    img.crossOrigin = "Anonymous",
    img.onerror = e=>{
      reject(e);
      img!.onerror = img!.onload = null,
      img = null;
    }
    ,
    img.onload = ()=>{
      resolve(quantize.quantize(img!, 5, 10));
      img!.onerror = img!.onload = null,
      img = null;
    }
    ,
    img.src = guildIcon;
  });
}

const enum Tabs {
  ABOUT, FRIENDS
}

function AboutTab({ guild }: { guild: Guild }) {
  return "Cool About Page";
}

const requestMembersById = proxyCache(() => getModule<{
  requestMembersById(guildId: string, ids: string[]): Promise<void>
}>(m=>m.requestMembersById)!.requestMembersById);

class InCommonStore extends InternalStore {
  public async requestFriendIds(guildId: string) {
    requestMembersById(guildId, RelationshipStore.getFriendIDs());

  }
}
const inCommonStore = new InCommonStore();

function FriendsTab({ guild }: { guild: Guild }) {
  return "Cool Friends Page";
}

function GuildProfile({ guildId, transitionState, onClose }: { guildId: string, transitionState: any, onClose(): void }) {
  const id = useId();
  const [ tab, setTab ] = useState(Tabs.ABOUT);

  const { guild, icon, banner } = useStateFromStores([ GuildStore ], () => {
    const guild = GuildStore.getGuild(guildId);

    return {
      guild,
      icon: guild.getIconURL(200, true),
      banner: guild.banner ? `https://cdn.discordapp.com/banners/${guildId}/${guild.banner}.${guild.banner.startsWith("a_") ? "gif" : "webp"}?size=480` : null
    }
  });

  const [ bannerColor, setBannerColor ] = useState(DEFAULT_COLOR[0]);
  useLayoutEffect(() => {
    const controller = new AbortController();
    
    getBannerColor(icon).then((color) => {
      if (controller.signal.aborted) return;
      setBannerColor(color[0]);
    });

    return () => controller.abort();
  }, [ icon ]);

  const bannerHeight = useMemo(() => banner ? 338 : 210, [ banner ]);
  
  const bannerStyles = useMemo(() => {
    const bannerStyles: React.CSSProperties = {
      backgroundColor: `rgb(${bannerColor.join(", ")})`
    }
  
    if (banner) {
      bannerStyles.backgroundImage = `url(${banner})`;
    }

    return bannerStyles;
  }, [ banner, bannerColor ]);
  
  return (
    <ModalComponents.Root transitionState={transitionState} size={ModalComponents.Size.SMALL} hideShadow className="vx-gp-root">
      <div className="vx-gp-modal" style={{ "--banner-height": `${bannerHeight}px` }}>
        <header data-has-banner={Boolean(banner).toString()}>
          <svg viewBox={`0 0 600 ${bannerHeight}`} style={{ minHeight: bannerHeight, width: 600 }}>
            <mask id={`${id}-${guildId}`}>
              <rect x={0} y={0} width="100%" height="100%" fill="white" />
              <circle cx={84} cy={bannerHeight - 5} r={68} fill="black" />
            </mask>
            <foreignObject x="0" y="0" width="100%" height="100%" overflow="visible" mask={`url(#${id}-${guildId})`} >
              <div style={bannerStyles} className="vx-gp-banner" />
            </foreignObject>
          </svg>
          <div className="vx-gp-icon">
            {icon ? (
              <img src={icon} height={120} width={120} />
            ) : (
              <div>
                {guild.acronym}
              </div>
            )}
          </div>
        </header>
        <div className="vx-gp-body">
          <div className="vx-gp-info">
            <div className="vx-gp-name">
              {guild.name}
            </div>
            {/* <div className="vx-gp-stats">
              <div>
                <span />
                <span>{memberCount}</span>
              </div>
              <div>
                <span />
                <span>{onlineCount}</span>
              </div>
            </div> */}
          </div>
          <div className="vx-gp-content">
            <div className="vx-gp-tabs">
              <div 
                className="vx-gp-tab" 
                tabIndex={0} 
                aria-selected={tab === Tabs.ABOUT} 
                aria-controls="about-tab"
                onClick={() => setTab(Tabs.ABOUT)}
              >
                {Messages.ABOUT}
              </div>
              <div 
                className="vx-gp-tab" 
                tabIndex={0} 
                aria-selected={tab === Tabs.FRIENDS} 
                aria-controls="friends-tab"
                onClick={() => setTab(Tabs.FRIENDS)}
              >
                {Messages.FRIENDS}
              </div>
            </div>
            <div className="vx-gp-page">
              {tab === Tabs.ABOUT ? <AboutTab guild={guild} /> : <FriendsTab guild={guild} />}
            </div>
          </div>
        </div>
      </div>
    </ModalComponents.Root>
  )
}

function openGuildProfileModal(guildId: string) {
  openModal((props) => <GuildProfile  guildId={guildId} {...props} />, { modalKey: `vx-guild-profile-${guildId}` });
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  menus: {
    "guild-context"(props, res) {
      res.props.children.unshift(
        <MenuComponents.MenuGroup>
          <MenuComponents.MenuItem 
            id="vx-guild-profile" 
            label="Guild Profile" 
            action={() => openGuildProfileModal(props.guild.id)}
          />
        </MenuComponents.MenuGroup>
      )
    }
  }
});
