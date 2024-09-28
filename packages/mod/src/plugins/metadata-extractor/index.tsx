import {SystemDesign, Tooltip} from "../../components";
import { ModalComponents, openModal } from "../../api/modals";
import { ZIP } from "../../components/icons";
import {Developers} from "../../constants";
import {definePlugin} from "../index";
import "./index.css"
import {memo, useCallback, useState} from "../../fake_node_modules/react";
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

const ZipButton = memo(({ downloadURL, name, mimeType }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadAndRead = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch(downloadURL);
            const actualMimeType = response.headers.get("Content-Type") || mimeType || "application/octet-stream";
            const matches = [...downloadURL.matchAll(/\w+\./g)];
            const fileName = matches.length > 0 ? matches[matches.length - 1][0] : "download";
            const blob = await response.blob();
            const file = new File([blob], fileName.replace(",", ""), { type: actualMimeType });

            window.jsmediatags.read(file, {
                onSuccess: (tag) => {
                    let albumCoverUrl = null;
                    if (tag.tags.picture) {
                        const base64String = arrayBufferToBase64(tag.tags.picture.data);
                        albumCoverUrl = `data:${tag.tags.picture.format};base64,${base64String}`;
                    }

                    const modalContent = (
                        <div className="modern-metadata-modal">
                            <div className="modal-header">
                                {albumCoverUrl && (
                                    <img
                                        src={albumCoverUrl}
                                        alt="Album Cover"
                                        className="album-cover"
                                    />
                                )}
                                <div className="album-info">
                                    <h2>{tag.tags.album || "Unknown Album"}</h2>
                                    <h3>{tag.tags.artist || "Unknown Artist"}</h3>
                                </div>
                            </div>
                            <div className="modal-content">
                                <div className="metadata-grid">
                                    {[
                                        ["Title", tag.tags.title],
                                        ["Year", tag.tags.year],
                                        ["Genre", tag.tags.genre],
                                        ["Track", tag.tags.track],
                                    ].map(([key, value]) => (
                                        value && (
                                            <div key={key} className="metadata-item">
                                                <span className="metadata-key">{key}</span>
                                                <span className="metadata-value">{String(value)}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                                {tag.tags.comment && (
                                    <div className="comment-section">
                                        <h4>Comment</h4>
                                        <p>{typeof tag.tags.comment === 'object' ? tag.tags.comment.text : tag.tags.comment}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );

                    openModal((props) => (
                        <ModalComponents.ModalRoot {...props} size={SystemDesign.ModalSize.DYNAMIC}>
                            {modalContent}
                        </ModalComponents.ModalRoot>
                    ));
                },
                onError: (error) => {
                    console.error("Error reading tags:", error);
                },
            });
        } catch (error) {
            console.error("Error fetching file:", error);
        } finally {
            setIsLoading(false);
        }
    }, [downloadURL, name, mimeType, isLoading]);

    return (
        <Tooltip text="Extract Metadata">
            {(ttProps) => (
                <div
                    {...ttProps}
                    className="vx-zip-button"
                    onClick={handleDownloadAndRead}
                    style={{
                        opacity: isLoading ? 0.5 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <ZIP size={20} />
                </div>
            )}
        </Tooltip>
    );
});

export default definePlugin({
    authors: [Developers.kaan],
    start() {
        let jsmediatag;
        setTimeout(() => {
            jsmediatag = document.createElement("script");
            jsmediatag.src = "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js";
            document.body.appendChild(jsmediatag);
        }, 1000);
    },
    patches: {
        match: ".Messages.REMOVE_ATTACHMENT_TOOLTIP_TEXT",
        find: /(=(.{1,3})=>.+?hoverButtonGroup,.+?children:)\[(.+?)]/,
        replace: "$1[$enabled&&$jsx($self.ZipButton,$2),$3]",
    },
    ZipButton,
});