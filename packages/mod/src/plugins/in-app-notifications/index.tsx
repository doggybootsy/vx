import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { openNotification } from "../../api/notifications";
import { Icons, Markdown } from "../../components";
import { ChannelStore, GuildStore, NavigationUtils, RelationshipStore, UserStore } from "@webpack/common";
import { AuthorIcon } from "../../dashboard/pages/addons/plugins/card";
import { MessageAttachment, MessageJSON } from "discord-types/general";
import { createSettings, SettingType } from "vx:plugins/settings";
import {useState} from "react";

const IconURI = (id: string, hash: string) => `https://cdn.discordapp.com/avatars/${id}/${hash}.webp?size=1280`
const UrlRegex = /^(https?:\/\/[^\s]+\.(png|jpe?g|webp|gif|heic|heif|dng).+)/ig;

type MessageEventType = {
    type: string;
    channelId: string;
    message: MessageJSON
};

const notificationGroups: {
    [key: string]: {
        messages: MessageJSON[];
        timestamp: number;
        channelId: string;
    }
} = {};

const settings = createSettings("notification-manager", {
    notificationSound: {
        type: SettingType.SELECT,
        choices: [
            {label: "Coming soon", value: "none"}
            /*
            { label: "None", value: "none" },
            { label: "Default Discord", value: "default" },
            { label: "Ping", value: "ping" },
            { label: "Message", value: "message" }
             */
        ],
        default: "default",
        title: "Notification Sound",
        description: "Choose the sound to play when receiving notifications."
    },
    notifyOnFriendMessages: {
        type: SettingType.SWITCH,
        default: true,
        title: "Notify on Friend Messages",
        description: "Get notifications for messages from friends, even if you're not mentioned."
    },
    enableMentions: {
        type: SettingType.SWITCH,
        default: true,
        title: "Notify on Mentions",
        description: "Enable notifications when you're mentioned."
    },
    enableDM: {
        type: SettingType.SWITCH,
        default: true,
        title: "Notify on Direct Messages",
        description: "Enable notifications for DMs."
    },
    enableServerNotifications: {
        type: SettingType.SWITCH,
        default: true,
        title: "Notify on Server Messages",
        description: "Enable notifications for server messages."
    },
    privacyMode: {
        type: SettingType.SWITCH,
        default: false,
        title: "Privacy Mode",
        description: "Hide message content and images in notifications, showing only sender information."
    },
    notificationDuration: {
        type: SettingType.SELECT,
        choices: [
            { label: "5 seconds", value: "5s" },
            { label: "10 seconds", value: "10s" },
            { label: "15 seconds", value: "15s" },
            { label: "30 seconds", value: "30s" }
        ],
        default: "10s",
        title: "Notification Duration",
        description: "How long the notification should stay visible."
    },
    showIcons: {
        type: SettingType.SWITCH,
        default: true,
        title: "Show Icons",
        description: "Show user or server icons in notifications."
    },
    showFooter: {
        type: SettingType.SWITCH,
        default: true,
        title: "Show Footer",
        description: "Show footer with navigation options in the notifications."
    },
    notifySpecificUserIds: {
        type: SettingType.INPUT,
        default: "",
        title: "Notify for Specific User IDs",
        description: "Comma-separated list of user IDs to receive notifications for, if mentioned.",
        placeholder: "Enter user IDs separated by commas"
    },
    ignoredChannels: {
        type: SettingType.INPUT,
        default: "",
        title: "Ignored Channels",
        description: "Comma-separated list of channel IDs to ignore notifications from.",
        placeholder: "Enter channel IDs separated by commas"
    },
    maxImagePreviews: {
        type: SettingType.SELECT,
        choices: [
            { label: "No previews", value: "0" },
            { label: "1 preview", value: "1" },
            { label: "2 previews", value: "2" },
            { label: "4 previews", value: "4" }
        ],
        default: "4",
        title: "Maximum Image Previews",
        description: "Maximum number of image previews to show in notifications."
    },
    quietHours: {
        type: SettingType.SWITCH,
        default: false,
        title: "Enable Quiet Hours",
        description: "Mute notifications during specified hours."
    },
    quietHoursStart: {
        type: SettingType.SELECT,
        choices: Array.from({ length: 24 }, (_, i) => ({
            label: `${i.toString().padStart(2, '0')}:00`,
            value: `${i.toString().padStart(2, '0')}:00`
        })),
        default: "22:00",
        title: "Quiet Hours Start",
        description: "Start time for quiet hours."
    },
    quietHoursEnd: {
        type: SettingType.SELECT,
        choices: Array.from({ length: 24 }, (_, i) => ({
            label: `${i.toString().padStart(2, '0')}:00`,
            value: `${i.toString().padStart(2, '0')}:00`
        })),
        default: "08:00",
        title: "Quiet Hours End",
        description: "End time for quiet hours."
    },
});

