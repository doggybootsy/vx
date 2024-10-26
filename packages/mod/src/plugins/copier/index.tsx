import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { MenuComponents, patch, unpatch } from "../../api/menu";
import { openImageModal } from "../../api/modals";
import { createAbort } from "../../util";
import {getModule, getProxy, getProxyStore, getStore} from "@webpack";
import {useStateFromStores} from "@webpack/common";
import { Icons } from "../../components";

const avatarURL = "https://cdn.discordapp.com/avatars/{0}/{1}.png?size=1024&format=webp&quality=lossless&width=0&height=256";
const bannerURL = "https://cdn.discordapp.com/banners/{0}/{1}.png?size=1024&format=webp&quality=lossless&width=0&height=256";
const splashURL = "https://cdn.discordapp.com/splashes/{0}/{1}.png?size=1024&format=webp&quality=lossless&width=0&height=256";
const UserProfileStore = getProxyStore("UserProfileStore");
const copyModule = getProxy(x=>x.copyImage);

function format(template: string, ...args: any[]) {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== "undefined" ? args[index] : match;
    });
}

function getAnimated(uri: string): string
{
    return uri.includes("a_") ? uri.replace("png","gif") : uri;
}

function showBeDisabled(value: any): boolean {
    return value === undefined || value == null || value === "";
}

