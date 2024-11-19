import { getProxy, whenWebpackInit } from "@webpack";
import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import React, { useState } from "react";
import { className } from "../../util";
import { MessageStore } from "@webpack/common";
import { Popout, Tooltip } from "../../components";
import * as styler from "./index.css?managed";

const CONFIG = {
    CONSTS: {
        RULES: "tiktok-emoticons",
    },
    REGEX: {
        EMOTICON: /^\[(smile|happy|angry|cry|embarrassed|surprised|wronged|shout|flushed|yummy|complacent|drool|scream|weep|speechless|funnyface|laughwithtears|wicked|facewithrollingeyes|sulk|thinking|lovely|greedy|wow|joyful|hehe|slap|tears|stun|cute|blink|disdain|astonish|rage|cool|excited|proud|smileface|evil|angel|laugh|pride|nap|loveface|awkward|shock)]/
    }
};

const MarkdownModule = getProxy(m => m.defaultRules && m.parse);
const emojiClassNames = getProxy(x => x.emojiContainerClickable);

const EmojiPopout = ({ emoji, channelId, messageId }: {emoji: string, channelId: string, messageId: string}) => {
    const [showingPopout, setShowingPopout] = useState(false);
    const message = MessageStore.getMessage(channelId, messageId);
    const messageContent = message?.content.trim() || "";

    const words = messageContent.split(/\s+/);
    const isOnlyEmojis = words.every(word => CONFIG.REGEX.EMOTICON.test(word));

    const togglePopout = () => setShowingPopout(prev => !prev);

    return (
        <Popout
            shouldShow={showingPopout}
            onRequestClose={() => setShowingPopout(false)}
            position="right"
            renderPopout={() => (
                <div className="emoji-vx-info-popout">
                    <div className="emoji-vx-info-content">
                        <div className="emoji-vx-info-left">
                            <img
                                className="emoji-vx large"
                                src={`https://em-content.zobj.net/content/2020/07/27/${emoji}.png`}
                            />
                        </div>
                        <div className="emoji-vx-info-right">
                            <span className="emoji-vx-info-name">[{emoji}]</span>
                            <div className="emoji-vx-info-text">
                                A default emoji. You can use this emoji everywhere on VX.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        >
            {() =>
                <Tooltip text={`[${emoji}]`}>
                    {(props) => (
                        <div
                            {...props}
                            className={className([emojiClassNames.emojiContainer, emojiClassNames.emojiContainerClickable])}
                            onClick={togglePopout}
                        >
                            <img
                                className={className(['emoji', isOnlyEmojis && 'jumboable'])}
                                src={`https://em-content.zobj.net/content/2020/07/27/${emoji}.png`}
                                alt={emoji}
                            />
                        </div>
                    )}
                </Tooltip>}
        </Popout>
    );
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    async start(signal: AbortSignal) {
        await whenWebpackInit();

        MarkdownModule.defaultRules[CONFIG.CONSTS.RULES] = {
            order: 1,
            match: (text: string) => CONFIG.REGEX.EMOTICON.exec(text),
            parse: (capture: string[]) => ({
                emoji: capture[1],
                fullContent: capture[0],
                type: CONFIG.CONSTS.RULES,
            }),
            react: (node: { emoji: string; fullContent: string }, _: any, args: { channelId: string, messageId: string, key: string }) => {
                return <EmojiPopout emoji={node.emoji} channelId={args.channelId} messageId={args.messageId} />;
            }
        };

        MarkdownModule.parse = MarkdownModule.reactParserFor(MarkdownModule.defaultRules);
    },
    stop() {
        delete MarkdownModule.defaultRules[CONFIG.CONSTS.RULES];
        MarkdownModule.parse = MarkdownModule.reactParserFor(MarkdownModule.defaultRules);
    }
});
