import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { MenuComponents, patch, unpatch } from "../../api/menu";
import { Injector } from "../../patcher";
import {bySource, getLazy, getProxyByKeys, getProxyStore} from "@webpack";
import {Button, ErrorBoundary, Flex, Icons, Markdown, Popout, Tooltip} from "../../components";
import * as styler from "./translate.css?managed";
import { createAbort, InternalStore } from "../../util";
import { useInternalStore } from "../../hooks";
import {MessageStore, SelectedChannelStore, sendMessage, TextAreaInput} from "@webpack/common";
import { useMemo, useState } from "react";
import { getLocaleName } from "vx:i18n";
import {Channel, Message} from "discord-types/general";
import { DataStore } from "../../api/storage";
import { ModalComponents, ModalProps } from "../../api/modals";

const injector = new Injector();

export const LANGUAGE_CODES: readonly string[] = [
    "BG",
    "ZH",
    "CS",
    "DA",
    "NL",
    "EN",
    "ET",
    "FI",
    "FR",
    "DE",
    "EL",
    "HU",
    "IT",
    "JA",
    "LV",
    "LT",
    "PL",
    "PT",
    "RO",
    "RU",
    "SK",
    "SL",
    "ES",
    "SV",
    "TR"
];

interface Translation {
    language: typeof LANGUAGE_CODES[number];
    content: string;
    translation: string;
}

const storage = new DataStore<{ lastTranslatedLanguage: typeof LANGUAGE_CODES[number] }>("translator");

class TranslatedMessageStore extends InternalStore {
    #translations: Record<string, Record<string, Translation>> = {};
    public getTranslation(channelId: string, messageId: string): Translation | null {
        return this.#translations[channelId]?.[messageId] || null;
    }
    
    public resyncTranslation(channelId: string, messageId: string) {
        const translation = this.#translations[channelId]?.[messageId];
        if (!translation) return;

        return this.translate(channelId, messageId, translation.language);
    }

    public async translate(channelId: string, messageId: string, language: typeof LANGUAGE_CODES[number]) {
        const message: Message = MessageStore.getMessage(channelId, messageId);
        if (!message || !message.content) return;

        storage.set("lastTranslatedLanguage", language);

        const translation = await window.VXNative!.translate(message.content, language);

        this.#translations[channelId] ??= {};
        this.#translations[channelId][messageId] = {
            translation,
            content: message.content,
            language
        };

        this.emit();
    }

    public deleteTranslation(channelId: string, messageId: string) {
        this.#translations[channelId] ??= {};
        delete this.#translations[channelId][messageId];

        this.emit();
    }
}

const translatedMessageStore = new TranslatedMessageStore();

const MessageContent = getLazy(bySource('VOICE_HANGOUT_INVITE?""'), { searchDefault: false });

const [ abort, getSignal ] = createAbort();

const buttonClasses = getProxyByKeys<Record<string, string>>([ "buttonWrapper", "pulseButton" ]);

function TranslateModal({ transitionState, onClose, channel }: ModalProps & { channel: Channel }) {
    return (
        <ModalComponents.ModalRoot>
            <ModalComponents.ModalHeader separator={false} justify={Flex.Justify.BETWEEN}>
                <div className="vx-modal-title">
                    Translate
                </div>
                <ModalComponents.ModalCloseButton onClick={onClose} />
            </ModalComponents.ModalHeader>
            <ModalComponents.ModalContent>
                
            </ModalComponents.ModalContent>
        </ModalComponents.ModalRoot>
    )
}

