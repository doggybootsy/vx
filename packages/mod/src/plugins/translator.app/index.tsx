import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { MenuComponents, MenuProps, patch } from "../../api/menu";
import React, { useState } from "react";
import { Injector } from "../../patcher";
import { bySource, getLazy } from "@webpack";
import {Markdown} from "../../components";
import './translate.css';

interface Translations {
    [key: string]: string;
}
interface MessageArgs {
    message: {
        id: string;
    };
}
interface TranslatedMessages {
    [key: string | number]: {
        original: any;
        translated: any;
        current: any;
    };
}

const messageStore: TranslatedMessages = {};
const inj = new Injector();

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


let selectedLangCache: string | null = null
function StartTranslation(
    props: MenuProps,
    res: { props: { children: React.ReactNode[] } }
) {
    const [selectedLanguage, setSelectedLanguage] = useState<string>(selectedLangCache ?? "ja");
    const [messageId, setMessageId] = useState<string>(props.message.id);
    const { message } = props;

    const handleLanguageChange = async (lang: string) => {
        selectedLangCache = lang;
        setSelectedLanguage(lang);
        
        if (!window.VXNative) return;
        
        const translatedContent = await window.VXNative.translate(message.content, null, lang);

        messageStore[messageId] = {
            original: message.content,
            translated: translatedContent,
            current: `${translatedContent}\n${message.content}`,
        };
        
        setMessageId(messageId);
    };

    const languageItems = LANGUAGE_CODES.map((lang) => (
        <MenuComponents.MenuRadioItem
            key={lang}
            label={`Translate to ${lang}`}
            id={`vx-translate-${lang}`}
            action={() => handleLanguageChange(lang)}
            group="translation-group"
            checked={selectedLanguage === lang}
        />
    ));

    const resetItem = (
        <MenuComponents.MenuItem
            key="reset"
            label="Reset Translation"
            id="vx-reset"
            color={"danger"}
            action={() => {
                selectedLangCache = "RESET_CODE";
                setSelectedLanguage("RESET_CODE");
                if (messageStore[messageId]) {
                    delete messageStore[messageId].translated;
                    setMessageId(messageId);
                }
            }}
        />
    );

    res.props.children.push(
        <MenuComponents.MenuGroup key="translation-menu-group">
            <MenuComponents.MenuItem label="Translate" id="vx-translate">
                {languageItems}
                {resetItem}
            </MenuComponents.MenuItem>
        </MenuComponents.MenuGroup>
    );
}


function getMessageById(messageId: string | number): { translated: string } | undefined {
    const message = messageStore[messageId];
    return message ? { translated: message.translated } : undefined;
}


export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start() {
        patch("vx-translator", "message", StartTranslation);
        const something = await getLazy(bySource('VOICE_HANGOUT_INVITE?""'));
        inj.after(something.default, "type", (_, args: any, c) => {
            if (!args || !args[0] || !args[0].message) return;

            const messageIdObject = getMessageById(args[0].message.id);
            if (!messageIdObject) return;

            const { translated } = messageIdObject;

            return inj.return([
                translated && <div className="vx-translation"><Markdown text={translated} /></div>,
                c
            ]);
        });

    },
});
