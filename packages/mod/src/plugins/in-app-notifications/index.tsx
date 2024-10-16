import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { openNotification } from "../../api/notifications";
import { Icons, Markdown } from "../../components";
import { ChannelStore, GuildStore, NavigationUtils, UserStore } from "@webpack/common";
import { AuthorIcon } from "../../dashboard/pages/addons/plugins/card";
import { MessageAttachment, MessageJSON } from "discord-types/general";
import { createSettings, SettingType } from "../settings";
import {isFriend} from "../friend-notifications";
import {DataStore} from "../../api/storage";

const IconURI = (id: string, hash: string) => `https://cdn.discordapp.com/avatars/${id}/${hash}.webp?size=1280`

const userIdsStore = new DataStore<Record<string, string>>("notifySpecificUserIds", { version: 1 });

type MessageType = {
    type: string;
    channelId: string;
    message: {
        attachments: MessageAttachment[];
        author: {
            avatar: string;
            id: string;
            username: string;
            globalName: string | null;
        };
        content: string;
        mentions: any[];
        referenced_message: MessageJSON;
    };
};

/*
    notifySpecificUserIds: {
        type: SettingType.INPUT,
        default: "",
        title: "Notify for Specific User IDs",
        description: "Comma-separated list of user IDs to receive notifications for, if mentioned.",
        placeholder: "Enter user IDs separated by commas",
        onChange(newValue) {
            const userIdsArray = newValue.split(",").map(id => id.trim()).filter(id => id.length > 0);
            const uniqueUserIds = [...new Set(userIdsArray)];
            userIdsStore.set("ids", uniqueUserIds.join(","));
        }
    },
    TODO: // DOGGY. FIX THIS NOW.
 */

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
    }
});

function displayNotification(Message: MessageType) {
    const Channel = ChannelStore.getChannel(Message.channelId);
    if (!Channel) return;

    const Guild = Channel?.guild_id ? GuildStore.getGuild(Channel.guild_id) : null;
    const LocalUser = UserStore.getCurrentUser();

    if (LocalUser.id === Message.message.author.id) return;

    const isDM = Channel.isDM();
    const isUserMentioned = Message.message.mentions.some((mention: { id: string }) => mention.id === LocalUser.id);
    const isReply = Message.message.referenced_message?.author?.id === LocalUser.id;

    const storedUserIds = userIdsStore.get("ids")?.split(",") || [];
    const isSpecificUserMentioned = Message.message.mentions.some(mention => storedUserIds.includes(mention.id));

    const isUserIdInContent = Message.message.content.includes(LocalUser.id)  

    const isFriendMessage = isFriend(Message.message.author.id);

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
    const title = `${Message.message.author.globalName ?? Message.message.author.username} ${titleSuffix}`;

    openNotification({
        duration: parseInt(settings.notificationDuration.get()) * 1000,  // Convert to milliseconds
        title: title.trim(),
        description: <Markdown text={Message.message.content} />,
        icon: settings.showIcons.get() ? (props: { width: number; height: number; className: string }): React.ReactNode => {
            return isDM ? (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {recipientIcons ?? (
                        <AuthorIcon dev={{ username: Message.message.author.username, discord: Message.message.author.id }} isLast={true} />
                    )}
                </div>
            ) : Guild ? (
                <img style={{ width: "25px", height: "25px" }} src={Guild?.getIconSource?.(1280, true)?.uri || ''} />
            ) : (
                <AuthorIcon dev={{ username: Message.message.author.username, discord: Message.message.author.id }} isLast={true} />
            );
        } : null,
        footer: settings.showFooter.get() ? (
            <div
                onClick={() => NavigationUtils.transitionToGuild(Guild?.id ?? null, Message.channelId, Message.message.id)}
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
                displayNotification(event as MessageType);
            }
        }
    }
);
