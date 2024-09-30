import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { bySource, getLazy, getModule, getProxy } from "@webpack";
import { Injector } from "../../patcher";
import { ErrorBoundary, Icons, Tooltip } from "../../components";
import { NavigationUtils } from "@webpack/common";
import React, { useState, useEffect } from "../../fake_node_modules/react";
import * as styler from "./index.css?managed";
import {ModalComponents, openAlertModal, openModal} from "../../api/modals";
import { clipboard } from "../../util";
import {MenuComponents, openMenu, closeMenu} from "../../api/menu";

const sidebar = getLazy(bySource("hasReportedAnalytics"));
const LinkButton = getProxy((m) => m.prototype?.render?.toString().includes(".linkButtonIcon"), { searchExports: true });
const Button = getProxy(x => x.Button);
const i = new Injector();
const FriendInviteStore = getProxy(x => x.createFriendInvite);

const fetchFriendInvites = async () => {
    return FriendInviteStore.getAllFriendInvites();
};

function InviteCard({ invite }) {
    const expiresDate = new Date(invite.expires_at);
    const avatarUrl = `https://cdn.discordapp.com/avatars/${invite.inviter.id}/${invite.inviter.avatar}.png`;

    return (
        <Tooltip text={"Click to copy"}>
            {(props) => (
                <div className="vx-friend-invites-card" {...props} 
                     onClick={() => {
                         clipboard.copy(`discord.gg/${invite.code}`);
                    }}
                    onContextMenu={(event) => {
                       /*
                        openMenu(event, (props) => (
                            <MenuComponents.Menu navId="vx-friend-invites-menu" onClose={closeMenu} {...props}>
                                <MenuComponents.MenuGroup>
                                    <MenuComponents.MenuItem id={"friend-codes"} label={"Delete Code"} action={() => {
                                        //FriendInviteStore.revokeFriendInvite(invite.code)
                                        openAlertModal(<div>discord moment</div>, <div>Discord thought it was smart </div>)
                                    }}/>
                                </MenuComponents.MenuGroup>
                            </MenuComponents.Menu>
                        ))
                        */
                    }}>
                    <div className="vx-friend-invites-header">
                        <img src={avatarUrl} alt={invite.inviter.username} className="vx-friend-invites-avatar" />
                        <div className="vx-friend-invites-code-container">
                            <div className="vx-friend-invites-code">{invite.code}</div>
                            <div className="vx-friend-invites-expiry">Expires: {expiresDate.toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div className="vx-friend-invites-details">
                        <p>Inviter: {invite.inviter.global_name} ({invite.inviter.username})</p>
                        <p>Uses: {invite.uses}/{invite.max_uses || "∞"}</p>
                        <p>Max Age: {invite.max_age ? `${invite.max_age / 86400} days` : "Never"}</p>
                        <p>Created: {new Date(invite.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </Tooltip>
    );
}

function FriendInvitesModal({ props }) {
    const [invites, setInvites] = useState([]);

    useEffect(() => {
        fetchFriendInvites().then(setInvites);
    }, []);

    const handleCreateInvite = async () => {
        await FriendInviteStore.createFriendInvite();
        fetchFriendInvites().then(setInvites);
    };

    const handleRevokeInvite = async () => {
        await FriendInviteStore.revokeFriendInvites();
        fetchFriendInvites().then(setInvites);
    };

    return (
        <ModalComponents.ModalRoot {...props} size={ModalComponents.ModalSize.DYNAMIC}>
            <ModalComponents.ModalHeader>
                <h2 style={{ color: "white" }} className="vx-friend-invites-modal-header">Friend Invites</h2>
            </ModalComponents.ModalHeader>
            <ModalComponents.ModalContent>
                <div className="vx-friend-invites-container">
                    {invites.length > 0 ? (
                        <div className="vx-friend-invites-grid">
                            {invites.map((invite) => (
                                <InviteCard key={invite.code} invite={invite}/>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <img src="https://discord.com/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg"
                                 alt="No invites"/>
                        </div>
                    )}
                </div>


                <div className="vx-friend-invites-buttons"
                     style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
                    <Button.Button
                        onClick={handleCreateInvite}
                        style={{backgroundColor: '#007bff', color: 'white', marginRight: '8px'}}
                    >
                        Create Invite
                    </Button.Button>
                    <Button.Button
                        onClick={handleRevokeInvite}
                        style={{backgroundColor: '#dc3545', color: 'white'}}
                    >
                        Revoke All Invites
                    </Button.Button>
                </div>
            </ModalComponents.ModalContent>
        </ModalComponents.ModalRoot>
    );
}

function NavigatorButton() {
    return (
        <ErrorBoundary
            fallback={(
                <div onClick={() => NavigationUtils.transitionTo("/")}>Public Servers</div>
            )}
        >
            <LinkButton
                icon={Icons.Discord}
                text="Friend Invites"
                onClick={() => {
                    openModal((props) => (
                        <FriendInvitesModal props={props} />
                    ));
                }}
            />
        </ErrorBoundary>
    );
}

export default definePlugin(
    {
        authors: [Developers.kaan],
        requiresRestart: false,
        async start(signal: AbortSignal) {
            const uwu = await sidebar;
            i.after(uwu, "Z", (that, args, res: any) => {
                if (args[0]?.children.find((button?: { key: string }) => button?.key === "uwu_linkButton")) return;

                args[0]?.children.push(
                    <NavigatorButton key="uwu_linkButton" />
                );
            });
        },
        styler
    },
);
