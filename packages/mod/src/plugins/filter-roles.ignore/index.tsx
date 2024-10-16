import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { getLazy } from "@webpack";
import { findInTree } from "../../util";
import React, { Component } from "react";
import * as styler from "./index.css?managed";
import { ErrorBoundary, Popout } from "../../components";
import { MenuComponents } from "../../api/menu";
import { GuildStore, SelectedGuildStore } from "@webpack/common";

const inj = new Injector();
const ListThin = getLazy(x => x.ListThin);

class RoleBlacklist {
    private static instance: RoleBlacklist;
    private blacklistedRoleIds: string[];
    private observers: (() => void)[];

    private constructor() {
        this.blacklistedRoleIds = [];
        this.observers = [];
    }

    public static getInstance(): RoleBlacklist {
        if (!RoleBlacklist.instance) {
            RoleBlacklist.instance = new RoleBlacklist();
        }
        return RoleBlacklist.instance;
    }

    public addRole(roleId: string): void {
        if (!this.blacklistedRoleIds.includes(roleId)) {
            this.blacklistedRoleIds.push(roleId);
            this.notifyObservers(); // Notify observers when a role is added
        }
    }

    public removeRole(roleId: string): void {
        this.blacklistedRoleIds = this.blacklistedRoleIds.filter(id => id !== roleId);
        this.notifyObservers(); // Notify observers when a role is removed
    }

    public toggleRole(roleId: string): void {
        if (this.isRoleBlacklisted(roleId)) {
            this.removeRole(roleId);
        } else {
            this.addRole(roleId);
        }
    }

    public isRoleBlacklisted(roleId: string): boolean {
        return this.blacklistedRoleIds.includes(roleId);
    }

    public getBlacklistedRoles(): string[] {
        return [...this.blacklistedRoleIds];
    }

    public subscribe(callback: () => void): void {
        this.observers.push(callback);
    }

    private notifyObservers(): void {
        this.observers.forEach(callback => callback());
    }
}

const PlusIcon: React.FC = () => (
    <svg className="-vx-fr-plus-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CircularButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <div className="-vx-fr-button-container">
        <button className="-vx-fr-circular-button" onClick={onClick}>
            <PlusIcon />
        </button>
    </div>
);

function getRoleInfo(user: { props: { title: any; children: { props: { title: any; id: any; }; }; id: any; }; }) {
    return {
        title: user.props?.title || user.props?.children?.props?.title,
        id: user.props?.id || user.props?.children?.props?.id,
    };
}

function removeBlacklistedSections(usersTree: any[]) {
    const roleBlacklist = RoleBlacklist.getInstance().getBlacklistedRoles();
    let i = 0;

    while (i < usersTree.length) {
        const user = usersTree[i];

        // Check if the current item is a section
        if (user?.key?.startsWith("section-")) {
            const { title: roleTitle, id: roleId } = getRoleInfo(user);
            let sectionContainsBlacklistedRole = false;

            // Check if the role is blacklisted
            if ((roleTitle && roleBlacklist.includes(roleTitle)) || (roleId && roleBlacklist.includes(roleId))) {
                sectionContainsBlacklistedRole = true;
            }

            // Determine the end of the section
            let endIndex = i + 1;
            while (endIndex < usersTree.length && !usersTree[endIndex]?.key?.startsWith("section-")) {
                endIndex++;
            }

            // If the section is blacklisted, remove it entirely along with its users
            if (sectionContainsBlacklistedRole) {
                usersTree.splice(i, endIndex - i);
                continue; // Skip incrementing i, as we've just removed elements
            } else {
                // Remove users within this section that have blacklisted roles
                const usersInSection = usersTree.slice(i + 1, endIndex);
                const filteredUsers = usersInSection.filter(user => {
                    // Get the role ID from user props
                    const userRoleId = user?.props?.colorRoleId;

                    return !roleBlacklist.includes(userRoleId) && !roleBlacklist.includes(roleTitle);
                });

                // Update the section's children to only include non-blacklisted users
                usersTree.splice(i + 1, usersInSection.length, ...filteredUsers);
            }
        }

        i++; // Move to the next element
    }
}



interface ButtonWithPopoutState {
    showingPopout: boolean;
    query: string;
    roles: any[];
}

class ButtonWithPopout extends Component<{}, ButtonWithPopoutState> {
    private blacklist: RoleBlacklist;

    constructor(props: {}) {
        super(props);
        this.blacklist = RoleBlacklist.getInstance();
        this.state = {
            showingPopout: false,
            query: '',
            roles: Object.values(GuildStore.getRoles(SelectedGuildStore.getGuildId())),
        };
    }

    componentDidMount() {
        this.blacklist.subscribe(() => this.forceUpdate()); // Subscribe to changes
        this.updateRoles(); // Initial roles load
    }

    updateRoles = () => {
        const roles = Object.values(GuildStore.getRoles(SelectedGuildStore.getGuildId()));
        this.setState({ roles });
    };

    togglePopout = () => {
        this.setState(prevState => ({ showingPopout: !prevState.showingPopout }));
    };

    closePopout = () => {
        this.setState({ showingPopout: false });
    };

    handleQueryChange = (event: any) => {
        this.setState({ query: event });
    };

    toggleRoleInBlacklist = (role: { id: string }) => {
        this.blacklist.toggleRole(role.id);
        this.forceUpdate();
    };

    getFilteredRoles = () => {
        const { roles, query } = this.state;
        return roles.filter(role =>
            role.name.toLowerCase().includes(query.toLowerCase())
        );
    };

    render() {
        const { showingPopout, query } = this.state;
        const filteredRoles = this.getFilteredRoles();

        return (
            <ErrorBoundary>
                <Popout
                    shouldShow={showingPopout}
                    onRequestClose={this.closePopout}
                    position="left"
                    renderPopout={() => (
                        <MenuComponents.Menu>
                            <MenuComponents.MenuControlItem>
                                <MenuComponents.MenuSearchControl
                                    query={query}
                                    onChange={this.handleQueryChange}
                                    placeholder="Search roles..."
                                />
                            </MenuComponents.MenuControlItem>
                            <MenuComponents.MenuGroup>
                                {filteredRoles.map(role => (
                                    <MenuComponents.MenuCheckboxItem
                                        key={role.id}
                                        label={role.name}
                                        id={role.id}
                                        checked={this.blacklist.isRoleBlacklisted(role.id)}
                                        action={() => this.toggleRoleInBlacklist(role)}
                                    />
                                ))}
                            </MenuComponents.MenuGroup>
                        </MenuComponents.Menu>
                    )}
                >
                    {() => (
                        <CircularButton onClick={this.togglePopout} />
                    )}
                </Popout>
            </ErrorBoundary>
        );
    }
}

function insertButton(usersTree: any[]) {
    usersTree.splice(0, 0, <ButtonWithPopout key="vx-fr-add-button" />);
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    async start(signal: AbortSignal) {
        const module = await ListThin;
        inj.after(module.ListThin, "render", (_instance, _args, res: any) => {
            const ArrayOfUsers = findInTree(res, x => x?.containerRef, { walkable: ['props', 'children'] });

            if (ArrayOfUsers && ArrayOfUsers?.children) {
                insertButton(ArrayOfUsers.children);
                removeBlacklistedSections(ArrayOfUsers.children);
            }
        });
    },
    stop() {
        inj.unpatchAll();
    }
});
