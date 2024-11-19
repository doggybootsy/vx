import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import { Icons } from "../../components";

import { TextAreaInput } from "@webpack/common";
import {SlateToolbarAPI} from "../../api/quick-actions/slate-toolbar";

const insertMaskedLink = (selectedText: string | null) => {
    if (selectedText) {
        TextAreaInput.insertText(`[dummy text](${selectedText})`);
    }
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    start(signal: AbortSignal) {
        SlateToolbarAPI.addButton(
            {
                label: "Mask List",
                icon: <Icons.Plus/>,
                onClick: () => {
                    const selectedText = getSelection()?.toString();
                    if (!selectedText) return
                    insertMaskedLink(selectedText)
                },
                tooltip: "Mask List"
            }
        )
    },
});