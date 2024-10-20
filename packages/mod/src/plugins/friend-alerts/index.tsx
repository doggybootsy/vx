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

function removeDuplicatesById(arr: any[]) {
    const seen = new Set();
    return arr.filter(item => {
        const duplicate = seen.has(item.id);
        seen.add(item.id);
        return !duplicate;
    });
}

function compareAndUpdateData(currentData: any[], type: string): ChangeData {
    const storedData: any[] = UserStored.get(`stored${type}`) || [];
    const currentIds: Set<string> = new Set(currentData.map(item => item.id));
    const storedIds: Set<string> = new Set(storedData.map(item => item.id));

    let lostItems: any[] = UserStored.get(`lost${type}`) || [];
    let gainedItems: any[] = UserStored.get(`gained${type}`) || [];

    const newLost: any[] = storedData.filter(item => !currentIds.has(item.id));
    const newGained: any[] = currentData.filter(item => !storedIds.has(item.id));

    lostItems = removeDuplicatesById([
        ...lostItems.filter(item => !currentIds.has(item.id)),
        ...newLost.map(item => ({ ...item, date: new Date().toISOString() }))
    ]);

    gainedItems = removeDuplicatesById([
        ...gainedItems.filter(item => currentIds.has(item.id)),
        ...newGained.map(item => ({ ...item, date: new Date().toISOString() }))
    ]);

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
    const formattedDate = item.date ? new Date(item.date).toLocaleString() : 'Unknown';
    return (
        <div className="vx-fa-item">
            {type === 'friend' ? (
                <AuthorIcon dev={{ username: item.username, discord: item.id }} isLast={true} />
            ) : (
                item.icon ? <img src={uri(item)} alt={item.name} className="vx-fa-item-icon"/> : <span>{item.acronym}</span>
            )}
            <span className="vx-fa-item-name">
                {type === 'friend' ? (item.globalName || item.username) : item.name}
                <span className="vx-fa-item-date"> - {formattedDate}</span>
            </span>
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
    const [activeTab, setActiveTab] = useState('friends');
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

    /*
        <h3 className="vx-fa-section-title">Gained Friends - {friendChanges.gained.length}</h3>
        <ChangeSection title={"Friends Gained"} items={friendChanges.gained} type="friend" />
        
        <h3 className="vx-fa-section-title">Joined Servers - {guildChanges.gained.length}</h3>
        <ChangeSection title={"Guilds Gained"} items={guildChanges.gained} type="guild" />
     */
    return (
        <ModalComponents.Root {...props}>
            <div className="vx-fa-modal">
                <div className="vx-fa-header">
                    <h2 className="vx-fa-title">Friend & Server Changes</h2>
                    <button className="vx-fa-clear-logs" onClick={handleClearLogs}>Clear Logs</button>
                </div>
                <div className="vx-fa-tabs">
                    <button
                        className={`vx-fa-tab ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        Friends
                    </button>
                    <button
                        className={`vx-fa-tab ${activeTab === 'servers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('servers')}
                    >
                        Servers
                    </button>
                </div>
                <div className="vx-fa-content">
                    {activeTab === 'friends' && (
                        <div className="vx-fa-tab-content">
                            <ChangeSection title={"Friends Lost"} items={friendChanges.lost} type="friend" />
                        </div>
                    )}
                    {activeTab === 'servers' && (
                        <div className="vx-fa-tab-content">
                            <ChangeSection title={"Guilds Lost"} items={guildChanges.lost} type="guild" />
                        </div>
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
    },
    fluxEvents: {
        "RELATIONSHIP_REMOVE": data => {
            const relationshipData = data.relationship;
            if (relationshipData.type !== 1) return;
            const user = UserStore.getUser(relationshipData.id);
            if (user) {
                const lostFriends = UserStored.get('lostFriends') || [];

                const alreadyLost = lostFriends.some(friend => friend.id === user.id);
                if (!alreadyLost) {
                    const updatedLostFriends = [{ ...user, date: new Date().toISOString() }, ...lostFriends];
                    UserStored.set('lostFriends', updatedLostFriends);
                }
            }
        },
        "RELATIONSHIP_ADD": data => {
            const relationshipData = data.relationship;
            if (relationshipData.type !== 1) return;
            const user = UserStore.getUser(relationshipData.id);
            if (user) {
                const gainedFriends = UserStored.get('gainedFriends') || [];

                const alreadyGained = gainedFriends.some(friend => friend.id === user.id);
                if (!alreadyGained) {
                    const updatedGainedFriends = [{ ...user, date: new Date().toISOString() }, ...gainedFriends];
                    UserStored.set('gainedFriends', updatedGainedFriends);
                }
            }
        },
        "GUILD_CREATE": guild => {
            const gainedGuilds = UserStored.get('gainedGuilds') || [];

            const alreadyGained = gainedGuilds.some(existingGuild => existingGuild.id === guild.id);
            if (!alreadyGained) {
                const updatedGainedGuilds = [{ ...guild, date: new Date().toISOString() }, ...gainedGuilds];
                UserStored.set('gainedGuilds', updatedGainedGuilds);
            }
        },
        "GUILD_DELETE": guild => {
            const lostGuilds = UserStored.get('lostGuilds') || [];

            const alreadyLost = lostGuilds.some(existingGuild => existingGuild.id === guild.id);
            if (!alreadyLost) {
                const updatedLostGuilds = [{ ...guild, date: new Date().toISOString() }, ...lostGuilds];
                UserStored.set('lostGuilds', updatedLostGuilds);
            }
        }
    }
});