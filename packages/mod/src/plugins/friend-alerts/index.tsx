import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { MenuComponents } from "../../api/menu";
import { getProxyStore, whenWebpackInit } from "@webpack";
import { Icons } from "../../components";
import { DataStore } from "../../api/storage";
import { ModalComponents, openModal } from "../../api/modals";
import { AuthorIcon } from "../../dashboard/pages/addons/plugins/card";
import * as styler from "./index.css?managed";
import { useEffect, useLayoutEffect , useState } from "react";
import { Guild } from "discord-types/general";
import HomeButtonContextMenuApi, {coolApi, HMBA} from "../../api/quick-actions/hmba";

const pluginName: string = "FriendServerTracker";
const UserStored: DataStore = new DataStore(pluginName);

const RelationshipStore = getProxyStore("RelationshipStore");
const UserStore = getProxyStore("UserStore");
const GuildStore = getProxyStore("GuildStore");

const uri = (guild: Guild): string => `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=1280`;

interface ChangeData {
    lost: any[];
    gained: any[];
    hasChanges: boolean;
}

function compareAndUpdateData(currentData: any[], type: string): ChangeData {
    const storedData: any[] = UserStored.get(`stored${type}`) || [];
    const currentIds: Set<string> = new Set(currentData.map(item => item.id));
    const storedIds: Set<string> = new Set(storedData.map(item => item.id));

    let lostItems: any[] = UserStored.get(`lost${type}`) || [];
    let gainedItems: any[] = UserStored.get(`gained${type}`) || [];

    const newLost: any[] = storedData.filter(item => !currentIds.has(item.id));
    const newGained: any[] = currentData.filter(item => !storedIds.has(item.id));

    lostItems = [
        ...lostItems.filter(item => !currentIds.has(item.id)),
        ...newLost
    ];

    gainedItems = [
        ...gainedItems.filter(item => currentIds.has(item.id)),
        ...newGained
    ];

    lostItems = lostItems.filter(item => !gainedItems.some(gained => gained.id === item.id));
    gainedItems = gainedItems.filter(item => !lostItems.some(lost => lost.id === item.id));

    const hasChanges: boolean = newLost.length > 0 || newGained.length > 0;

    if (hasChanges) {
        UserStored.set(`lost${type}`, lostItems);
        UserStored.set(`gained${type}`, gainedItems);
        UserStored.set(`stored${type}`, currentData);
    }

    return { lost: lostItems, gained: gainedItems, hasChanges };
}

interface ChangeItemProps {
    item: any;
    type: string;
}

function ChangeItem({ item, type }: ChangeItemProps): JSX.Element {
    return (
        <div className="vx-fa-item">
            {type === 'friend' ? (
                <AuthorIcon dev={{ username: item.username, discord: item.id }} isLast={true} />
            ) : (
                item.icon ? <img src={uri(item)} alt={item.name} className="vx-fa-item-icon"/> : <span>{item.acronym}</span>
            )}
            <span className="vx-fa-item-name">{type === 'friend' ? (item.globalName || item.username) : item.name}</span>
        </div>
    );
}

interface ChangeSectionProps {
    title: string;
    items: any[];
    type: string;
}

function ChangeSection({ title, items, type }: ChangeSectionProps): JSX.Element | null {
    if (items.length === 0) return null;
    return (
        <div className="vx-fa-section">
            <h3 className="vx-fa-section-title">{title} - {items.length}</h3>
            {items.map(item => (
                <ChangeItem key={item.id} item={item} type={type} />
            ))}
        </div>
    );
}

interface LostItemsModalProps {
    props: any;
}

function LostItemsModal({ props }: LostItemsModalProps): JSX.Element {
    const [friendChanges, setFriendChanges] = useState<ChangeData>({ lost: [], gained: [], hasChanges: false });
    const [guildChanges, setGuildChanges] = useState<ChangeData>({ lost: [], gained: [], hasChanges: false });

    useLayoutEffect(() => {
        const currentFriends: any[] = Object.entries(RelationshipStore.getRelationships())
            .filter(([, type]) => type === 1)
            .map(([id]) => ({ id, ...UserStore.getUser(id) }));
        const currentGuilds: any[] = Object.values(GuildStore.getGuilds()).map(guild => {
            const detailedGuild = GuildStore.getGuild(guild.id);
            return {
                id: detailedGuild.id,
                name: detailedGuild.name,
                getIconURL: () => detailedGuild.getIconURL() ?? void 0,
            };
        });

        const friendResults: ChangeData = compareAndUpdateData(currentFriends, "Friends");
        const guildResults: ChangeData = compareAndUpdateData(currentGuilds, "Guilds");

        setFriendChanges(friendResults);
        setGuildChanges(guildResults);
    }, []);

    const handleClearLogs = (): void => {
        UserStored.set('lostFriends', []);
        UserStored.set('gainedFriends', []);
        UserStored.set('lostGuilds', []);
        UserStored.set('gainedGuilds', []);
        setFriendChanges({ lost: [], gained: [], hasChanges: false });
        setGuildChanges({ lost: [], gained: [], hasChanges: false });
    };

    return (
        <ModalComponents.Root {...props}>
            <div className="vx-fa-modal">
                <div className="vx-fa-header">
                    <h2 className="vx-fa-title">Removal Alerts</h2>
                    <button className="vx-fa-clear-logs" onClick={handleClearLogs}>Clear Logs</button>
                </div>
                <div className="vx-fa-content">
                    {(guildChanges.lost.length > 0 || friendChanges.lost.length > 0) ? (
                        <>
                            <ChangeSection title="Guilds" items={guildChanges.lost} type="guild" />
                            <ChangeSection title="Friends" items={friendChanges.lost} type="friend" />
                        </>
                    ) : (
                        <p className="vx-fa-no-changes">No changes detected since last check.</p>
                    )}
                </div>
            </div>
        </ModalComponents.Root>
    );
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    async start(signal: AbortSignal): Promise<void> {
        await whenWebpackInit();
        HMBA.addItem("friendServerTracker", () => (
            <MenuComponents.Item
                label="Friend & Server Changes"
                id="vx-friend-server-tracker"
                icon={Icons.Globe}
                action={() => openModal((props) => <LostItemsModal props={props} />)}
            />
        ));
    }
});