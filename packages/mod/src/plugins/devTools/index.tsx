import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { byKeys, getModule, getProxy, whenWebpackReady } from "@webpack";
import { Injector } from "../../patcher";
import {ErrorBoundary, Icons, Popout} from "../../components";
import { ReactNode, useState } from "react";
import React from "../../fake_node_modules/react";
import { MenuComponents } from "../../api/menu";
import {FluxDispatcher} from "@webpack/common";
import {createAbort} from "../../util";

const Header = getProxy(byKeys("Caret", "Divider", "Icon", "Title"));
const inj = new Injector();
const [abort, getSignal] = createAbort();
const VXHeader = () => {
    const [show, setShow] = useState(false);

    return (
        <Header.Icon
            className="devTools"
            onClick={() => {
                setShow(v => !v);
                FluxDispatcher.dispatch({
                    type: "DEV_TOOLS_SETTINGS_UPDATE",
                    settings: {
                        devToolsEnabled: true,
                        displayTools: true,
                        showDevWidget: true
                    }
                });
            }}
            tooltip={"Open DevTools"}
            icon={Icons.Discord}
        />
    );
};

const ToolboxButton = ({ children }: { children: ReactNode[] }) => (
    <>{[...children.slice(0, -1), <VXHeader />, children.at(-1)]}</>
);


export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: true,
    patches: {
        match: "toolbar:function",
        find: /(?<=toolbar:function.{0,100}\()i.Fragment,/,
        replace: "$self.OwO,"
    },
    styler: undefined,
    async start() {
        const signal = getSignal();
        await whenWebpackReady();
        if (signal.aborted) return;
    },
    stop() {
        abort();
    },
    OwO: ErrorBoundary.wrap(ToolboxButton)
});
