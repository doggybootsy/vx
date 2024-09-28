import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { bySource, getLazy } from "@webpack";
import { MenuComponents } from "../../api/menu";
import "./index.css";
import { DataStore } from "../../api/storage";
import {createSettings, SettingType} from "../settings";
import {ChannelStore} from "@webpack/common";

const injector = new Injector();
const settings = createSettings("ghost-call", {
    blurNSFWChannels: {
        title: "Blur NSFW Channels",
        description: "Automatically blurs the images in a channel if marked as NSFW",
        default: true,
        type: SettingType.SWITCH
    }
})

class BlurChannels extends DataStore {
    private mutedChannels: string[];

    constructor() {
        super("BlurChannels");
        this.mutedChannels = this.loadMutedChannels() || [];
    }

    /**
     * Loads muted channels from storage.
     * @returns {string[] | null} The muted channels or null if none.
     */
    private loadMutedChannels(): string[] | null {
        // @ts-ignore
        return this.get<string[]>("mutedChannels") || null;
    }

    /**
     * Saves the current muted channels to storage.
     */
    private saveMutedChannels(): void {
        this.set("mutedChannels", this.mutedChannels);
    }

    /**
     * Mutes a channel.
     * @param {string} channelId - The ID of the channel to mute.
     */
    muteChannel(channelId: string): void {
        if (!this.isChannelMuted(channelId)) {
            this.mutedChannels.push(channelId);
            this.saveMutedChannels();
        }
    }

    /**
     * Checks if a channel is muted.
     * @param {string} channelId - The ID of the channel to check.
     * @returns {boolean} True if the channel is muted, false otherwise.
     */
    isChannelMuted(channelId: string): boolean {
        return this.mutedChannels.includes(channelId);
    }

    /**
     * Unmutes a channel.
     * @param {string} channelId - The ID of the channel to unmute.
     */
    unmuteChannel(channelId: string): void {
        this.mutedChannels = this.mutedChannels.filter(id => id !== channelId);
        this.saveMutedChannels();
    }

    /**
     * Applies a blur effect to the image based on channel muting status.
     * @param {string} className - The original class name of the image.
     * @param {string} channelId - The ID of the channel associated with the image.
     * @param {boolean} nsfw - Adds the channel to the blurred automatically
     * @returns {string} The modified class name, potentially with a blur effect.
     */
    applyBlur(className: string, channelId: string, nsfw: boolean = false): string {
        if (nsfw) this.muteChannel(channelId)
        return this.isChannelMuted(channelId) ? `${className} blur` : className;
    }
}

const blurChannels = new BlurChannels();

/**
 * Adds a blur/unblur menu item for a given channel.
 * @param {Object} props - The properties of the channel.
 * @param {Object} res - The response object to modify.
 */
const addBlurMenuItem = (props: any, res: any) => {
    const { channel } = props;
    const isMuted = blurChannels.isChannelMuted(channel.id);
    const label = isMuted ? "Unblur Images" : "Blur Images";
    
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
            const isMarkedAsNSFW = ChannelStore.getChannel(channelId)?.isNSFW?.()

            if (result && isMarkedAsNSFW && settings.blurNSFWChannels.get())
            {
                blurChannels.muteChannel(channelId);
                result.props.className = blurChannels.applyBlur(className, channelId);
            }
            
            if (result && className && channelId) {
                result.props.className = blurChannels.applyBlur(className, channelId);
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
    }
});