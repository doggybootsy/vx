import {definePlugin} from "../index";
import {Developers} from "../../constants";
import {byStrings, getProxy} from "@webpack";
import * as styler from "./index.css?managed"

interface GitHubUrlInfo {
    user: string;
    repo: string;
    branch: string;
}

import React from 'react';
import {Toolbar} from "../toolbar/ToolbarService";
import {MenuComponents} from "../../api/menu";
import {ModalComponents, openModal} from "../../api/modals";
import GitHubModal from "./githubModal";
import {getParents} from "../../util";
const PanelButton = getProxy(byStrings("{tooltipText:", ".Masks.PANEL_BUTTON,"));

function GithubButton() {
    return (   
        <PanelButton
        tooltipText={"Github In Discord"}
        onClick={() => {
            console.log('hi')
        }}
        icon={() => <GitHubIcon color="currentColor"/>}
    />)
}

const GitHubIcon = ({ width = 24, height = 24, color = 'black' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width={width}
            height={height}
            fill={color}
        >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.39 0-.19-.01-.69-.01-1.35-2.01.44-2.43-.48-2.58-.92-.09-.22-.47-.92-.81-1.11-.28-.16-.67-.56-.01-.57.62-.01 1.07.57 1.21.81.71 1.18 1.86.84 2.31.64.07-.51.28-.84.51-1.03-1.77-.2-2.89-.87-2.89-3.85 0-.85.3-1.55.79-2.1-.08-.2-.34-1.02.07-2.12 0 0 .66-.21 2.15.81A7.55 7.55 0 018 3.2c.66.003 1.32.09 1.93.26 1.48-1.02 2.15-.81 2.15-.81.41 1.1.15 1.92.07 2.12.49.55.79 1.25.79 2.1 0 2.99-1.12 3.65-2.89 3.85.3.27.59.8.59 1.62 0 1.17-.01 2.12-.01 2.41 0 .22.15.46.55.39C13.71 14.54 16 11.54 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
    );
};

const openModal_ = (url) => {
    openModal(props => (
        <GitHubModal url={url} props={props} />
    ));
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    start(signal: AbortSignal) {

        Toolbar.addItem("vx-github-in-discord",
            <PanelButton
                tooltipText="Github In Discord"
                onClick={() => {
                    openModal_("https://github.com/username/repo");
                }}
                icon={() => <GitHubIcon color="currentColor"/>}
            />
        );
    },
    styler,
    menus: {
        "message"(a, ctx) {
            console.log(a)
            const messageContent = a.target.tagName === "A" ? a.target?.href : getParents(a.target).querySelector("a")?.href ?? a.message?.content;
            const githubUrlRegex = /https:\/\/github.com\/\w+\/\w+(\/tree)?/;

            if (messageContent && githubUrlRegex.test(messageContent)) {
                const matches = messageContent.match(githubUrlRegex);
                const url = matches[0];

                ctx.props.children?.push(
                    <MenuComponents.MenuItem
                        id="github-in-discord"
                        label="Open Repo in GitHub"
                        action={() => openModal_(url)}
                    />
                );
            }
        }
    }
});
