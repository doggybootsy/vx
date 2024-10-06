import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { MenuComponents } from "../../api/menu";
import { ModalComponents, openModal } from "../../api/modals";
import {byRegex, getByStrings, getModule, getProxy, getProxyByStrings, getProxyStore} from "@webpack";
import { useState } from "react";
import { Endpoints, FluxDispatcher, HTTP } from "@webpack/common";
import * as styler from "./index.css?managed";
import {Flex, Tooltip} from "../../components";

const SystemDesign = getProxy(x=>x.MusicIcon)

const GuildStore = getProxyStore("GuildStore");
const UserStore = getProxyStore("UserStore");
const EmojiStore = getProxyStore("EmojiStore");
const PermissionStore = getProxyStore("PermissionStore");
const PermissionsBits = getProxy(x => x.CREATE_GUILD_EXPRESSIONS, { searchExports: true });
const StickerStore = getProxyStore("StickersStore");

const uploadEmoji = getProxy(byRegex(/(.{1,3})\.(.{1,6})\.GUILD_EMOJIS\(.{1,3}\),body/), { searchExports: true });

interface Sticker {
    type: 2 | "sticker";
    description: string;
    format_type: number;
    guild_id: string;
    id: string;
    name: string;
    tags: string;
}

interface Emoji {
    type: 1 | "emoji";
    id: string;
    name: string;
    isAnimated: boolean;
}

type Data = Emoji | Sticker;

interface SaveStatus {
    guildId: string;
    status: 'pending' | 'success' | 'error';
    error?: string;
}

const LoadingSpinner = () => (
    <div className="vx-ec-loading-spinner"></div>
);

const StatusIndicator: React.FC<{ status: SaveStatus['status']; error?: string }> = ({ status, error }) => {
    if (status === 'pending') return <LoadingSpinner />;
    if (status === 'success') return <div className="vx-ec-status-dot success" />;
    if (status === 'error') return <div className="vx-ec-status-dot error" title={error} />;
    return null;
};
 
function getValidGuilds(data: Data) {
    const {id} = UserStore.getCurrentUser()
    const isSticker = data.type === 2;
    const isAnimated = "isAnimated" in data ? data.isAnimated : false;

    return Object.values(GuildStore.getGuilds())
        .filter((guild) => (PermissionStore.getGuildPermissions({ id: guild.id }) & PermissionsBits.CREATE_GUILD_EXPRESSIONS) === PermissionsBits.CREATE_GUILD_EXPRESSIONS || guild.ownerId === id)
        .filter((guild) => isSticker || (guild.getMaxEmojiSlots() > EmojiStore.getGuilds()[guild.id].emojis.filter((emoji: { animated: boolean; managed: any; }) => emoji.animated === isAnimated && !emoji.managed).length))
        .sort((alpha, sigma) => alpha.name.localeCompare(sigma.name));
}

const GuildIcon: React.FC<{
    guild: any;
    onClick: () => void;
    disabled: boolean;
    isSelected: boolean;
    status?: SaveStatus;
    emojiExists?: boolean;
}> = ({ guild, onClick, disabled, isSelected, status, emojiExists }) => {
    const iconUrl = guild.getIconSource(1280, true)?.uri;

    const className = `vx-ec-guild-icon ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${emojiExists ? 'exists' : ''}`;
    console.log(emojiExists)
    return (
        <div className="vx-ec-guild-icon-wrapper">
            {emojiExists ? (
                <Tooltip text="Emoji already exists in this server">
                    {(props) => (
                        <div {...props}
                            role="button"
                            aria-disabled={disabled}
                            onClick={disabled ? undefined : onClick}
                            className={className}
                            style={{
                                backgroundColor: iconUrl ? 'transparent' : '#36393f',
                                backgroundImage: iconUrl ? `url(${iconUrl})` : 'none',
                            }}
                        >
                            {!iconUrl && guild.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Tooltip>
            ) : (
                <div 
                     role="button"
                     aria-disabled={disabled}
                     onClick={disabled ? undefined : onClick}
                     className={className}
                     style={{
                         backgroundColor: iconUrl ? 'transparent' : '#36393f',
                         backgroundImage: iconUrl ? `url(${iconUrl})` : 'none',
                     }}
                >
                    {!iconUrl && guild.name.charAt(0).toUpperCase()}
                </div>
            )}
            {status && (
                <div className="vx-ec-status-indicator">
                    <StatusIndicator status={status.status} error={status.error}/>
                </div>
            )}
        </div>
    );
};

const GuildGrid = ({guilds, selectedGuilds, setSelectedGuilds, saveStatuses, selectedEmoji}) => {
    return (
        <div className="vx-ec-guild-grid">
            {guilds.map(guild => (
                <GuildIcon
                    key={guild.id}
                    guild={guild}
                    onClick={() => {
                        setSelectedGuilds(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(guild.id)) {
                                newSet.delete(guild.id);
                            } else {
                                newSet.add(guild.id);
                            }
                            return newSet;
                        });
                    }}
                    disabled={false}
                    isSelected={selectedGuilds.has(guild.id)}
                    status={saveStatuses.find(s => s.guildId === guild.id)}
                    emojiExists={checkEmojiExists(guild.id, selectedEmoji.id)}
                />
            ))}
        </div>
    );
};

async function fetchBlob(url: string): Promise<Blob> {
    const response = await request(url);
    return await response.blob();
}

function getUrl(data: Data, fileExt?): string {
    if (data.type === 2) {
        return `https://media.discordapp.net/stickers/${data.id}.${fileExt}?size=1280&quality=lossless`;
    } else {
        return `https://cdn.discordapp.com/emojis/${data.id}.${"isAnimated" in data && data.isAnimated ? 'gif' : 'png'}?size=1280&quality=lossless`;
    }
}

async function cloneSticker(guildId: string, sticker: Sticker, customName?: string, fileExt?) {
    const mainSticker = StickerStore.getStickerById(sticker.id);
    const data = new FormData();
    const fileData = await fetchBlob(getUrl(mainSticker, fileExt))
    data.append("name", customName || mainSticker.name);
    data.append("tags", mainSticker.tags);
    data.append("description", mainSticker.description);
    data.append("file", fileData);

    console.log(fileData)
    
    const { body } = await HTTP.RestAPI.get({
        url: Endpoints.STICKER(sticker.id)
    });

    FluxDispatcher.dispatch({
        type: "STICKER_FETCH_SUCCESS",
        sticker: body
    });
    
    await HTTP.RestAPI!.post({
        url: Endpoints.GUILD_STICKER_PACKS(guildId),
        body: data,
    });
}

async function cloneEmoji(guildId: string, emoji: Emoji | Sticker, customName?: string, fileExt) {
    const data = await fetchBlob(getUrl(emoji, fileExt));

    const dataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(data);
    });

    return uploadEmoji({
        guildId,
        name: customName || emoji.name.split("~")[0],
        image: dataUrl
    });
}

