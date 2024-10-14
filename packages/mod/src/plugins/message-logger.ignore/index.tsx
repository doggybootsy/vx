import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { FluxDispatcher, MessageStore } from "@webpack/common";
import { className, findInReactTree, proxyCache } from "../../util";
import {bySource, getLazy, whenWebpackInit, whenWebpackReady} from "@webpack";
import { Injector } from "../../patcher";
import { Markdown } from "../../components";
import React from "../../fake_node_modules/react";
import { DataStore } from "../../api/storage";
import * as styler from "./index.css?managed";

const inj = new Injector();

const MessageAndKey = getLazy(bySource(".isSystemMessage", ".hasThread", "buttonContainer"));

// Initialize DataStore for both edited and deleted messages
const _DataStore = new DataStore<Record<string, string>>("message-logger", { version: 1 });

// Load existing data or create empty collections as plain objects
let deletedMessages = _DataStore.get("deletedMessages") || {};
let editedMessages = _DataStore.get("editedMessages") || {};

// Ensure the data is saved back to the DataStore
const saveData = () => {
    _DataStore.set("deletedMessages", deletedMessages);
    _DataStore.set("editedMessages", editedMessages);
};

const EditedContent = ({ contentProps, edits }) => {
    if (!contentProps) return null;

    return (
        <div>
            {/* Render original content */}
            <div>{contentProps.content}</div>

            {/* Render edits */}
            {edits.map((edit, i) =>
                    edit.content && (i !== edits.length - 1) && (
                        <div
                            className="ml-edited-message"
                            key={`${edit.id}-${edit.timestamp}`}
                        >
                            <Markdown text={edit.content} />
                        </div>
                    )
            )}
        </div>
    );
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    async start(signal: AbortSignal) {
        await whenWebpackInit()
        const node = FluxDispatcher._actionHandlers._dependencyGraph.nodes[MessageStore.getDispatchToken()];


        Object.values(deletedMessages).forEach(({ message }) => {
            FluxDispatcher.dispatch({
                type: "MESSAGE_CREATE",
                message: message,
                channelId: message.channel_id
            });
        });

        
        inj.instead(node.actionHandler, "MESSAGE_DELETE", (that, [event], original) => {
            if (event.$) return original.call(that, event);

            const message = MessageStore.getMessage(event.channelId, event.id);
            if (!message) return original.call(that, event);

            // Store the deleted message in plain object
            deletedMessages[event.id] = { event, message };
            saveData(); // Persist changes

            FluxDispatcher.dispatch({
                type: "MESSAGE_CREATE",
                message: message,
                channelId: message.channel_id
            });
            
            return original.call(that, event);
        });

        // Handling message edits
        inj.instead(node.actionHandler, "MESSAGE_UPDATE", (that, [event], original) => {
            let edits = editedMessages[event.message.id] || [];

            // Update edited message log in plain object
            editedMessages[event.message.id] = edits.concat(event.message);
            saveData(); // Persist changes

            return original.call(that, event);
        });

        const module = await MessageAndKey;
        inj.after(module, "Z", (that, args, res) => {
            const data = findInReactTree(res, m => m?.message);
            const message = data.message
            let edits = editedMessages[message.id] || [];

            const props = findInReactTree(res, m => m?.className);
            const contentProps = findInReactTree(res, m => m?.content && m.message);

            // Append class for deleted messages
            props.className = className([
                props.className,
                deletedMessages[message.id] && "ml-deleted-message"
            ]);


            if (contentProps) {
                contentProps.content = [
                    React.createElement("div", {}, contentProps.content),
                    edits.map((edit, i) => edit.content && (i !== (edits.length - 1)) && React.createElement("div", {
                        children: [
                            React.createElement(Markdown, {
                                text: edit.content
                            })
                        ],
                        className: "ml-edited-message",
                        key: `${edit.id}-${edit.timestamp}`
                    }))
                ];
            }
        });
    },
    stop() {
        inj.unpatchAll();
    }
});
