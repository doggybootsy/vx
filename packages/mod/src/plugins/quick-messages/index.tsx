import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { createSettings, SettingType } from "vx:plugins/settings";
import { Flex, FormBody, SystemDesign } from "../../components";
import { MessageActions, sendMessage } from "@webpack/common";
import { Injector } from "../../patcher";
import { whenWebpackReady } from "@webpack";
import {MessageJSON} from "discord-types/general";

type MessageCreate = {
    type: "MESSAGE_CREATE";
    channelId: string;
    message: {
        id: string;
        type: number;
        content: string;
        channel_id: string;
        author: {
            id: string;
            username: string;
            avatar: string;
            discriminator: string;
            bot: boolean;
            global_name?: string;
        };
        attachments: any[];
        embeds: any[];
        pinned: boolean;
        mentions: any[];
        mention_channels: any[];
        mention_roles: any[];
        mention_everyone: boolean;
        timestamp: string;
        state: string;
        tts: boolean;
        message_snapshots: any[];
        nonce: string;
    };
    optimistic: boolean;
    sendMessageOptions: {
        nonce: string;
    };
    isPushNotification: boolean;
};

const settings = createSettings("message-regex", {
    caseSensitive: {
        type: SettingType.SWITCH,
        default: false,
        title: "Case Sensitive",
        description: "Make pattern matching case sensitive"
    },
    notificationSound: {
        type: SettingType.SWITCH,
        default: false,
        title: "Play Sound",
        description: "Play a sound when a pattern is replaced"
    },
    patterns: {
        type: SettingType.CUSTOM,
        default: [] as Array<{
            match: string;
            replace: string;
            includes: string;
            flags?: string;
        }>,
        title: "Regex Patterns",
        description: "Patterns to match and replace in messages",
        render: ({ state, setState }) => {
            return (
                <FormBody title="Regex Patterns">
                    {state.map((pattern, index) => (
                        <div key={index} className="pattern-item" style={{ marginBottom: "15px" }}>
                            <Flex direction={Flex.Direction.VERTICAL} align={Flex.Align.CENTER} gap={8}>
                                <SystemDesign.TextInput
                                    value={pattern.includes}
                                    onChange={(value) => {
                                        const newPatterns = [...state];
                                        newPatterns[index] = { ...pattern, includes: value };
                                        setState(newPatterns);
                                    }}
                                    placeholder="Trigger text (pattern only applies if message includes this)"
                                    style={{ width: "100%", maxWidth: "400px" }}
                                />
                                <SystemDesign.TextInput
                                    value={pattern.match}
                                    onChange={(value) => {
                                        const newPatterns = [...state];
                                        newPatterns[index] = { ...pattern, match: value };
                                        setState(newPatterns);
                                    }}
                                    placeholder="Exact match pattern (e.g. .corrupt)"
                                    style={{ width: "100%", maxWidth: "400px" }}
                                />
                                <SystemDesign.TextInput
                                    value={pattern.replace}
                                    onChange={(value) => {
                                        const newPatterns = [...state];
                                        newPatterns[index] = { ...pattern, replace: value };
                                        setState(newPatterns);
                                    }}
                                    placeholder="Replacement text"
                                    style={{ width: "100%", maxWidth: "400px" }}
                                />
                                <SystemDesign.Button
                                    onClick={() => {
                                        const newPatterns = [...state];
                                        newPatterns.splice(index, 1);
                                        setState(newPatterns);
                                    }}
                                    color={SystemDesign.Button.Colors.RED}
                                >
                                    Delete Pattern
                                </SystemDesign.Button>
                            </Flex>
                        </div>
                    ))}
                    <Flex justify={Flex.Justify.CENTER}>
                        <SystemDesign.Button
                            onClick={() => setState([...state, { match: "", replace: "", includes: "", flags: "" }])}
                            color={SystemDesign.Button.Colors.GREEN}
                        >
                            Add New Pattern
                        </SystemDesign.Button>
                    </Flex>
                </FormBody>
            );
        },
    },
});

const inj = new Injector();

const playNotificationSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10..."); 
    audio.play().catch(console.error);
};

const applyRegex = (
    messageContent: string,
    patterns: Array<{ match: string; replace: string; includes: string; flags?: string }>,
    caseSensitive: boolean
) => {
    let modifiedMessage = messageContent;
    let appliedAny = false;

    const sortedPatterns = [...patterns].sort((a, b) => {
        if (a.match.includes('\\s+') && !b.match.includes('\\s+')) return -1;
        if (!a.match.includes('\\s+') && b.match.includes('\\s+')) return 1;
        return 0;
    });

    for (const pattern of sortedPatterns) {
        if (!pattern.includes || messageContent.includes(pattern.includes)) {
            try {
                const flags = `${pattern.flags || ""}${caseSensitive ? "" : "i"}g`;
                const regex = new RegExp(pattern.match, flags);
                const newMessage = modifiedMessage.replace(regex, (match, ...args) => {
                    const namedGroups = args[args.length - 1] || {};

                    let replacement = pattern.replace;
                    Object.entries(namedGroups).forEach(([key, value]) => {
                        if (key === 'query') { // hardcoding query regex.
                            value = String(value).replace(/\s+/g, '+');
                        }
                        replacement = replacement.replace(new RegExp(`\\$<${key}>`, 'g'), String(value));
                    });

                    return replacement;
                });

                if (newMessage !== modifiedMessage) {
                    modifiedMessage = newMessage;
                    appliedAny = true;
                }
            } catch (e) {
                console.error("Regex error:", e);
            }
        }
    }

    return {
        content: modifiedMessage,
        modified: appliedAny
    };
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start(signal: AbortSignal) {
        await whenWebpackReady();
        inj.after(MessageActions, 'sendMessage', (a, yeah, c) => {
            const content = yeah[1] as MessageJSON;
            const patterns = settings.patterns.get();
            const caseSensitive = settings.caseSensitive.get();

            if (patterns.length > 0) {
                const { content: modifiedContent, modified } = applyRegex(content.content, patterns, caseSensitive);

                if (modified) {
                    content.content = modifiedContent;
                    if (settings.notificationSound.get()) {
                        playNotificationSound();
                    }
                }
            }
        });
    },
    settings,
});