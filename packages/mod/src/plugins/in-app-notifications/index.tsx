import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { openNotification } from "../../api/notifications";
import { Icons, Markdown } from "../../components";
import { ChannelStore, GuildStore, NavigationUtils, UserStore } from "@webpack/common";
import { AuthorIcon } from "../../dashboard/pages/addons/plugins/card";
import { MessageAttachment, MessageJSON } from "discord-types/general";
import { createSettings, SettingType } from "../settings";
import {isFriend} from "../friend-notifications";

const IconURI = (id: string, hash: string) => `https://cdn.discordapp.com/avatars/${id}/${hash}.webp?size=1280`

type MessageEventType = {
    type: string;
    channelId: string;
    message: MessageJSON
};

const settings = createSettings("notification-manager", {
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
    notificationDuration: {
        type: SettingType.SELECT,
        choices: ["5s", "10s", "15s", "30s"] as const,
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
});

function displayNotification(event: MessageEventType) {
    const Channel = ChannelStore.getChannel(event.channelId);
    if (!Channel) return;

    const Guild = Channel?.guild_id ? GuildStore.getGuild(Channel.guild_id) : null;
    const LocalUser = UserStore.getCurrentUser();

    if (LocalUser.id === event.message.author.id) return;

    const isDM = Channel.isDM();
    const isUserMentioned = event.message.mentions.some((mention: { id: string }) => mention.id === LocalUser.id);
    const isReply = event.message.referenced_message?.author?.id === LocalUser.id;

    const storedUserIds = settings.notifySpecificUserIds.get().split(",").map((m) => m.trim());
    const isSpecificUserMentioned = event.message.mentions.some(mention => storedUserIds.includes(mention.id));

    const isUserIdInContent = event.message.content.includes(LocalUser.id)  

    const isFriendMessage = isFriend(event.message.author.id);

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
    
    
    const recipientIcons = isDM && Array.isArray(Channel.recipients) && Channel.recipients.length > 1
        ? Channel.recipients.map((recipientId: string) => {
            const recipient = UserStore.getUser(recipientId);
            return recipient ? (
                <AuthorIcon key={recipientId} dev={{ username: recipient.username, discord: recipient.id }} isLast={false} />
            ) : null;
        })
        : null;

    const titleSuffix = isDM ? "(DM)" : Guild ? "(SERVER)" : "";
    // @ts-expect-error
    const title = `${event.message.author.globalName ?? event.message.author.username} ${titleSuffix}`;

    openNotification({
        duration: parseInt(settings.notificationDuration.get()) * 1000,  // Convert to milliseconds
        title: title.trim(),
        description: <Markdown text={event.message.content} />,
        // @ts-expect-error
        icon: settings.showIcons.get() ? (props: { width: number; height: number; className: string }): React.ReactNode => {
            return isDM ? (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {recipientIcons ?? (
                        <AuthorIcon dev={{ username: event.message.author.username, discord: event.message.author.id }} isLast={true} />
                    )}
                </div>
            ) : Guild ? (
                <img style={{ width: "25px", height: "25px" }} src={Guild?.getIconSource?.(1280, true)?.uri || ''} />
            ) : (
                <AuthorIcon dev={{ username: event.message.author.username, discord: event.message.author.id }} isLast={true} />
            );
        } : null,
        footer: settings.showFooter.get() ? (
            <div
                onClick={() => NavigationUtils.transitionToGuild(Guild?.id ?? null, event.channelId, event.message.id)}
                style={{ alignContent: "center", justifyContent: "center", alignItems: "center", display: "flex" }}
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