export default definePlugin({
    authors: [Developers.kaan, Developers.doggybootsy],
    requiresRestart: false,
    icon: Icons.DeepL,
    styler,
    patches: {
        match: ".isSubmitButtonEnabled)",
        find: /return\(.+&&(.{1,3}?)\.push.+{disabled:.{1,3},type:.{1,3}}/,
        replace: "$self._addButton($1,arguments[0],$enabled);$&"
    },
    async start() {
        const signal = getSignal();

        patch("vx-translator", "message", (props, res) => {
            const translation = useInternalStore(translatedMessageStore, () => translatedMessageStore.getTranslation(props.channel.id, props.message.id));
        
            const isOutOfDate = useMemo(() => {
                if (!translation) return false;
                return translation.content !== props.message.content;
            }, [ translation, props.message.content ]);

            res.props.children.push(
                <MenuComponents.MenuGroup key="translation-menu-group">
                    <MenuComponents.MenuItem
                        label="Translate" 
                        id="vx-translate"
                        action={() => {
                            if (!storage.has("lastTranslatedLanguage")) return;
                            translatedMessageStore.translate(props.channel.id, props.message.id, storage.get("lastTranslatedLanguage")!);
                        }}
                    >
                        <MenuComponents.MenuGroup>
                            {LANGUAGE_CODES.map((lang) => (
                                <MenuComponents.MenuRadioItem
                                    key={lang}
                                    label={`Translate to ${getLocaleName(lang)}`}
                                    id={`vx-translate-${lang}`}
                                    action={() => {
                                        translatedMessageStore.translate(props.channel.id, props.message.id, lang);
                                    }}
                                    group="translation-group"
                                    checked={translation?.language === lang}
                                />
                            ))}
                        </MenuComponents.MenuGroup>
                        <MenuComponents.MenuGroup>
                            <MenuComponents.MenuItem
                                key="resync"
                                label="Resync Translation"
                                id="vx-resync"
                                color={"premium-gradient"}
                                disabled={!isOutOfDate}
                                action={() => {
                                    translatedMessageStore.resyncTranslation(
                                        props.channel.id,
                                        props.message.id
                                    );
                                }}
                            />
                            <MenuComponents.MenuItem
                                key="reset"
                                label="Reset Translation"
                                id="vx-reset"
                                color={"danger"}
                                action={() => {
                                    translatedMessageStore.deleteTranslation(props.channel.id, props.message.id);
                                }}
                            />
                        </MenuComponents.MenuGroup>
                    </MenuComponents.MenuItem>
                </MenuComponents.MenuGroup>
            );
        });

        const module = await MessageContent;

        if (signal.aborted) return;

        injector.after(module.default, "type", (_, [ props ]: any[], res) => {
            const translation = useInternalStore(translatedMessageStore, () => translatedMessageStore.getTranslation(props.message.channel_id, props.message.id));
            const isOutOfDate = useMemo(() => {
                if (!translation) return false;
                return translation.content !== props.message.content;
            }, [ translation, props.message.content ]);

            if (!translation) return;

            return injector.return([
                <div className="vx-translation">
                    <Tooltip text={`Translated into ${getLocaleName(translation.language)}${isOutOfDate ? "\nTranslation is out of date!" : ""}`}>
                        {(props) => (
                            <span {...props} className="vx-translation-languaage" data-vx-is-out-of-date={Boolean(isOutOfDate)}>
                                {translation.language}
                            </span>
                        )}
                    </Tooltip>
                    <Markdown text={translation.translation} />
                </div>,
                res
            ]);
        });

    },
    stop() {
        injector.unpatchAll();
        abort();
        unpatch("vx-translator");
    },
    _addButton(buttons: React.ReactNode[], props: { type: { analyticsName: string }, channel: Channel, disabled: boolean }, enabled: boolean) {
        const [ isShowing, shouldShow ] = useState(false);

        if (props.type.analyticsName !== "normal") return;
        if (props.disabled) return;
        if (!enabled) return;
    
        buttons.push(
            <ErrorBoundary>
                <Popout
                    shouldShow={isShowing} 
                    onRequestClose={() => shouldShow(false)}
                    renderPopout={() => (
                        <MenuComponents.Menu navId="vx-translate" onClose={() => shouldShow(false)}>
                            <MenuComponents.MenuGroup>
                                {LANGUAGE_CODES.map((lang) => (
                                    <MenuComponents.MenuItem
                                        key={lang}
                                        label={`Translate to ${getLocaleName(lang)}`}
                                        id={`vx-translate-${lang}`}
                                        action={async () => {
                                            storage.set("lastTranslatedLanguage", lang);
                                            const result = await window.VXNative!.translate(TextAreaInput.getText(), lang);

                                            await sendMessage(result, props.channel.id);
                                        }}
                                        group="translation-group"
                                    />
                                ))}
                            </MenuComponents.MenuGroup>
                        </MenuComponents.Menu>
                    )}
                >
                    {(props) => (
                        <div
                            {...props}
                            className="vx-textarea-button-container"
                            onClick={async (event) => {
                                props.onClick(event);
                                
                                if (event.shiftKey) {
                                    shouldShow(false);
                                    
                                    if (!storage.has("lastTranslatedLanguage")) return;
                                    const last = storage.get("lastTranslatedLanguage")!;

                                    storage.set("lastTranslatedLanguage", last);

                                    const text = TextAreaInput.getText();
                                    TextAreaInput.clearText();
                                    const result = await window.VXNative!.translate(text, last);
                                    TextAreaInput.insertText(result);
                                  
                                    return;
                                }

                                shouldShow(!isShowing);
                            }}
                        >
                            <Button
                            look={Button.Looks.BLANK}
                            size={Button.Sizes.NONE}
                                className={buttonClasses.active}
                            innerClassName="vx-textarea-button-inner"
                            // @ts-expect-error idk the typings for this, so
                            focusProps={{
                                offset: {
                                top: 4,
                                bottom: 4
                                }
                            }}
                            >
                            <Icons.DeepL />
                            </Button>
                        </div>
                    )}    
                </Popout>
            </ErrorBoundary>
        );
    }
});