const PrivacyMessage = ({ content, images }: { content: string; images: string[] }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsRevealed(true)}
            onMouseLeave={() => setIsRevealed(false)}
            style={{
                cursor: 'pointer',
                padding: '8px',
                background: isRevealed ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                borderRadius: '4px',
                transition: 'background 0.2s ease'
            }}
        >
            {isRevealed ? (
                <>
                    <Markdown text={content} />
                    {images.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                            {images.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Image ${index + 1}`}
                                    style={{ maxWidth: '25%', height: 'auto', margin: '5px' }}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-muted)'
                }}>
                    <Icons.Globe width='16px' height='16px' />
                    <span>Hover to reveal message</span>
                    {images.length > 0 && <span>• {images.length} image{images.length !== 1 ? 's' : ''}</span>}
                </div>
            )}
        </div>
    );
};

function isInQuietHours(): boolean {
    if (!settings.quietHours.get()) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + currentMinute / 60;

    const startHour = parseInt(settings.quietHoursStart.get() as string);
    const endHour = parseInt(settings.quietHoursEnd.get() as string);

    if (startHour < endHour) {
        return currentHour >= startHour && currentHour < endHour;
    } else {
        return currentHour >= startHour || currentHour < endHour;
    }
}

function displayNotification(event: MessageEventType) {
    const Channel = ChannelStore.getChannel(event.channelId);
    if (!Channel) return;

    const ignoredChannels = settings.ignoredChannels.get().split(",").map(id => id.trim());
    if (ignoredChannels.includes(event.channelId)) return;

    if (isInQuietHours()) return;

    const Guild = Channel?.guild_id ? GuildStore.getGuild(Channel.guild_id) : null;
    const LocalUser = UserStore.getCurrentUser();

    if (LocalUser.id === event.message.author.id) return;

    const isDM = Channel.isDM();
    const isUserMentioned = event.message.mentions.some((mention: { id: string }) => mention.id === LocalUser.id);
    const isReply = event.message.referenced_message?.author?.id === LocalUser.id;

    const storedUserIds = settings.notifySpecificUserIds.get().split(",").map((m) => m.trim());
    const isSpecificUserMentioned = event.message.mentions.some(mention => storedUserIds.includes(mention.id));
    const isUserIdInContent = event.message.content.includes(LocalUser.id);
    const isFriendMessage = RelationshipStore.isFriend(event.message.author.id);

    const shouldNotifyDM = isDM && settings.enableDM.get();
    const shouldNotifyServer = !isDM && settings.enableServerNotifications.get() && (
        (isUserMentioned && settings.enableMentions.get()) ||
        (isReply && settings.enableMentions.get()) ||
        isSpecificUserMentioned ||
        (isUserIdInContent && settings.enableMentions.get())
    );
    const shouldNotifyFriend = settings.notifyOnFriendMessages.get() && isFriendMessage;
    const shouldNotify = shouldNotifyDM || shouldNotifyServer || shouldNotifyFriend;

    if (!shouldNotify) return;

    const messageContent = event.message.content;
    const maxImages = parseInt(settings.maxImagePreviews.get() as string);
    const shouldShowImages = maxImages > 0;

    let imageUrls: string[] = [];
    if (shouldShowImages) {
        const imageUrlsFromContent = Array.from(event.message.content.matchAll(UrlRegex)).map(match => match[0]);
        const imageUrlsFromAttachments = event.message.attachments
            .map(attachment => attachment.url);
        imageUrls = [...imageUrlsFromContent, ...imageUrlsFromAttachments].slice(0, maxImages);
    }

    const recipientIcons = isDM && Array.isArray(Channel.recipients) && Channel.recipients.length > 1
        ? Channel.recipients.map((recipientId: string) => {
            const recipient = UserStore.getUser(recipientId);
            return recipient ? (
                <AuthorIcon key={recipientId} dev={{ username: recipient.username, discord: recipient.id }} isLast={false} />
            ) : null;
        })
        : null;

    const titleSuffix = isDM ? "(DM)" : Guild ? "(SERVER)" : "(GROUP)";
    const title = `${event.message.author.globalName ?? event.message.author.username} ${titleSuffix}`;

    /*
    const soundSetting = settings.notificationSound.get();
    if (soundSetting !== "none") {
        console.log(`Playing ${soundSetting} sound`);
    }
     */

    openNotification({
        duration: parseInt(settings.notificationDuration.get() as string) * 1000,
        title: title.trim(),
        description: settings.privacyMode.get() ? (
            <PrivacyMessage content={messageContent} images={imageUrls} />
        ) : (
            <>
                <Markdown text={messageContent} />
                {imageUrls.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                        {imageUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Image ${index + 1}`}
                                style={{ maxWidth: '25%', height: 'auto', margin: '5px' }}
                            />
                        ))}
                    </div>
                )}
            </>
        ),
        icon: settings.showIcons.get() ? (props: { width: number; height: number; className: string }): React.ReactNode => {
            return isDM ? (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {recipientIcons ?? (
                        <AuthorIcon
                            dev={{ username: event.message.author.username, discord: event.message.author.id }}
                            isLast={true}
                        />
                    )}
                </div>
            ) : Guild ? (
                <img
                    style={{ width: "25px", height: "25px" }}
                    src={Guild?.getIconSource?.(1280, true)?.uri || ''}
                />
            ) : (
                <AuthorIcon
                    dev={{ username: event.message.author.username, discord: event.message.author.id }}
                    isLast={true}
                />
            );
        } : null,
        footer: settings.showFooter.get() ? (
            <div
                onClick={() => NavigationUtils.transitionToGuild(Guild?.id ?? null, event.channelId, event.message.id)}
                style={{
                    alignContent: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    cursor: "pointer"
                }}
            >
                <Icons.Forward />
            </div>
        ) : null
    });
}

export default definePlugin(
    {
        authors: [Developers.kaan],
        requiresRestart: false,
        settings,
        fluxEvents: {
            MESSAGE_CREATE(event) {
                displayNotification(event as MessageEventType);
            }
        }
    }
);