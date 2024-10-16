import {definePlugin} from "../index";
import {Developers} from "../../constants";
import {byStrings, getProxy} from "@webpack";
import * as styler from "./index.css?managed"
import React from 'react';
import {Toolbar} from "../toolbar/ToolbarService";
import {MenuComponents} from "../../api/menu";
import {openModal} from "../../api/modals";
import GitHubModal, {themes} from "./githubModal";
import {getParents} from "../../util";
import {createSettings, SettingType} from "../settings";
import {Button, Flex, Icons, SystemDesign} from "../../components";

interface GitHubUrlInfo {
    user: string;
    repo: string;
    branch: string;
}

const PanelButton = getProxy(byStrings("{tooltipText:", ".Masks.PANEL_BUTTON,"));

export const settings = createSettings("github-in-discord", {
    githubToken: {
        type: SettingType.CUSTOM,
        placeholder: "Github Token",
        title: "Github Token",
        description: "Your Github Account token. Used for increasing api rate limits and private repos",
        default: "",
        render(props: { setState(state: any): void; state: any }): React.ReactNode {
            return <Flex>
                <Flex.Child grow={1}>
                    <div>
                        <SystemDesign.TextInput
                            minLength={1}
                            value={props.state}
                            onChange={(value: string) => props.setState(value)}
                        />
                    </div>
                </Flex.Child>
                <Flex.Child grow={0} shrink={0} onClick={() => props.setState("")}>
                    <Button size={Button.Sizes.ICON}>
                        <Icons.Refresh />
                    </Button>
                </Flex.Child>
            </Flex>
        }
    },
    theme: {
        type: SettingType.SELECT,
        default: "dark",
        choices: themes,
        title: "Github Theme",
        placeholder: "Select theme",
    }
})

const openGithubModal = (url: string) => {
    openModal(props => (
        <GitHubModal url={url} props={props} />
    ));
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    settings,
    icon: Icons.Github,
    menus: {
        "message"(a, ctx) {
            const messageContent = a.target.tagName === "A" ? (a.target as HTMLAnchorElement).href : getParents(a.target).querySelector<HTMLAnchorElement>("a")?.href ?? a.message.content;
            const githubUrlRegex = /https:\/\/github.com\/.+?\/\w+(\/tree)?/;

            if (messageContent && githubUrlRegex.test(messageContent)) {
                const [ url ] = messageContent.match(githubUrlRegex)!;

                ctx.props.children?.push(
                    <MenuComponents.MenuItem
                        id="github-in-discord"
                        label="Open Repo in GitHub"
                        action={() => openGithubModal(url)}
                    />
                );
            }
        }
    }
});
