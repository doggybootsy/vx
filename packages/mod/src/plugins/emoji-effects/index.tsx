import { Developers } from "../../constants";
import { getParents } from "../../util";
import { MenuComponents } from "../../api/menu";
import React from "react";
import {definePlugin} from "vx:plugins";

const iterations = 1;

const effects = {
    shake: "shake",
    nod: "nod",
    bounce: "bounce",
    spin: "spin",
    zoom: "zoom",
    flip: "flip",
    big: "big",
    small: "small",
    jitter: "jitter",
    ripple: "ripple",
    explode: "explode",
    rotate360: "rotate360",
    fadeOut: "fadeOut",
    fadeIn: "fadeIn",
    pulse: "pulse",
    wobble: "wobble",
    swing: "swing",
    tada: "tada",
    heartbeat: "heartbeat",
    rainbow: "rainbow",
    glitch: "glitch"
};

function applyEffectToEmoji(emojiElement: HTMLImageElement, effect: keyof typeof effects) {
    const parentElement = emojiElement.parentElement;

    if (!parentElement) return;

    parentElement.style.position = "relative";

    switch (effect) {
        case "shake":
            emojiElement.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "nod":
            emojiElement.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(15deg)' },
                { transform: 'rotate(-15deg)' },
                { transform: 'rotate(0deg)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "bounce":
            emojiElement.animate([
                { transform: 'translateY(0)' },
                { transform: 'translateY(-10px)' },
                { transform: 'translateY(10px)' },
                { transform: 'translateY(0)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "spin":
            emojiElement.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
            ], { duration: 1000, iterations: iterations });
            break;
        case "zoom":
            emojiElement.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.5)' },
                { transform: 'scale(1)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "flip":
            emojiElement.animate([
                { transform: 'rotateY(0deg)' },
                { transform: 'rotateY(180deg)' },
                { transform: 'rotateY(0deg)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "big":
            emojiElement.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(2)' },
                { transform: 'scale(1)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "small":
            emojiElement.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(0.5)' },
                { transform: 'scale(1)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "jitter":
            emojiElement.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "ripple":
            emojiElement.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(0.8)' },
                { transform: 'scale(1)' }
            ], { duration: 500, iterations: iterations });
            break;
        case "explode":
            const particleCount = 20;
            const particles: HTMLDivElement[] = [];

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                const size = Math.random() * 20 + 15;
                particle.style.position = 'absolute';
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = getRandomColor();
                particle.style.borderRadius = '50%';
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.opacity = '0.8';
                particle.style.boxShadow = `0 0 15px rgba(0, 0, 0, 0.1)`;
                particle.style.transform = 'translate(-50%, -50%) scale(0)';
                parentElement.appendChild(particle);
                particles.push(particle);
            }

            emojiElement.animate([
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(1.5)', opacity: 0 }
            ], { duration: 500, iterations: iterations, fill: 'forwards' });

            particles.forEach((particle, index) => {
                const angle = (index / particleCount) * 360;
                const radius = Math.random() * 60 + 80;
                particle.animate([
                    { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.8 },
                    {
                        transform: `translate(calc(-50% + ${Math.cos(angle * Math.PI / 180) * radius}px), 
                                     calc(-50% + ${Math.sin(angle * Math.PI / 180) * radius}px)) scale(1.2)`,
                        opacity: 0
                    }
                ], { duration: 1500, iterations: iterations, fill: 'forwards' });
            });

            setTimeout(() => {
                particles.forEach(particle => parentElement.removeChild(particle));
            }, 1500);
            break;
        case "rotate360":
            emojiElement.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(360deg)' }
            ], { duration: 1000, iterations: iterations });
            break;
        case "fadeOut":
            emojiElement.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], { duration: 1000, iterations: iterations });
            break;
        case "fadeIn":
            emojiElement.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], { duration: 1000, iterations: iterations });
            break;
        case "pulse":
            emojiElement.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.1)' },
                { transform: 'scale(1)' }
            ], { duration: 500, iterations: 3 + iterations });
            break;
        case "wobble":
            emojiElement.animate([
                { transform: 'translateX(0%)' },
                { transform: 'translateX(-25%) rotate(-5deg)' },
                { transform: 'translateX(20%) rotate(3deg)' },
                { transform: 'translateX(-15%) rotate(-3deg)' },
                { transform: 'translateX(10%) rotate(2deg)' },
                { transform: 'translateX(-5%) rotate(-1deg)' },
                { transform: 'translateX(0%)' }
            ], { duration: 1000, iterations: iterations });
            break;
        case "swing":
            emojiElement.animate([
                { transform: 'rotate(0deg)' },
                { transform: 'rotate(15deg)' },
                { transform: 'rotate(-10deg)' },
                { transform: 'rotate(5deg)' },
                { transform: 'rotate(-5deg)' },
                { transform: 'rotate(0deg)' }
            ], { duration: 1000, iterations: iterations });
            break;
        case "tada":
            emojiElement.animate([
                { transform: 'scale(1) rotate(0deg)' },
                { transform: 'scale(0.9) rotate(-3deg)' },
                { transform: 'scale(1.1) rotate(3deg)' },
                { transform: 'scale(1.1) rotate(-3deg)' },
                { transform: 'scale(1.1) rotate(3deg)' },
                { transform: 'scale(1.1) rotate(-3deg)' },
                { transform: 'scale(1) rotate(0deg)' }
            ], { duration: 1000, iterations: iterations });
            break;
        case "heartbeat":
            emojiElement.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.3)' },
                { transform: 'scale(1)' },
                { transform: 'scale(1.3)' },
                { transform: 'scale(1)' }
            ], { duration: 1000, iterations: iterations });
            break;
        case "rainbow":
            emojiElement.animate([
                { filter: 'hue-rotate(0deg)' },
                { filter: 'hue-rotate(360deg)' }
            ], { duration: 2000, iterations: iterations });
            break;
        case "glitch":
            emojiElement.animate([
                { transform: 'translate(0)' },
                { transform: 'translate(2px, 2px)' },
                { transform: 'translate(-2px, -2px)' },
                { transform: 'translate(2px, -2px)' },
                { transform: 'translate(-2px, 2px)' },
                { transform: 'translate(0)' }
            ], { duration: 500, iterations: 2 + iterations });
            break;
        default:
            break;
    }
}

function getRandomColor() {
    const colors = ['#D3D3D3', '#E8E8E8', '#F5F5F5', '#FFFFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    menus: {
        "message"(a, ctx) {
            const emojiElement = a.target.tagName === "IMG" ? (a.target as HTMLImageElement) : getParents(a.target).querySelector<HTMLImageElement>("img") ?? null;

            if (!emojiElement) return;

            ctx.props.children.push(
                <MenuComponents.Item id="emoji-effects" label="Emoji Effects">
                    {Object.keys(effects).map((effect) => (
                        <MenuComponents.Item
                            key={effect}
                            label={effect.charAt(0).toUpperCase() + effect.slice(1)}
                            id={`emoji-effects-${effect}`}
                            action={() => applyEffectToEmoji(emojiElement, effect as keyof typeof effects)}
                        />
                    ))}
                </MenuComponents.Item>
            );
        }
    }
});