import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { bySource, getLazy } from "@webpack";
import { MenuComponents } from "../../api/menu";
import * as styler from "./index.css?managed";
import { DataStore } from "../../api/storage";
import { createSettings, SettingType } from "vx:plugins/settings";
import { ChannelStore } from "@webpack/common";

const injector = new Injector();
const settings = createSettings("blur-images", {
    blurNSFWChannels: {
        title: "Blur NSFW Channels",
        description: "Automatically blurs the images in a channel if marked as NSFW",
        default: true,
        type: SettingType.SWITCH
    }
});

class BlurChannels extends DataStore {
    private mutedChannels: string[];
    private manuallyUnmutedNSFWChannels: string[];

    constructor() {
        super("BlurChannels");
        this.mutedChannels = this.loadMutedChannels() || [];
        this.manuallyUnmutedNSFWChannels = this.loadManuallyUnmutedNSFWChannels() || [];
    }

    private loadMutedChannels(): string[] | null {
        return this.get<string[]>("mutedChannels") || null;
    }

    private loadManuallyUnmutedNSFWChannels(): string[] | null {
        return this.get<string[]>("manuallyUnmutedNSFWChannels") || null;
    }

    private saveMutedChannels(): void {
        this.set("mutedChannels", this.mutedChannels);
    }

    private saveManuallyUnmutedNSFWChannels(): void {
        this.set("manuallyUnmutedNSFWChannels", this.manuallyUnmutedNSFWChannels);
    }

    muteChannel(channelId: string): void {
        if (!this.isChannelMuted(channelId)) {
            this.mutedChannels.push(channelId);
            this.saveMutedChannels();
        }
        this.removeFromManuallyUnmutedNSFW(channelId);
    }

    isChannelMuted(channelId: string): boolean {
        return this.mutedChannels.includes(channelId);
    }

    unmuteChannel(channelId: string): void {
        this.mutedChannels = this.mutedChannels.filter(id => id !== channelId);
        this.saveMutedChannels();

        const channel = ChannelStore.getChannel(channelId);
        if (channel?.isNSFW?.() && settings.blurNSFWChannels.get()) {
            this.addToManuallyUnmutedNSFW(channelId);
        }
    }

    private addToManuallyUnmutedNSFW(channelId: string): void {
        if (!this.manuallyUnmutedNSFWChannels.includes(channelId)) {
            this.manuallyUnmutedNSFWChannels.push(channelId);
            this.saveManuallyUnmutedNSFWChannels();
        }
    }

    private removeFromManuallyUnmutedNSFW(channelId: string): void {
        this.manuallyUnmutedNSFWChannels = this.manuallyUnmutedNSFWChannels.filter(id => id !== channelId);
        this.saveManuallyUnmutedNSFWChannels();
    }

    applyBlur(className: string, channelId: string, nsfw: boolean = false): string {
        const channel = ChannelStore.getChannel(channelId);
        const isNSFW = channel?.isNSFW?.() || nsfw;
        const shouldBlurNSFW = settings.blurNSFWChannels.get();

        if (isNSFW && shouldBlurNSFW && !this.manuallyUnmutedNSFWChannels.includes(channelId)) {
            return `${className} vx-blur`;
        }

        return this.isChannelMuted(channelId) ? `${className} vx-blur` : className;
    }
}

const blurChannels = new BlurChannels();

const addBlurMenuItem = (props: any, res: any) => {
    const { channel } = props;
    const otterChannel = ChannelStore.getDMChannelFromUserId(props?.user?.id) // if channel doesnt exist. get the user channel...
    // this fails if dont have a dm open with them
    if (!otterChannel || !channel?.id) return // weird edge case
    
    const isMuted = channel?.id ? blurChannels.isChannelMuted(channel.id) : blurChannels.isChannelMuted(otterChannel.id)

    let label = isMuted ? "Unblur Images" : "Blur Images";
    
    res.props.children.push(
        <MenuComponents.MenuItem
            id="blur-images"
            label={label}
            action={() => {
                isMuted ? blurChannels.unmuteChannel(channel.id) : blurChannels.muteChannel(channel.id);
            }}
        />
    );
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start() {
        const MediaWrapper = await getLazy(bySource("zoomThumbnailPlaceholder"));

        injector.after(MediaWrapper.default.prototype, "render", (instance: any, _: any, result: any) => {
            const { className } = instance.props || {};
            const channelId = instance.props?.message?.channel_id;
            const channel = ChannelStore.getChannel(channelId);
            const isMarkedAsNSFW = channel?.isNSFW?.();

            if (result) {
                result.props.className = blurChannels.applyBlur(className, channelId, isMarkedAsNSFW);
            }
        });
    },
    stop() {
        injector.unpatchAll();
    },
    settings: settings,
    menus: {
        "channel-context": addBlurMenuItem,
        "user-context": addBlurMenuItem
    },
    styler
});