import React, { useState, useCallback, useEffect, useRef, FC } from 'react';
import { definePlugin } from "vx:plugins";
import { getModule, getProxy, getProxyByStrings, getProxyStore, whenWebpackInit } from "@webpack";
import * as styler from "./index.css?managed";
import { Developers } from "../../constants";
import { openModal } from "../../api/modals";

const MessageStore = getProxyStore("MessageStore");
const CarouselModal: any = getProxyByStrings([".Messages.MEDIA_VIEWER_MODAL_ALT_TEXT"]);

const CONFIG = {
    MEDIA: {
        IMAGE_EXTENSIONS: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'heif', 'dng', 'avif', 'ico'],
        VIDEO_EXTENSIONS: ['mp4', 'webm'],
        MAX_WIDTH_RATIO: 0.8,
        MAX_HEIGHT_RATIO: 0.8
    },
    URLS: {
        CDN: "https://cdn.discordapp.com/attachments/",
        MEDIA: "https://media.discordapp.net/attachments/"
    },
    CONSTS: {
        TYPES: {
            IMG: "IMAGE",
            VID: "VIDEO"
        },
        RULES: "embed-images"
    },
    CSS_CLASSES: {
        LAYOUT: {
            CONTAINER: 'vx-sia-container',
            CONTROLS: 'vx-sia-controls',
            MEDIA_CONTAINER: 'vx-sia-media-container',
            CONTAINER_COLLAPSED: 'vx-sia-container-collapsed'
        },
        MEDIA: {
            IMAGE: 'vx-sia-image',
            IMAGE_SHOWN: 'vx-sia-image-shown',
            IMAGE_HIDDEN: 'vx-sia-image-hidden',
            CUSTOM_IMAGE: 'vx-bd-sia-image'
        },
        OVERLAY: {
            BASE: 'vx-sia-overlay',
            HIDDEN: 'vx-sia-overlay-hidden',
            TEXT: 'vx-sia-overlay-text',
            URL: {
                CONTAINER: 'vx-sia-url-overlay',
                VISIBLE: 'vx-sia-url-overlay-visible',
                LINK: 'vx-sia-url-link'
            }
        },
        SOURCE: {
            TEXT: 'vx-sia-source-text',
            DISCORD: 'vx-sia-discord-source',
            EXTERNAL: 'vx-sia-external-source'
        },
        BUTTONS: {
            MAIN: 'vx-sia-toggle-button',
            SHOW: 'vx-sia-button-show',
            HIDE: 'vx-sia-button-hide'
        },
        MODAL: {
            CAROUSEL: 'vx-sia-carousel-modal'
        }
    }
};

interface MediaDimensions {
    width: number;
    height: number;
}

interface MediaState {
    shown: boolean;
    isHovering: boolean;
    isLoading: boolean;
    error: string | null;
    dimensions: MediaDimensions;
}

const Utils = {
    regex: {
        url: new RegExp(`^<?https?:\\/\\/[^\\s]+\\.(${CONFIG.MEDIA.IMAGE_EXTENSIONS.join('|')}).*>?`, 'i'),
        hidden: new RegExp(`<https?:\/\/[^\s]+>`, 'i'),
        video: new RegExp(`\\.(${CONFIG.MEDIA.VIDEO_EXTENSIONS.join('|')})$`, 'i')
    },

    async getMediaDimensions(src: string, type: string = 'image'): Promise<MediaDimensions & { type?: string }> {
        return new Promise((resolve, reject) => {
            if (type === 'image') {
                const img = new window.Image();
                img.src = src;
                img.onload = () => resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
                img.onerror = reject;
            } else {
                const video = document.createElement('video');
                video.src = src;
                video.onloadedmetadata = () => resolve({
                    width: video.videoWidth,
                    height: video.videoHeight,
                    type: video.canPlayType(src) || 'video/mp4'
                });
                video.onerror = reject;
            }
        });
    },

    calculateOptimalDimensions(natural: MediaDimensions, maxRatio: number): MediaDimensions {
        const maxWidth = window.innerWidth * maxRatio;
        const maxHeight = window.innerHeight * maxRatio;
        const aspectRatio = natural.width / natural.height;

        let width = natural.width;
        let height = natural.height;

        if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return { width, height };
    },

    isEmbeddedInMessage(message: any, url: string): boolean {
        if (!message?.embeds?.length) return false;
        const cleanUrl = url.replace('\\', '');
        return message.embeds.some((embed: { url: string | string[]; image: { url: string | string[]; }; }) =>
            embed.url?.includes(cleanUrl) ||
            embed?.image?.url?.includes(cleanUrl)
        );
    }
};

