import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { FluxDispatcher, RelationshipStore, UserStore } from "@webpack/common";
import { getLazy, getModule, getProxy, getProxyStore } from "@webpack";
import { openNotification as originalOpenNotification } from "../../api/notifications";
import { User } from "discord-types/general";
import { AuthorIcon } from "../../dashboard/pages/addons/plugins/card";
import { DataStore } from "../../api/storage";
import {MenuComponents} from "../../api/menu";

const openPrivateChannel: { openPrivateChannel: (userId: string) => void } = getProxy(x => x.openPrivateChannel);

function openChannel(userId: string) {
    openPrivateChannel.openPrivateChannel(userId);
}

interface GlobalUser extends User {
    globalName?: string;
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
            return "rgb(242, 63, 67)";
        case "idle":
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
        sliderColor: color,
        footer: (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <svg
                    onClick={() => openChannel(user.id)}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="10px"
                    height="10px"
                    fill="#FFFFFF"
                    style={{ cursor: "pointer" }}
                >
                    <path d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z" />
                </svg>
            </div>
        ),
    });
}

type Blacklist = {
    "blacklisted-users": {
        gameBlocked: string[];
        statusBlocked: string[];
    }
};

class BlacklistManager {
    private static blacklistStore = new DataStore<Blacklist>("blacklisted-users", { version: 1 });
    private static blacklist: any = BlacklistManager.blacklistStore.get("blacklisted-users") || { gameBlocked: [], statusBlocked: [] };

    private static saveBlacklist(): void {
        BlacklistManager.blacklistStore.set("blacklisted-users", BlacklistManager.blacklist);
    }

    static isGameBlacklisted(userId: string): boolean {
        return BlacklistManager.blacklist.gameBlocked.includes(userId);
    }

    static isStatusBlacklisted(userId: string): boolean {
        return BlacklistManager.blacklist.statusBlocked.includes(userId);
    }

    static addToGameBlacklist(userId: string): void {
        if (!BlacklistManager.blacklist.gameBlocked.includes(userId)) {
            BlacklistManager.blacklist.gameBlocked.push(userId);
            BlacklistManager.saveBlacklist();
        }
    }

    static addToStatusBlacklist(userId: string): void {
        if (!BlacklistManager.blacklist.statusBlocked.includes(userId)) {
            BlacklistManager.blacklist.statusBlocked.push(userId);
            BlacklistManager.saveBlacklist();
        }
    }

    static removeFromGameBlacklist(userId: string): void {
        BlacklistManager.blacklist.gameBlocked = BlacklistManager.blacklist.gameBlocked.filter((id: string) => id !== userId);
        BlacklistManager.saveBlacklist();
    }

    static removeFromStatusBlacklist(userId: string): void {
        BlacklistManager.blacklist.statusBlocked = BlacklistManager.blacklist.statusBlocked.filter((id: string) => id !== userId);
        BlacklistManager.saveBlacklist();
    }
}

class GlobalUserStatusTracker {
    private userStatuses: Map<string, any> = new Map();

    updateGlobalUserStatus(update: any) {
        const userId = update.user.id;

        if (BlacklistManager.isStatusBlacklisted(userId)) return;
        if (!isFriend(userId)) return;

        const user: any = UserStore.getUser(userId);
        const oldStatus = this.userStatuses.get(userId)
        this.userStatuses.set(userId, update);

        if (oldStatus) {
            this.checkForChanges(oldStatus, update, user);
        }
    }

    private checkForChanges(oldStatus: any, newStatus: any, user: GlobalUser) {
        if (oldStatus.status !== newStatus.status && !BlacklistManager.isStatusBlacklisted(user.id)) {
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

        if (!BlacklistManager.isGameBlacklisted(user.id)) {
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
}

const userTracker = new GlobalUserStatusTracker();

function watchUserStatus(event: any) {
    if (event.type === "PRESENCE_UPDATES") {
        event.updates.forEach((update: any) => {
            userTracker.updateGlobalUserStatus(update);
        });
    }
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    fluxEvents: {
        PRESENCE_UPDATES(event) {
            watchUserStatus(event);
        },
    },
    menus: {
        "user-context"(args, res) {
            const userId = args.user.id;

            const handleBlacklistStatus = () => {
                if (BlacklistManager.isStatusBlacklisted(userId)) {
                    BlacklistManager.removeFromStatusBlacklist(userId);
                } else {
                    BlacklistManager.addToStatusBlacklist(userId);
                }
            };

            const handleBlacklistGame = () => {
                if (BlacklistManager.isGameBlacklisted(userId)) {
                    BlacklistManager.removeFromGameBlacklist(userId);
                } else {
                    BlacklistManager.addToGameBlacklist(userId);
                }
            };

            res.props.children.push(
                <MenuComponents.Item label={"Friend Notifications"} id={"friend-notifications"}>
                    <MenuComponents.Item
                        label={BlacklistManager.isStatusBlacklisted(userId) ? "Unblock Status Changes" : "Block Status Changes"}
                        id="blacklist-status"
                        action={handleBlacklistStatus}
                    />
                    <MenuComponents.Item
                        label={BlacklistManager.isGameBlacklisted(userId) ? "Unblock Game Changes" : "Block Game Changes"}
                        id="blacklist-game"
                        action={handleBlacklistGame}
                    />
                </MenuComponents.Item>
            );
        },
    },
});