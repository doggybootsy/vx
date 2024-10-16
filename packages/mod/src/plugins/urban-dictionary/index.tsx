import React, {useState, useEffect} from 'react';
import * as styler from './index.css?managed';
import {ModalComponents, ModalProps, openModal} from "../../api/modals";
import {Developers} from "../../constants";
import { definePlugin } from "vx:plugins";
import {MenuComponents} from '../../api/menu';
import {Button, Flex} from "../../components";

interface WordDefinition {
    definition: string;
    permalink: string;
    thumbs_up: number;
    author: string;
    word: string;
    defid: number;
    current_vote: string;
    written_on: string;
    example: string;
    thumbs_down: number;
}

interface UrbanDictionaryProps {
    word: string,
    onClose: () => void,
    props?: ModalProps
}

const UrbanDictionary: React.FC<UrbanDictionaryProps> = ({word, onClose, props}) => {
    const [definitions, setDefinitions] = useState<WordDefinition[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDefinitions = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`);
                const data = await response.json();
                setDefinitions(data.list || []);
            } catch (err) {
                setError('Failed to fetch definitions');
            } finally {
                setLoading(false);
            }
        };

        fetchDefinitions();
    }, [word]);

    const handlePrevious = () => {
        setCurrentIndex(prev => prev > 0 ? prev - 1 : definitions.length - 1);
    };

    const handleNext = () => {
        setCurrentIndex(prev => prev < definitions.length - 1 ? prev + 1 : 0);
    };

    if (loading) {
        return (
            <ModalComponents.Root>
                <ModalComponents.Content>
                    <div className="vx-ud-urban-card-content">
                        <img
                            width={"100px"}
                            src={"https://canary.discord.com/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg"}
                            alt="Loading"
                        />
                        <div className="vx-ud-loading-text">Loading definitions...</div>
                    </div>
                </ModalComponents.Content>
            </ModalComponents.Root>
        );
    }

    if (error || definitions.length === 0) {
        return (
            <ModalComponents.Root>
                <ModalComponents.Header>
                    <div>
                        <h2 className="vx-ud-word-title">No Definitions Found</h2>
                    </div>
                </ModalComponents.Header>
                <ModalComponents.Content>
                    <div>
                        <img
                            width={"100px"}
                            src={"https://canary.discord.com/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg"}
                            alt="No Definitions"
                        />
                        <div className="vx-ud-error-text">
                            {error || `No definitions found for "${word}"`}
                        </div>
                    </div>
                </ModalComponents.Content>
            </ModalComponents.Root>
        );
    }

    const currentDefinition = definitions[currentIndex];

    return (
        <>
            <ModalComponents.Header>
                <div className="vx-ud-header-content">
                    <Flex align={Flex.Align.CENTER} gap={40}>
                        <h2 style={{color: "var(--text-normal)"}} className="vx-ud-word-title">{currentDefinition.word}</h2>
                        <span className="vx-ud-definition-count">
                        Definition {currentIndex + 1} of {definitions.length}
                    </span>
                        <img width={"110px"} src={"https://raw.githubusercontent.com/TheGreenPig/BetterDiscordPlugins/main/UrbanDictionary/UD_logo.svg"}/>
                    </Flex>
                </div>
            </ModalComponents.Header>
            <ModalComponents.Content>
                <div className="vx-ud-definition-section">
                    <h3 className="vx-ud-section-title">Definition:</h3>
                    <p className="vx-ud-definition-text">{currentDefinition.definition}</p>
                </div>
                <div className="vx-ud-example-section">
                    <h3 className="vx-ud-section-title">Example:</h3>
                    <p className="vx-ud-example-text">{currentDefinition.example}</p>
                </div>

                <div className="vx-ud-metadata-container" style={{ position: "relative", paddingBottom: "50px" }}>
                    <div className="vx-ud-metadata" style={{
                        position: "absolute",
                        bottom: "0",
                        width: "100%"
                    }}>
                        <div className="vx-ud-metadata-item">👍 {currentDefinition.thumbs_up}</div>
                        <div className="vx-ud-metadata-item">👎 {currentDefinition.thumbs_down}</div>
                        <div className="vx-ud-metadata-item">by {currentDefinition.author}</div>
                        <div className="vx-ud-metadata-item">
                            {new Date(currentDefinition.written_on).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </ModalComponents.Content>
            <ModalComponents.Footer>
                <Flex align={Flex.Align.CENTER} gap={376}>
                    <Button onClick={handlePrevious}>
                        Previous
                    </Button>
                    <Button onClick={handleNext}>
                        Next
                    </Button>
                </Flex>
            </ModalComponents.Footer>
        </>
    );

};

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    styler,
    start(signal: AbortSignal) {
    },
    menus: {
        "message"(a, ctx) {
            ctx.props.children.push(
                <MenuComponents.Item
                    id="vx-ub-button"
                    action={() => {
                        const selectedText = window.getSelection().toString()
                        openModal((props) => (
                            <ModalComponents.Root {...props} size={ModalComponents.Size.MEDIUM}>
                                <UrbanDictionary
                                    props={props}
                                    word={selectedText}
                                    onClose={props.onClose}
                                />
                            </ModalComponents.Root>
                        ));
                    }}
                    label="Urban Dictionary"
                />
            );
        }
    }
});