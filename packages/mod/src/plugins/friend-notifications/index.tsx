import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import {FluxDispatcher, GuildStore, RelationshipStore, TextAreaInput, UserStore} from "@webpack/common";
import { getLazy, getModule, getProxy, getProxyStore, whenWebpackInit } from "@webpack";
import { User } from "discord-types/general";
import { AuthorIcon } from "../../dashboard/pages/addons/plugins/card";
import { DataStore } from "../../api/storage";
import { MenuComponents } from "../../api/menu";
import { ModalComponents, openModal } from "../../api/modals";
import { Icons, SystemDesign } from "../../components";
import { HMBA } from "../../api/quick-actions/hmba";
import {useState, useCallback, useMemo, useRef, useEffect} from "react";
import * as styler from "./index.css?managed";

const openPrivateChannel: { openPrivateChannel: (userId: string) => void } = getProxy(x => x.openPrivateChannel);
const UserProfileStore = getProxyStore("UserProfileStore");

interface GlobalUser extends User {
    globalName?: string;
}

interface StatusChange {
    userId: string;
    username: string;
    discriminator?: string;
    avatarUrl?: string;
    oldStatus: string;
    newStatus: string;
    date: string;
    gameChange?: {
        type: 'started' | 'stopped';
        game: string;
        duration?: number;
    };
}

interface UserHistory {
    userId: string;
    username: string;
    changes: StatusChange[];
}

const pluginName: string = "StatusAlerts";
const UserStored: DataStore = new DataStore(pluginName);

function getColorFromStatus(status: string): string {
    switch (status.toLowerCase()) {
        case "online": return "rgb(35, 165, 90)";
        case "offline": return "rgb(128, 132, 142)";
        case "dnd": return "rgb(242, 63, 67)";
        case "idle": return "rgb(240, 178, 50)";
        default: return "gray";
    }
}

interface StatusDotProps {
    status: string;
    size?: number;
}

function StatusDot({ status, size = 12 }: StatusDotProps): JSX.Element {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: getColorFromStatus(status),
                display: 'inline-block',
                marginRight: '4px',
                verticalAlign: 'middle'
            }}
        />
    );
}

interface UserHistoryDropdownProps {
    history: StatusChange[];
    username: string;
}

