import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { bySource, getLazy } from "@webpack";
import { MenuComponents } from "../../api/menu";
import "./index.css";
import { DataStore } from "../../api/storage";

const injector = new Injector();

class BlurChannels extends DataStore {
    private mutedChannels: string[];

    constructor() {
        super("BlurChannels");
        this.mutedChannels = this.loadMutedChannels() || [];
    }

    private loadMutedChannels(): string[] | null {
        // @ts-ignore
        return this.get<string[]>("mutedChannels") || null;
    }

    private saveMutedChannels(): void {
        this.set("mutedChannels", this.mutedChannels);
    }

    muteChannel(channelId: string): void {
        if (!this.isChannelMuted(channelId)) {
            this.mutedChannels.push(channelId);
            this.saveMutedChannels();
        }
    }

    isChannelMuted(channelId: string): boolean {
        return this.mutedChannels.includes(channelId);
    }

    unmuteChannel(channelId: string): void {
        this.mutedChannels = this.mutedChannels.filter(id => id !== channelId);
        this.saveMutedChannels();
    }

    applyBlur(className: string, channelId: string): string {
        return this.isChannelMuted(channelId) ? `${className} blur` : className;
    }
}

const blurChannels = new BlurChannels();

export default definePlugin({
    authors: [Developers.kaan],
    async start() {
        const MediaWrapper = await getLazy(bySource("zoomThumbnailPlaceholder"));

        injector.after(MediaWrapper.default.prototype, "render", (instance: any, _: any, result: any) => {
            const { className } = instance.props || {};
            const channelId = instance.props?.message?.channel_id;

            if (className && channelId) {
                result.props.className = blurChannels.applyBlur(className, channelId);
            }
        });
    },
    stop() {
        injector.unpatchAll();
    },
    menus: {
        "channel-context": (props: any, res: any) => {
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
        },
        "user-context": (props: any, res: any) => {
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
        }
    }
});