function isEitherDisabled(...args: any[]): boolean[] {
    return args.map(arg => showBeDisabled(arg));
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    icon: Icons.Copy,
    start() {
        patch("copierGuild", "guild-context", (props, res) => {
            const guild = props.guild;
            if (!guild) return;  // to fix right clicking folder stupidness cause right clicking a folder is for some reason a guild context menu
            const guildIconUri = guild.getIconSource().uri;
            const guildBanner = getAnimated(format(bannerURL, guild.id, guild.banner))
            const guildSplash = getAnimated(format(splashURL, guild.id, guild.splash));

            const [validIcon, validBanner, validSplash] = isEitherDisabled(guildIconUri, guild.banner, guild.splash);
            const [validDescription, validName] = isEitherDisabled(guild.description, guild.name);

            const iconMenuItems = [
                <MenuComponents.MenuItem
                    key={"copier-view-guild-icon"}
                    id={"copier-view-guild-icon"}
                    label={"View Guild Icon"}
                    action={async () => {
                        await openImageModal(guildIconUri);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-guild-icon"}
                    id={"copier-copy-guild-icon"}
                    label={"Copy Guild Icon"}
                    action={() => {
                        copyModule.copyImage(guildIconUri);
                    }}
                />,
            ];

            const splashMenuItems = [
                <MenuComponents.MenuItem
                    key={"copier-view-splash"}
                    id={"copier-view-splash"}
                    label={"View Splash"}
                    action={async () => {
                        await openImageModal(guildSplash);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-guild-icon"}
                    id={"copier-copy-guild-icon"}
                    label={"Copy Splash"}
                    action={() => {
                        copyModule.copyImage(guildSplash);
                    }}
                />,
            ];
            
            const bannerMenuItems = [
                <MenuComponents.MenuItem
                    key={"copier-view-guild-banner"}
                    id={"copier-view-guild-banner"}
                    label={"View Guild Banner"}
                    action={async () => {
                        await openImageModal(guildBanner);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-guild-banner"}
                    id={"copier-copy-guild-banner"}
                    label={"Copy Guild Banner"}
                    action={() => {

                        copyModule.copyImage(guildBanner);
                    }}
                />,
            ];

            const additionalCopyItems = [
                <MenuComponents.MenuItem
                    key={"copier-copy-guild-name"}
                    id={"copier-copy-guild-name"}
                    label={"Copy Guild Name"}
                    disabled={validName}
                    action={() => {

                        copyModule.copy(guild.name);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-guild-description"}
                    id={"copier-copy-guild-description"}
                    label={"Copy Description"}
                    disabled={validDescription}
                    action={() => {

                        copyModule.copy(guild.description);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-guild-owner"}
                    id={"copier-copy-guild-owner"}
                    label={"Copy Owner ID"}
                    action={() => {

                        copyModule.copy(guild.ownerId);
                    }}
                />,
            ];

            const checkboxItems = [
                <MenuComponents.MenuCheckboxItem
                    key={"copier-checkbox-premium-progress-bar"}
                    id={"copier-checkbox-premium-progress-bar"}
                    label={"Premium Progress Bar Enabled"}
                    checked={guild.premiumProgressBarEnabled}
                    disabled={true}
                />,
                <MenuComponents.MenuCheckboxItem
                    key={"copier-checkbox-verification-level"}
                    id={"copier-checkbox-verification-level"}
                    label={`Verification Level: ${guild.verificationLevel}`}
                    checked={true}
                    disabled={true}
                />,
                <MenuComponents.MenuCheckboxItem
                    key={"copier-checkbox-explicit-content-filter"}
                    id={"copier-checkbox-explicit-content-filter"}
                    label={`Content Filter: ${guild.explicitContentFilter}`}
                    checked={true}
                    disabled={true}
                />,
            ];

            res.props.children.push(
                <MenuComponents.MenuItem id={"copier-guild-menuGroup-1"} label={"More Guild Options"}>
                    <MenuComponents.MenuItem disabled={validIcon} id={"copier-guild-menuGroup-2"} label={"Guild Icon"}>
                        {iconMenuItems}
                    </MenuComponents.MenuItem>
                    <MenuComponents.MenuItem disabled={validBanner} id={"copier-guild-menuGroup-11"} label={"Guild Banner"}>
                        {bannerMenuItems}
                    </MenuComponents.MenuItem>
                    <MenuComponents.MenuItem disabled={validSplash} id={"copier-guild-menuGroup-112"} label={"Guild Splash"}>
                        {splashMenuItems}
                    </MenuComponents.MenuItem>
                    <MenuComponents.MenuItem id={"copier-guild-menuGroup-3"} label={"Copy Guild Info"}>
                        {additionalCopyItems}
                    </MenuComponents.MenuItem>
                    <MenuComponents.MenuItem id={"copier-guild-menuGroup-4"} label={"Guild Properties"}>
                        {checkboxItems}
                    </MenuComponents.MenuItem>
                </MenuComponents.MenuItem>
            );
        });
        
        patch("copierUser", "user-context", (props, res) => {
            const userProfile = useStateFromStores([UserProfileStore], () => UserProfileStore.getUserProfile(props?.user?.id))
            if (!userProfile) return;
            const UserIcon = getAnimated(format(avatarURL, props.user.id, props.user.avatar));
            const UserBanner = getAnimated(format(bannerURL, props.user.id, userProfile?.banner || props.user.banner));

            const [validAvatar, validBanner] = isEitherDisabled(props.user.avatar, UserBanner);
            const [validAccentColor, validBio, validUsername] = isEitherDisabled(
                userProfile?.accentColor,
                userProfile?.bio,
                props.user.username
            );

            const profilePictureMenuItems = [
                <MenuComponents.MenuItem
                    key={"copier-view-user-pfp"}
                    id={"copier-view-user-pfp"}
                    label={"View Profile Picture"}
                    action={async () => {
                        await openImageModal(UserIcon);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-user-pfp"}
                    id={"copier-copy-user-pfp"}
                    label={"Copy Profile Picture"}
                    action={() => {

                        copyModule.copyImage(UserIcon);
                    }}
                />,
            ];

            const bannerMenuItems = [
                <MenuComponents.MenuItem
                    key={"copier-view-user-banner"}
                    id={"copier-view-user-banner"}
                    label={"View Banner"}
                    action={async () => {
                        await openImageModal(UserBanner);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-user-banner"}
                    id={"copier-copy-user-banner"}
                    label={"Copy Banner"}
                    action={() => {
                        copyModule.copyImage(UserBanner);
                    }}
                />,
            ];

            const additionalCopyItems = [
                <MenuComponents.MenuItem
                    key={"copier-copy-accentColor"}
                    id={"copier-copy-accentColor"}
                    label={"Copy Accent Color"}
                    disabled={validAccentColor}
                    action={() => {
                        copyModule.copy(userProfile.accentColor.toString());
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-bio"}
                    id={"copier-copy-bio"}
                    label={"Copy Bio"}
                    disabled={validBio}
                    action={() => {
                        copyModule.copy(userProfile.bio);
                    }}
                />,
                <MenuComponents.MenuItem
                    key={"copier-copy-username"}
                    id={"copier-copy-username"}
                    label={"Copy Username"}
                    disabled={validUsername}
                    action={() => {

                        copyModule.copy(props.user.username);
                    }}
                />,
            ];

            const checkboxItems = [
                <MenuComponents.MenuCheckboxItem
                    key={"copier-checkbox-bot"}
                    id={"copier-checkbox-bot"}
                    label={"Bot"}
                    checked={props.user.bot}
                    disabled={true}
                />,
                <MenuComponents.MenuCheckboxItem
                    key={"copier-checkbox-desktop"}
                    id={"copier-checkbox-desktop"}
                    label={"Desktop"}
                    checked={props.user.desktop}
                    disabled={true}
                />,
            ];

            res.props.children.push(
                <MenuComponents.MenuItem id={"copier-menuGroup-1"} label={"More User Options"}>
                    <MenuComponents.MenuItem disabled={validAvatar} id={"copier-menuGroup-2"} label={"Profile Picture"}>
                        {profilePictureMenuItems}
                    </MenuComponents.MenuItem>
                    <MenuComponents.MenuItem disabled={validBanner} id={"copier-menuGroup-11"} label={"Banner"}>
                        {bannerMenuItems}
                    </MenuComponents.MenuItem>
                    <MenuComponents.MenuItem id={"copier-menuGroup-3"} label={"Copy User Info"}>
                        {additionalCopyItems}
                    </MenuComponents.MenuItem>
                    <MenuComponents.MenuItem id={"copier-menuGroup-4"} label={"User Properties"}>
                        {checkboxItems}
                    </MenuComponents.MenuItem>
                </MenuComponents.MenuItem>
            );
        });
    },
    stop() {
        unpatch("copierUser");
    },
});