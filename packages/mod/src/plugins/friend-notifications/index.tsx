import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { FluxDispatcher, RelationshipStore, UserStore } from "@webpack/common";
import {getLazy, getModule, getProxyStore} from "@webpack";
import { openNotification as originalOpenNotification } from "../../api/notifications";
import { User } from "discord-types/general";
import { AuthorIcon } from "../../dashboard/pages/addons/plugins/card";

function OpenChannel(userId: string) {
    getModule(x=>x.openPrivateChannel).openPrivateChannel(userId)
}

interface GlobalUser extends User
{
    globalName?: string    
}

function format(template: string, ...args: any[]) {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== "undefined" ? args[index] : match;
    });
}

function isFriend(userId: string) {
    return RelationshipStore.isFriend(userId);
}

function getColorFromStatus(status: string): string {
    switch (status.toLowerCase()) {
        case "online":
            return "rgb(35, 165, 90)";
        case "offline":
            return "rgb(128, 132, 142)";
        case "dnd":
            return "rgb(242, 63, 67)"
        case "busy":
            return "rgb(240, 178, 50)";
        case "idle":
            return "rgb(240, 178, 50)"
        case "away":
            return "rgb(240, 178, 50)";
        default:
            return "gray";
    }
}

function openNotification({
      title,
      description,
      user,
      status,
  }: {
    title: string;
    description: string;
    user: GlobalUser;
    status: string;
}) {
    const color = getColorFromStatus(status);

    originalOpenNotification({
        title,
        description,
        icon: (props) => (
            <AuthorIcon
                isLast={true}
                dev={{ discord: user.id, username: user.globalName || user.username }}
                {...props}
            />
        ),
        duration: 3000,
        color: color,
        footer: (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <svg
                    onClick={() => OpenChannel(user.id)}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="10px"
                    height="10px"
                    fill="#FFFFFF"
                    style={{cursor: "pointer"}}
                >
                    <path d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z"/>
                </svg>
            </div>
        ),
    });
}

class GlobalUserStatusTracker {
    private userStatuses: Map<string, any> = new Map();

    updateGlobalUserStatus(update: any) {
        if (!isFriend(update.user.id)) return;

        const user: any = UserStore.getUser(update.user.id);
        const oldStatus = this.userStatuses.get(user.id);
        this.userStatuses.set(user.id, update);

        if (oldStatus) {
            this.checkForChanges(oldStatus, update, user);
        }
    }

    private checkForChanges(oldStatus: any, newStatus: any, user: GlobalUser) {
        if (oldStatus.status !== newStatus.status) {
            openNotification({
                title: "Status Change",
                description: this.getStatusChangeMessage(user.globalName || user.username, oldStatus.status, newStatus.status),
                user,
                status: newStatus.status,
            });
        }

        const oldActivities = oldStatus.activities || [];
        const newActivities = newStatus.activities || [];
        this.checkActivityChanges(user, oldActivities, newActivities, newStatus.status);
    }

    private getStatusChangeMessage(username: string, oldStatus: string, newStatus: string): string {
        const statusMap: { [key: string]: string } = {
            online: "is now Online!",
            idle: "is AFK!",
            dnd: "does not want to be disturbed",
            offline: "has gone Offline!",
            streaming: "started Streaming!",
        };

        return `${username} ${statusMap[newStatus] || `changed status to ${newStatus}`}`;
    }

    private checkActivityChanges(user: GlobalUser, oldActivities: any[], newActivities: any[], status: string) {
        const oldGames = oldActivities.filter((a) => a.type === 0).map((a) => a.name);
        const newGames = newActivities.filter((a) => a.type === 0).map((a) => a.name);

        newGames.filter((game) => !oldGames.includes(game)).forEach((game) =>
            openNotification({
                title: "Game Change",
                description: `${user.globalName || user.username} started playing ${game}`,
                user,
                status,
            })
        );

        oldGames.filter((game) => !newGames.includes(game)).forEach((game) =>
            openNotification({
                title: "Game Change",
                description: `${user.globalName || user.username} stopped playing ${game}`,
                user,
                status,
            })
        );
    }
}

const userTracker = new GlobalUserStatusTracker();

function watchUserStatus(event: any) {
    if (event.type === "PRESENCE_UPDATES") {
        event.updates.forEach((update: any) => {
            userTracker.updateGlobalUserStatus(update);
        });
    }
}

const Flux = getLazy((x) => x.subscribe && x._dispatch);
let uwuflux: Record<PropertyKey, any>;

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start() {
        uwuflux = await Flux;
        await uwuflux.subscribe("PRESENCE_UPDATES", watchUserStatus);
    },
    async stop() {
        await uwuflux.unsubscribe("PRESENCE_UPDATES", watchUserStatus);
    },
});
