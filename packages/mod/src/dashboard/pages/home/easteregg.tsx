import React, { useState, useEffect } from 'react';

const SECRET_CODE: string[] = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'a',
    'b',
    'Enter',
];
const RainbowText: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [sequence, setSequence] = useState<string[]>([]);
    const [showMessage, setShowMessage] = useState<boolean>(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setSequence((prevSequence) => {
                const newSequence = [...prevSequence, event.key].slice(-SECRET_CODE.length);
                if (newSequence.join('') === SECRET_CODE.join('')) {
                    setShowMessage(true);
                }
                return newSequence;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const rainbowStyle: React.CSSProperties = {
        fontSize: '2rem',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textAlign: 'center',
    };

    const containerStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };

    if (showMessage) return (
        <div style={containerStyle} onClick={() => {setShowMessage(false); setSequence([])}}>
            <div style={rainbowStyle}>The cake is a lie</div>
        </div>
    );

    return children;
};

export default RainbowText;