function UserHistoryDropdown({ history, username }: UserHistoryDropdownProps): JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }, []);

    return (
        <div className="vx-fn-history-dropdown" ref={dropdownRef}>
            <div
                className="vx-fn-dropdown-header"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                <Icons.Plus size={16} style={{ transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            {isOpen && (
                <div className="vx-fn-dropdown-content">
                    <h4>{username}'s History</h4>
                    {history.map((change, index) => (
                        <div key={index} className="vx-fn-history-item">
                            <div className="vx-fn-history-time">
                                {new Date(change.date).toLocaleString()}
                            </div>
                            {change.gameChange ? (
                                <div className="vx-fn-game-change">
                                    {change.gameChange.type === 'started' ? '▶️' : '⏹️'} {change.gameChange.game}
                                    {change.gameChange.duration && (
                                        <span className="vx-fn-game-duration">
                                            ({Math.round(change.gameChange.duration / 60000)}min)
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="vx-fn-status-change">
                                    <StatusDot status={change.oldStatus} size={10} />
                                    →
                                    <StatusDot status={change.newStatus} size={10} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

interface StatusChangeItemProps {
    change: StatusChange;
    userHistory: StatusChange[];
}

function StatusChangeItem({ change, userHistory }: StatusChangeItemProps): JSX.Element {
    const formattedDate = change.date ? new Date(change.date).toLocaleString() : 'Unknown';

    return (
        <div className="vx-fn-item">
            <div className="vx-fn-item-avatar">
                {change.avatarUrl ? (
                    <img src={change.avatarUrl} alt={change.username} className="vx-fn-avatar" />
                ) : (
                    <AuthorIcon
                        dev={{ username: change.username, discord: change.userId }}
                        isLast={true}
                    />
                )}
            </div>
            <span className="vx-fn-item-name">
                {change.username}
                {change.discriminator && <span className="vx-fn-discriminator">#{change.discriminator}</span>}
                {!change.gameChange && (
                    <span className="vx-fn-item-status">
                        <StatusDot status={change.oldStatus} />
                        →
                        <StatusDot status={change.newStatus} />
                    </span>
                )}
                {change.gameChange && (
                    <span className="vx-fn-item-game">
                        {change.gameChange.type === 'started' ? '▶️' : '⏹️'} {change.gameChange.game}
                    </span>
                )}
                <span className="vx-fn-item-date"> - {formattedDate}</span>
            </span>
            <div className="vx-fn-item-actions">
                <UserHistoryDropdown
                    history={userHistory}
                    username={change.username}
                />
                <span
                    className="vx-fn-item-dm"
                    onClick={() => openPrivateChannel.openPrivateChannel(change.userId)}
                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                >
                    <Icons.Plus size={16} />
                </span>
            </div>
        </div>
    );
}

interface StatusModalProps {
    props: any;
    user?: User;
}

function ProfileChangeItem({ change }: { change: StatusChange }): JSX.Element {
    const formattedDate = change.date ? new Date(change.date).toLocaleString() : 'Unknown';
    const profileChange = change.profileChange!;

    return (
        <div className="vx-fn-item">
            <div className="vx-fn-item-avatar">
                {change.avatarUrl ? (
                    <img src={change.avatarUrl} alt={change.username} className="vx-fn-avatar" />
                ) : (
                    <AuthorIcon
                        dev={{ username: change.username, discord: change.userId }}
                        isLast={true}
                    />
                )}
            </div>
            <span className="vx-fn-item-name">
                {change.username}
                {change.discriminator && <span className="vx-fn-discriminator">#{change.discriminator}</span>}
                <span className="vx-fn-profile-change">
                    Changed {profileChange.type}:
                    <span className="vx-fn-old-value">{profileChange.oldValue || '[empty]'}</span>
                    →
                    <span className="vx-fn-new-value">{profileChange.newValue || '[empty]'}</span>
                </span>
                <span className="vx-fn-item-date"> - {formattedDate}</span>
            </span>
        </div>
    );
}

function StatusModal({ props, user }: StatusModalProps): JSX.Element {
    const [activeTab, setActiveTab] = useState<'status' | 'games' | 'profile'>('status');
    const [changes, setChanges] = useState<StatusChange[]>(UserStored.get('statusChanges') || []);
    const [visibleStatusChanges, setVisibleStatusChanges] = useState<StatusChange[]>([]);
    const [visibleGameChanges, setVisibleGameChanges] = useState<StatusChange[]>([]);
    const [filterUser, setFilterUser] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [timeRange, setTimeRange] = useState<number>(0);
    const listRef = useRef<HTMLDivElement>(null);
    const [visibleProfileChanges, setVisibleProfileChanges] = useState<StatusChange[]>([]);

    const ITEMS_INCREMENT = 20;

    useEffect(() => {
        if (user) {
            setFilterUser(user.globalName || user.username);
        }
    }, [user]);

    const filteredChanges = useMemo(() => {
        let filtered = changes;

        if (filterUser) {
            filtered = filtered.filter(change =>
                change.username.toLowerCase().includes(filterUser.toLowerCase())
            );
        }

        if (timeRange > 0) {
            const cutoff = Date.now() - (timeRange * 60 * 60 * 1000);
            filtered = filtered.filter(change =>
                new Date(change.date).getTime() > cutoff
            );
        }

        const statusChanges = filtered.filter(change => !change.gameChange && !change.profileChange);
        const gameChanges = filtered.filter(change => change.gameChange);
        const profileChanges = filtered.filter(change => change.profileChange);

        const sorter = (a: StatusChange, b: StatusChange) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        };

        return {
            statusChanges: statusChanges.sort(sorter),
            gameChanges: gameChanges.sort(sorter),
            profileChanges: profileChanges.sort(sorter)
        };
    }, [changes, filterUser, timeRange, sortOrder]);

    useEffect(() => {
        let currentChanges;
        switch (activeTab) {
            case 'status':
                currentChanges = filteredChanges.statusChanges;
                setVisibleStatusChanges(currentChanges.slice(0, ITEMS_INCREMENT));
                break;
            case 'games':
                currentChanges = filteredChanges.gameChanges;
                setVisibleGameChanges(currentChanges.slice(0, ITEMS_INCREMENT));
                break;
            case 'profile':
                currentChanges = filteredChanges.profileChanges;
                setVisibleProfileChanges(currentChanges.slice(0, ITEMS_INCREMENT));
                break;
        }
    }, [activeTab, filteredChanges]);

    useEffect(() => {
        const handleScroll = () => {
            if (listRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = listRef.current;
                if (scrollHeight - scrollTop <= clientHeight * 1.5) {
                    switch (activeTab) {
                        case 'status':
                            setVisibleStatusChanges(prev => [
                                ...prev,
                                ...filteredChanges.statusChanges.slice(prev.length, prev.length + ITEMS_INCREMENT)
                            ]);
                            break;
                        case 'games':
                            setVisibleGameChanges(prev => [
                                ...prev,
                                ...filteredChanges.gameChanges.slice(prev.length, prev.length + ITEMS_INCREMENT)
                            ]);
                            break;
                        case 'profile':
                            setVisibleProfileChanges(prev => [
                                ...prev,
                                ...filteredChanges.profileChanges.slice(prev.length, prev.length + ITEMS_INCREMENT)
                            ]);
                            break;
                    }
                }
            }
        };

        const ref = listRef.current;
        if (ref) ref.addEventListener("scroll", handleScroll);

        return () => {
            if (ref) ref.removeEventListener("scroll", handleScroll);
        };
    }, [activeTab, filteredChanges]);

    const handleClearLogs = useCallback((): void => {
        UserStored.set('statusChanges', []);
        setChanges([]);
        setVisibleStatusChanges([]);
        setVisibleGameChanges([]);
    }, []);

    return (
        <ModalComponents.Root {...props}>
            <div className="vx-fn-modal">
                <div className="vx-fn-header">
                    <h2 className="vx-fn-title">Friend Activity Tracker</h2>
                    <div className="vx-fn-controls">
                        <SystemDesign.TextInput
                            placeholder="Filter by username..."
                            value={filterUser}
                            onChange={(e: React.SetStateAction<string>) => setFilterUser(e)}
                        />
                        <SystemDesign.SearchableSelect
                            value={timeRange}
                            onChange={(e) => setTimeRange(e)}
                            options={[
                                {label: "All Time", value: 0},
                                {label: "Last 24 hours", value: 24},
                                {label: "Last 3 days", value: 72},
                                {label: "Last Week", value: 168}
                            ]}
                        />
                        <button
                            className="vx-fn-sort"
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                        <button className="vx-fn-clear-logs" onClick={handleClearLogs}>
                            Clear Logs
                        </button>
                    </div>
                </div>
                <div className="vx-fn-tabs">
                    <button
                        className={`vx-fn-tab ${activeTab === 'status' ? 'active' : ''}`}
                        onClick={() => setActiveTab('status')}
                    >
                        Status Changes
                    </button>
                    <button
                        className={`vx-fn-tab ${activeTab === 'games' ? 'active' : ''}`}
                        onClick={() => setActiveTab('games')}
                    >
                        Game Activity
                    </button>
                    <button
                        className={`vx-fn-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Changes
                    </button>
                </div>
                <div className="vx-fn-content" ref={listRef} style={{overflowY: "auto", maxHeight: "400px"}}>
                    {(() => {
                        switch (activeTab) {
                            case 'status':
                                return visibleStatusChanges.length > 0 ? (
                                    visibleStatusChanges.map((change, index) => (
                                        <StatusChangeItem
                                            key={index}
                                            change={change}
                                            userHistory={filteredChanges.statusChanges}
                                        />
                                    ))
                                ) : (
                                    <div className="vx-fn-empty">No status changes recorded yet</div>
                                );

                            case 'games':
                                return visibleGameChanges.length > 0 ? (
                                    visibleGameChanges.map((change, index) => (
                                        <StatusChangeItem
                                            key={index}
                                            change={change}
                                            userHistory={filteredChanges.gameChanges}
                                        />
                                    ))
                                ) : (
                                    <div className="vx-fn-empty">No game activity recorded yet</div>
                                );

                            case 'profile':
                                return visibleProfileChanges.length > 0 ? (
                                    visibleProfileChanges.map((change, index) => (
                                        <ProfileChangeItem
                                            key={index}
                                            change={change}
                                        />
                                    ))
                                ) : (
                                    <div className="vx-fn-empty">No profile changes recorded yet</div>
                                );

                            default:
                                return <div className="vx-fn-empty">Invalid tab selected</div>;
                        }
                    })()}
                </div>
            </div>
        </ModalComponents.Root>
    );
}

class GlobalUserStatusTracker {
    private userStatuses: Map<string, any> = new Map();
    private userProfiles: Map<string, GlobalUser> = new Map();
    private gameStartTimes: Map<string, Map<string, number>> = new Map();
    private newChangesCount: number = 0;

    private addStatusChange(change: StatusChange) {
        const changes = UserStored.get('statusChanges') || [];
        const updatedChanges = [change, ...changes].slice(0, 10000);
        UserStored.set('statusChanges', updatedChanges);
    }

    private incrementNewChanges() {
        this.newChangesCount++;
        UserStored.set('newChangesCount', this.newChangesCount);
    }

    updateGlobalUserStatus(update: any) {
        const userId = update?.user?.id;
        if (!RelationshipStore.isFriend(userId)) return;
        if (!userId) return;

        const user: GlobalUser = UserStore.getUser(userId);
        const userProfile = UserProfileStore.getUserProfile(userId)

        const combinedUserData = Object.assign(
            {},
            userProfile,
            user
        );


        const oldProfile = this.userProfiles.get(userId);
        const oldStatus = this.userStatuses.get(userId);

        this.userStatuses.set(userId, update);
        this.userProfiles.set(userId, user);

        if (oldProfile) {
            this.checkProfileChanges(oldProfile, combinedUserData);
        }
        if (oldStatus) {
            this.checkForChanges(oldStatus, update, user);
        }
    }

    public resetNewChanges() {
        this.newChangesCount = 0;
        UserStored.set('newChangesCount', 0);
    }

    private checkProfileChanges(oldProfile: GlobalUser, newProfile: GlobalUser) {
        const changes: ProfileChange[] = [];

        if (oldProfile.username !== newProfile.username) {
            changes.push({
                type: 'username',
                oldValue: oldProfile.username,
                newValue: newProfile.username
            });
        }

        if (oldProfile.bio !== newProfile.bio) {
            changes.push({
                type: 'bio',
                oldValue: oldProfile.bio || '',
                newValue: newProfile.bio || ''
            });
        }

        if (oldProfile.pronouns !== newProfile.pronouns) {
            changes.push({
                type: 'pronouns',
                oldValue: oldProfile.pronouns || '',
                newValue: newProfile.pronouns || ''
            });
        }

        if (oldProfile.avatar !== newProfile.avatar) {
            changes.push({
                type: 'avatar',
                oldValue: oldProfile.avatar || '',
                newValue: newProfile.avatar || ''
            });
        }

        changes.forEach(change => {
            this.addStatusChange({
                userId: newProfile.id,
                username: newProfile.globalName || newProfile.username,
                discriminator: newProfile.discriminator,
                avatarUrl: newProfile.avatar,
                date: new Date().toISOString(),
                profileChange: change
            });
        });

        if (changes.length > 0) {
            this.incrementNewChanges();
        }
    }
    
    private checkForChanges(oldStatus: any, newStatus: any, user: GlobalUser) {
        if (oldStatus.status !== newStatus.status) {
            this.addStatusChange({
                userId: user.id,
                username: user.globalName || user.username,
                oldStatus: oldStatus.status,
                newStatus: newStatus.status,
                date: new Date().toISOString()
            });
        }

        const oldActivities = oldStatus.activities || [];
        const newActivities = newStatus.activities || [];
        this.checkActivityChanges(user, oldActivities, newActivities);
    }

    private checkActivityChanges(user: GlobalUser, oldActivities: any[], newActivities: any[]) {
        const oldGames = oldActivities.filter((a) => a.type === 0).map((a) => a.name);
        const newGames = newActivities.filter((a) => a.type === 0).map((a) => a.name);

        const userGameTimes = this.gameStartTimes.get(user.id) || new Map();

        
        newGames.filter((game) => !oldGames.includes(game)).forEach((game) => {
            userGameTimes.set(game, Date.now());
            this.addStatusChange({
                userId: user.id,
                username: user.globalName || user.username,
                oldStatus: '',
                newStatus: '',
                date: new Date().toISOString(),
                gameChange: {
                    type: 'started',
                    game
                }
            });
        });

        
        oldGames.filter((game) => !newGames.includes(game)).forEach((game) => {
            const startTime = userGameTimes.get(game);
            const duration = startTime ? Date.now() - startTime : undefined;
            userGameTimes.delete(game);

            this.addStatusChange({
                userId: user.id,
                username: user.globalName || user.username,
                oldStatus: '',
                newStatus: '',
                date: new Date().toISOString(),
                gameChange: {
                    type: 'stopped',
                    game,
                    duration
                }
            });
        });

        this.gameStartTimes.set(user.id, userGameTimes);
        this.incrementNewChanges();
    }

    public getNewChangesCount(): number {
        return this.newChangesCount;
    }

}

const userTracker = new GlobalUserStatusTracker();


function StatusCounter({ count }: { count: number }): JSX.Element | null {
    if (count === 0) return null;

    return (
        <div style={{
            backgroundColor: "rgb(237, 66, 69)",
            color: "white",
            borderRadius: "8px",
            padding: "0 6px",
            fontSize: "12px",
            fontWeight: "bold",
            marginLeft: "4px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "18px"
        }}>
            {count > 99 ? "99+" : count}
        </div>
    );
}

function AlertNode()
{
    return <StatusCounter count={userTracker.getNewChangesCount()} />
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    async start(signal: AbortSignal): Promise<void> {
        await whenWebpackInit();
        userTracker.resetNewChanges();

        HMBA.addItem("statusTracker", () => (
            <MenuComponents.Item
                label={"Friend Activity Log"}
                id="vx-status-tracker"
                icon={AlertNode}
                action={() => openModal((props) => <StatusModal props={props} />)}
            />
        ));
    },
    menus:
        {
          "user-context": (args, res) => {
              const user = args.user
              try {
                  res.props.children[0].props.children.push(
                      <MenuComponents.MenuItem
                          label="Open Changes"
                          id="open-user-changes-fn"
                          action={() => openModal((props) => <StatusModal props={props} user={user} />)}
                      />
                  )
              }
              catch (err) {
                  res.props.children.push(
                      <MenuComponents.MenuItem
                          label="Open Changes"
                          id="open-user-changes-fn"
                          action={() => openModal((props) => <StatusModal props={props} user={user} />)}
                      />
                  )
              }
          }  
        },
    fluxEvents: {
        PRESENCE_UPDATES(event) {
            if (event.updates) {
                event.updates.forEach((update: any) => {
                    userTracker.updateGlobalUserStatus(update);
                });
            }
        }
    }
});