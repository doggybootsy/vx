import {definePlugin} from "../index";
import {Developers} from "../../constants";
import {openNotification} from "../../api/notifications";
import {Icons, Markdown} from "../../components";
import {ChannelStore, GuildStore, NavigationUtils, UserStore} from "@webpack/common";
import {AuthorIcon} from "../../dashboard/pages/addons/plugins/card";
import {Injector} from "../../patcher";

type MessageType = {
    type: string;
    channelId: string;
    message: {
        attachments: any[];
        author: {
            avatar: string;
            clan: string | null;
            discriminator: string;
            id: string;
            username: string;
            publicFlags: number;
            avatarDecorationData: string | null;
            globalName: string | null;
        };
        channel_id: string;
        components: any[];
        content: string;
        edited_timestamp: string | null;
        embeds: any[];
        flags: number;
        id: string;
        mention_everyone: boolean;
        mention_roles: any[];
        mentions: any[];
        nonce: string;
        pinned: boolean;
        timestamp: string;
        tts: boolean;
        type: number;
    };
    optimistic: boolean;
    isPushNotification: boolean;
};

function displayNotification(Message: MessageType) {
    const Channel = ChannelStore.getChannel(Message.channelId);
    const Guild = Channel?.guild_id ? GuildStore.getGuild(Channel.guild_id) : null;
    const LocalUser = UserStore.getCurrentUser();

    if (LocalUser.id == Message.message.author.id) return;

    const isDM = Channel.isDM();
    const recipientIcons = isDM
        ? Channel.recipients.map((recipientId: string) => {
            const recipient = UserStore.getUser(recipientId);
            return <AuthorIcon key={recipientId} dev={{ username: recipient.username, discord: recipient.id }} isLast={false} />;
        })
        : null;

    openNotification({
        duration: 10000,
        title: Message.message.author?.globalName ?? Message.message.author.username,
        description: <Markdown text={Message.message.content}/>,
        icon(props: { width: number; height: number; className: string }): React.ReactNode {
            return isDM ? (
                <div style={{ display: "flex" }}>{recipientIcons}</div>
            ) : (
                Guild ? (
                    <img style={{ width: "25px", height: "25px" }} src={Guild?.getIconSource?.(1280, true).uri} />
                ) : (
                    <AuthorIcon dev={{ username: Message.message.author.username, discord: Message.message.author.id }} isLast={true} />
                )
            );
        },
        footer: (
            <div
                onClick={() => NavigationUtils.transitionToGuild(Guild?.id ?? null, Message.channelId, Message.message.id)}
                style={{ alignContent: "center", justifyContent: "center", alignItems: "center", display: "flex" }}
            >
                <Icons.Forward />
            </div>
        )
    });
}

const inj = new Injector()

export default definePlugin(
    {
        authors: [Developers.kaan],
        requiresRestart: false,
        fluxEvents:
            {
                MESSAGE_CREATE(event)
                {
                    displayNotification(event as MessageType)
                }
            }
    }
)