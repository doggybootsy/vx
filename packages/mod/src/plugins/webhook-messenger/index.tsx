import React, { useState } from 'react';
import { ModalComponents, openModal } from "../../api/modals";
import { Button, Icons, SystemDesign } from "../../components";
import { sendMessage, Webhook } from "@webpack/common";
import { Developers } from "../../constants";
import { definePlugin } from "vx:plugins";
import * as styler from "./index.css?managed";

const WebhookSender = ({ closeModal, webhook, props }) => {
    const [url, setUrl] = useState(webhook?.url || '');
    const [content, setContent] = useState('Default Text');
    const [username, setUsername] = useState('My Webhook Name');
    const [embeds, setEmbeds] = useState([{ title: '', description: '', color: '#000000', fields: [] }]);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const handleAddEmbed = () => {
        setEmbeds([...embeds, { title: '', description: '', color: '#000000', fields: [] }]);
    };

    const handleEmbedChange = (index, field, value) => {
        const newEmbeds = [...embeds];
        newEmbeds[index][field] = value;
        setEmbeds(newEmbeds);
    };

    const handleAddField = (embedIndex) => {
        const newEmbeds = [...embeds];
        newEmbeds[embedIndex].fields.push({ name: '', value: '' });
        setEmbeds(newEmbeds);
    };

    const handleFieldChange = (embedIndex, fieldIndex, field, value) => {
        const newEmbeds = [...embeds];
        newEmbeds[embedIndex].fields[fieldIndex][field] = value;
        setEmbeds(newEmbeds);
    };

    const handleFileChange = (e) => {
        setFiles([...files, ...e.target.files]);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");
        
        const params = {
            content: content,
            username: username,
            embeds: embeds.map(embed => ({
                title: embed.title,
                description: embed.description,
                color: parseInt(embed.color.replace('#', ''), 16),
                fields: embed.fields.filter(field => field.name || field.value)
            })).filter(embed => embed.title || embed.description),
            attachments: files.map(file => file)
        };

        const jsonString = JSON.stringify(params);

        try {
            await VXNative.http.sendWebhook(url, jsonString);
        } catch (error) {
            setError('Failed to send webhook. Please check your URL and try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    /*
     <div className="vx-gm-file-upload">
        <h3 className="vx-gm-section-title">Attachments</h3>
        <input
            type="file"
            onChange={handleFileChange}
            multiple
            className="vx-gm-file-input"
        />
        {files.length > 0 && (
            <ul className="vx-gm-file-list">
                {files.map((file, index) => (
                    <li key={index} className="vx-gm-file-item">{file.name}</li>
                ))}
            </ul>
        )}
    </div>
     */

    return (
        <ModalComponents.Root {...props}>
            <ModalComponents.Header>
                <div className="vx-gm-modal-header-title">
                    <Icons.Discord />
                    <span>Send Webhook</span>
                </div>
            </ModalComponents.Header>
            <ModalComponents.Content>
                <div className="vx-gm-webhook-form">
                    <SystemDesign.TextInput
                        value={url}
                        onChange={(e) => setUrl(e)}
                        placeholder="Webhook URL"
                    />
                    <SystemDesign.TextInput
                        value={username}
                        onChange={(e) => setUsername(e)}
                        placeholder="Username"
                    />
                    <SystemDesign.TextArea
                        value={content}
                        onChange={(e) => setContent(e)}
                        placeholder="Message content"
                        rows={3}
                    />
                    <div className="vx-gm-embeds-section">
                        <h3 className="vx-gm-section-title">Embeds</h3>
                        {embeds.map((embed, embedIndex) => (
                            <div key={embedIndex} className="vx-gm-embed-item">
                                <SystemDesign.TextInput
                                    value={embed.title}
                                    onChange={(e) => handleEmbedChange(embedIndex, 'title', e)}
                                    placeholder="Embed title"
                                />
                                <SystemDesign.TextArea
                                    value={embed.description}
                                    onChange={(e) => handleEmbedChange(embedIndex, 'description', e)}
                                    placeholder="Embed description"
                                    rows={2}
                                />
                                <input
                                    type="color"
                                    value={embed.color}
                                    onChange={(e) => handleEmbedChange(embedIndex, 'color', e.target.value)}
                                    className="vx-gm-color-input"
                                />
                                <div className="vx-gm-embeds-section">
                                    <h4 className="vx-gm-section-title">Fields</h4>
                                    {embed.fields.map((field, fieldIndex) => (
                                        <div key={fieldIndex} className="vx-gm-embed-item">
                                            <SystemDesign.TextInput
                                                value={field.name}
                                                onChange={(e) => handleFieldChange(embedIndex, fieldIndex, 'name', e)}
                                                placeholder="Field name"
                                            />
                                            <SystemDesign.TextArea
                                                value={field.value}
                                                onChange={(e) => handleFieldChange(embedIndex, fieldIndex, 'value', e)}
                                                placeholder="Field value"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                    <Button onClick={() => handleAddField(embedIndex)} color={Button.Colors.GREEN} size={Button.Sizes.SMALL}>
                                        Add Field
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button onClick={handleAddEmbed} color={Button.Colors.GREEN} size={Button.Sizes.SMALL}>
                            Add Embed
                        </Button>
                    </div>
                    {error && <div className="vx-gm-error-message">{error}</div>}
                </div>
            </ModalComponents.Content>
            <ModalComponents.Footer>
                <Button onClick={closeModal} color={Button.Colors.RED} disabled={isLoading}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color={Button.Colors.PRIMARY} disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Webhook'}
                </Button>
            </ModalComponents.Footer>
        </ModalComponents.Root>
    )
};

export const openWebhookModal = (webhook: Webhook) => {
    openModal((props) => <WebhookSender props={props} webhook={webhook} />);
};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: true,
    icon: Icons.Discord,
    styler,
    patches: {
        match: ".WEBHOOK_INTEGRATION(",
        find: /\.Messages\.INTEGRATIONS_WEBHOOK_DELETE}\)/,
        replace: "$&,$enabled&&$jsx($self.WebhookButton, t)"
    },
    WebhookButton: (t: Webhook) => (
        <Button
            size={Button.Sizes.SMALL}
            onClick={() => openWebhookModal(t)}
            color={Button.Colors.GREEN}
        >
            Open Webhook Messenger
        </Button>
    ),
});
