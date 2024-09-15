import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

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

    const ref = useRef<HTMLDivElement>(null);
    const lastTime = useRef<number | null>(null);
    const lastDelta = useRef(0);

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

    useLayoutEffect(() => {
        if (!lastTime.current) lastTime.current = performance.now();

        let id: number;
        function frame(time: DOMHighResTimeStamp) {
            id = requestAnimationFrame(frame);

            const delta = time - lastTime.current!;

            lastTime.current = time;
            lastDelta.current += delta;
            
            if (!ref.current) return;

            
            ref.current.style.backgroundPositionX = `${Math.ceil(lastDelta.current) / 10}px`;
        }

        id = requestAnimationFrame(frame);

        return () => cancelAnimationFrame(id);
    }, [ ]);

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
            <div style={rainbowStyle} ref={ref}>The cake is a lie</div>
        </div>
    );

    return children;
};

export default RainbowText;