function checkEmojiExists(guildId: string, emojiId: string): boolean {
    const guildEmojis = EmojiStore.getGuilds()[guildId]?.emojis || [];
    return guildEmojis.some(emoji => emoji.id === emojiId);
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    menus: {
        "expression-picker"(instance, res) {
            const data = instance.target.dataset as Data;
            const fileExt = instance.target?.currentSrc?.match?.(/(\w+)\?/)?.[1]
            console.log(instance, fileExt)
            res.props.children.props.children.push(
                <MenuComponents.Item
                    id={"vx-ec-emoji-cloner-button"}
                    label={"Save to Guild"}
                    action={() => {
                        openModal((props) => {
                            const [selectedGuilds, setSelectedGuilds] = useState<Set<string>>(new Set());
                            const [customName, setCustomName] = useState<string>("");
                            const [saveStatuses, setSaveStatuses] = useState<SaveStatus[]>([]);
                            const [isSaving, setIsSaving] = useState(false);

                            const handleSave = async () => {
                                setIsSaving(true);
                                const guildsArray = Array.from(selectedGuilds);

                                for (const guildId of guildsArray) {
                                    setSaveStatuses(prev => [...prev, { guildId, status: 'pending' }]);

                                    try {
                                        if (data.type === "sticker") {
                                            await cloneSticker(guildId, data, customName, fileExt);
                                        } else {
                                            await cloneEmoji(guildId, data, customName);
                                        }

                                        setSaveStatuses(prev =>
                                            prev.map(s => s.guildId === guildId ? { ...s, status: 'success' } : s)
                                        );
                                    } catch (error) {
                                        setSaveStatuses(prev =>
                                            prev.map(s => s.guildId === guildId ? { ...s, status: 'error', error: error.message } : s)
                                        );
                                    }
                                }
                                setIsSaving(false);
                            };

                            return (
                                <ModalComponents.Root {...props}>
                                    <ModalComponents.Header>
                                        <h2 className="vx-ec-modal-title">
                                            Save {data.type === "sticker" ? "Sticker" : "Emoji"} to Guilds
                                        </h2>
                                    </ModalComponents.Header>
                                    <ModalComponents.Content>
                                        <div className="vx-ec-modal-content">
                                            <div className="vx-ec-input-group">
                                                <label className="vx-ec-input-label">
                                                    Custom Name (Optional)
                                                </label>
                                                <SystemDesign.TextInput
                                                    value={customName}
                                                    onChange={e => setCustomName(e)}
                                                    placeholder={`Enter custom name for ${data.type}`}
                                                />
                                            </div>

                                            <div className="vx-ec-guild-section">
                                                <label className="vx-ec-input-label">
                                                    Select Guilds
                                                </label>
                                                <GuildGrid
                                                    guilds={getValidGuilds(data)}
                                                    selectedGuilds={selectedGuilds}
                                                    setSelectedGuilds={setSelectedGuilds}
                                                    saveStatuses={saveStatuses}
                                                    selectedEmoji={data}
                                                />
                                            </div>
                                        </div>
                                    </ModalComponents.Content>
                                    <ModalComponents.Footer>
                                        <Flex align={Flex.Align.CENTER}>
                                            <SystemDesign.Button
                                                onClick={handleSave}
                                                disabled={selectedGuilds.size === 0 || isSaving}
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Flex align={Flex.Align.CENTER}>
                                                            <LoadingSpinner />
                                                            <span style={{ marginLeft: '8px' }}>Saving...</span>
                                                        </Flex>
                                                    </>
                                                ) : (
                                                    `Save to ${selectedGuilds.size} Guild${selectedGuilds.size !== 1 ? 's' : ''}`
                                                )}
                                            </SystemDesign.Button>
                                        </Flex>
                                    </ModalComponents.Footer>
                                </ModalComponents.Root>
                            );
                        });
                    }}
                />
            );
        },
    },
});