interface ImageProps {
    url: string;
    shown: boolean;
    onClick: () => void;
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    onError: () => void;
}

const Image: FC<ImageProps> = React.memo(({ url, shown, onClick, onLoad, onError }) => (
    <img
        src={url}
        alt={CONFIG.CSS_CLASSES.MEDIA.CUSTOM_IMAGE}
        onClick={onClick}
        onLoad={onLoad}
        onError={onError}
        className={`${CONFIG.CSS_CLASSES.MEDIA.IMAGE} ${shown ? CONFIG.CSS_CLASSES.MEDIA.IMAGE_SHOWN : CONFIG.CSS_CLASSES.MEDIA.IMAGE_HIDDEN}`}
    />
));

interface MediaViewerProps {
    url: string;
    args: { channelId: string; messageId: string; key: string; };
}

const MediaViewer: FC<MediaViewerProps> = ({ url, args }) => {
    const [state, setState] = useState<MediaState>({
        shown: false,
        isHovering: false,
        isLoading: false,
        error: null,
        dimensions: { width: 0, height: 0 }
    });

    const containerRef = useRef<HTMLDivElement | null>(null);
    const mediaRef = useRef<HTMLImageElement | null>(null);

    const message = MessageStore.getMessage(args.channelId, args.messageId);
    const isDiscordMedia = url.includes("discord");
    const parsedUrl = url.replace(/<|>/g, "");

    const toggleMedia = useCallback(() => {
        setState(prev => ({
            ...prev,
            shown: !prev.shown,
            isLoading: !prev.shown
        }));
    }, []);

    const handleMediaLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        console.log(e.currentTarget)
        setState(prev => ({
            ...prev,
            isLoading: false,
            dimensions: {
                width: e.currentTarget?.naturalWidth,
                height: e.currentTarget?.naturalHeight
            }
        }));
        mediaRef.current = e.currentTarget;
    }, []);

    const handleMediaError = useCallback(() => {
        setState(prev => ({
            ...prev,
            isLoading: false,
            error: "Failed to load media"
        }));
    }, []);

    const openMediaModal = async (url: string) => {
        const isVideo = Utils.regex.video.test(url);
        let dimensions: MediaDimensions;
        let type: string;

        try {
            dimensions = await Utils.getMediaDimensions(url, isVideo ? 'video' : 'image');
            type = isVideo ? CONFIG.CONSTS.TYPES.VID : CONFIG.CONSTS.TYPES.IMG;
        } catch (error) {
            console.error('Failed to get media dimensions:', error);
            return;
        }

        const item = {
            url,
            original: url,
            proxyUrl: url.replace(CONFIG.URLS.CDN, CONFIG.URLS.MEDIA),
            srcIsAnimated: false,
            contentScanMetadata: undefined,
            ...dimensions,
            type
        };

        openModal(props => (
            <CarouselModal
                {...props}
                className="vx-sia-carousel-modal"
                items={[item]}
                shouldHideMediaOptions={true}
                startingIndex={0}
            />
        ));
    };

    useEffect(() => {
        if (!containerRef.current || !mediaRef.current || !state.shown) return;
        const { width, height } = Utils.calculateOptimalDimensions(
            mediaRef.current,
            CONFIG.MEDIA.MAX_WIDTH_RATIO
        );

        containerRef.current.style.width = width ? `${width}px` : 'auto';
        containerRef.current.style.height = height ? `${height + 40}px` : 'auto';
    }, [state.shown, state.dimensions]);

    if (Utils.isEmbeddedInMessage(message, parsedUrl)) return null;

    return (
        <div
            className={`${CONFIG.CSS_CLASSES.LAYOUT.CONTAINER} ${!state.shown ? CONFIG.CSS_CLASSES.LAYOUT.CONTAINER_COLLAPSED : ''}`}
            onMouseEnter={() => setState(prev => ({ ...prev, isHovering: true }))}
            onMouseLeave={() => setState(prev => ({ ...prev, isHovering: false }))}
            ref={containerRef}
        >
            <div className={CONFIG.CSS_CLASSES.LAYOUT.CONTROLS}>
                <button
                    onClick={toggleMedia}
                    className={`${CONFIG.CSS_CLASSES.BUTTONS.MAIN} ${state.shown ? CONFIG.CSS_CLASSES.BUTTONS.HIDE : CONFIG.CSS_CLASSES.BUTTONS.SHOW}`}
                >
                    {state.shown ? "Hide" : "Show"}
                </button>
                <span className={`${CONFIG.CSS_CLASSES.SOURCE.TEXT} ${isDiscordMedia ? CONFIG.CSS_CLASSES.SOURCE.DISCORD : CONFIG.CSS_CLASSES.SOURCE.EXTERNAL}`}>
                    {isDiscordMedia ? "Discord media" : "External media"}
                </span>
            </div>
            <div className={CONFIG.CSS_CLASSES.LAYOUT.MEDIA_CONTAINER}>
                {state.shown && (
                    <Image
                        url={parsedUrl}
                        shown={state.shown}
                        onLoad={handleMediaLoad}
                        onError={handleMediaError}
                        onClick={() => openMediaModal(parsedUrl)}
                    />
                )}
                <div className={`${CONFIG.CSS_CLASSES.OVERLAY.BASE} ${state.shown ? CONFIG.CSS_CLASSES.OVERLAY.HIDDEN : ''}`}>
                    <div className={CONFIG.CSS_CLASSES.OVERLAY.TEXT}>
                        <p>{state.isLoading ? "Loading..." : (state.error || "Click to reveal media")}</p>
                    </div>
                </div>
                <div className={`${CONFIG.CSS_CLASSES.OVERLAY.URL.CONTAINER} ${state.isHovering ? CONFIG.CSS_CLASSES.OVERLAY.URL.VISIBLE : ''}`}>
                    <a
                        href={parsedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={CONFIG.CSS_CLASSES.OVERLAY.URL.LINK}
                    >
                        {parsedUrl}
                    </a>
                </div>
            </div>
        </div>
    );
};

const MarkdownModule = getProxy(m => m.defaultRules && m.parse);
export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    Utils,
    MediaViewer,
    styler,
    async start(signal: AbortSignal) {
        await whenWebpackInit()
        MarkdownModule.defaultRules[CONFIG.CONSTS.RULES] = {
            order: 1,
            match: (text: string) => Utils.regex.url.exec(text),
            parse: (capture: string[]) => ({
                url: capture[0],
                type: CONFIG.CONSTS.RULES
            }),
            react: (node: { url: string; }, _: any, args: { channelId: string, messageId: string, key: string }) => (
                <MediaViewer
                    url={node.url}
                    args={args}
                    key={args.key}
                />
            )

        };
        MarkdownModule.parse = MarkdownModule.reactParserFor(MarkdownModule.defaultRules);
    },
    stop() {
        delete MarkdownModule.defaultRules[CONFIG.CONSTS.RULES];
        MarkdownModule.parse = MarkdownModule.reactParserFor(MarkdownModule.defaultRules);
    }
});