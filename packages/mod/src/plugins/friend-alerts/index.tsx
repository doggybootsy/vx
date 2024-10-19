import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import HBCM from "../../api/quick-actions/hmba";
import { MenuComponents, } from "../../api/menu";
import {getProxyStore, whenWebpackInit} from "@webpack";
import { Icons } from "../../components";
import {DataStore} from "../../api/storage";
import {ModalComponents, openModal} from "../../api/modals";
import {AuthorIcon} from "../../dashboard/pages/addons/plugins/card";
import * as styler from "./index.css?managed";
import {useEffect, useState} from "react";
import {Guild} from "discord-types/general";

const pluginName = "FriendServerTracker";
const UserStored = new DataStore(pluginName);

const RelationshipStore = getProxyStore("RelationshipStore");
const UserStore = getProxyStore("UserStore");
const GuildStore = getProxyStore("GuildStore");

const uri = (guild: Guild) => `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=1280`

function compareAndUpdateData(currentData, type) {
    const storedData = UserStored.get(`stored${type}`) || [];
    const currentIds = new Set(currentData.map(item => item.id));
    const storedIds = new Set(storedData.map(item => item.id));

    let lostItems = UserStored.get(`lost${type}`) || [];
    let gainedItems = UserStored.get(`gained${type}`) || [];

    const newLost = storedData.filter(item => !currentIds.has(item.id));
    const newGained = currentData.filter(item => !storedIds.has(item.id));

    // Update lost items
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

    const hasChanges = newLost.length > 0 || newGained.length > 0;

    if (hasChanges) {
        UserStored.set(`lost${type}`, lostItems);
        UserStored.set(`gained${type}`, gainedItems);
        UserStored.set(`stored${type}`, currentData);
    }

    return { lost: lostItems, gained: gainedItems, hasChanges };
}

function ChangeItem({ item, type }) {
    return (
        <div className="vx-fr-item">
            {type === 'friend' ? (
                <AuthorIcon dev={{ username: item.username, discord: item.id }} isLast={true} />
            ) : (
                <img src={uri(item)} alt={item.name} className="vx-fr-item-icon" />
            )}
            <span className="vx-fr-item-name">{type === 'friend' ? (item.globalName || item.username) : item.name}</span>
        </div>
    );
}

function ChangeSection({ title, items, type }) {
    if (items.length === 0) return null;
    return (
        <div className="vx-fr-section">
            <h3 className="vx-fr-section-title">{title} - {items.length}</h3>
            {items.map(item => (
                <ChangeItem key={item.id} item={item} type={type} />
            ))}
        </div>
    );
}

function LostItemsModal({ props }) {
    const [friendChanges, setFriendChanges] = useState({ lost: [], gained: [], hasChanges: false });
    const [guildChanges, setGuildChanges] = useState({ lost: [], gained: [], hasChanges: false });

    useEffect(() => {
        const currentFriends = Object.entries(RelationshipStore.getRelationships())
            .filter(([, type]) => type === 1)
            .map(([id]) => ({ id, ...UserStore.getUser(id) }));
        const currentGuilds = Object.values(GuildStore.getGuilds()).map(guild => {
            const detailedGuild = GuildStore.getGuild(guild.id);
            return {
                id: detailedGuild.id,
                name: detailedGuild.name,
                getIconURL: () => detailedGuild.getIconURL(),
            };
        });

        const friendResults = compareAndUpdateData(currentFriends, "Friends");
        const guildResults = compareAndUpdateData(currentGuilds, "Guilds");

        setFriendChanges(friendResults);
        setGuildChanges(guildResults);
    }, []);

    const handleClearLogs = () => {
        UserStored.set('lostFriends', []);
        UserStored.set('gainedFriends', []);
        UserStored.set('lostGuilds', []);
        UserStored.set('gainedGuilds', []);
        setFriendChanges({ lost: [], gained: [], hasChanges: false });
        setGuildChanges({ lost: [], gained: [], hasChanges: false });
    };

    return (
        <ModalComponents.Root {...props}>
            <div className="vx-fr-modal">
                <div className="vx-fr-header">
                    <h2 className="vx-fr-title">Removal Alerts</h2>
                    <button className="vx-fr-clear-logs" onClick={handleClearLogs}>Clear Logs</button>
                </div>
                <div className="vx-fr-content">
                    {(guildChanges.lost.length > 0 || friendChanges.lost.length > 0) ? (
                        <>
                            <ChangeSection title="Guilds" items={guildChanges.lost} type="guild" />
                            <ChangeSection title="Friends" items={friendChanges.lost} type="friend" />
                        </>
                    ) : (
                        <p className="vx-fr-no-changes">No changes detected since last check.</p>
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
    async start(signal: AbortSignal) {
        await whenWebpackInit();
        HBCM.getAPI().addItem("friendServerTracker", () => (
            <MenuComponents.Item
                label="Friend & Server Changes"
                id="vx-friend-server-tracker"
                icon={Icons.Globe}
                action={() => openModal((props) => <LostItemsModal props={props} />)}
            />
        ));
    }
});