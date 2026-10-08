'use client';

import { useEffect, useRef } from 'react';

interface SpringConfig {
    damping?: number;
    mass?: number;
    stiffness?: number;
}

/**
 * A highly performant custom hook that tracks scroll velocity
 * and applies a Framer Motion-style spring physics system completely from scratch.
 * Operates purely outside the React render cycle via refs and requestAnimationFrame.
 */
export function useSpringInertia(config?: SpringConfig) {
    const ref = useRef<HTMLDivElement>(null);

    // Physics Config
    const stiffness = config?.stiffness ?? 60;
    const damping = config?.damping ?? 15;
    const mass = config?.mass ?? 1.5;

    useEffect(() => {
        if (!ref.current) return;

        const el = ref.current;

        // State variables
        let lastScrollY = window.scrollY;
        let lastTime = performance.now();
        let currentVelocity = 0; // px / ms

        // Spring simulated state
        let currentY = 0;
        let springVelocityY = 0;
        let targetY = 0;

        let animationFrameId: number;

        const mapVelocityToTarget = (scrollVel: number) => {
            // Replicating: useTransform(scrollVelocity, [-1500, -300, 0, 300, 1500], [30, 15, 0, -15, -30]);
            // Velocity is typically in pixels / second.
            // We will clamp and map it.
            const v = Math.max(-1500, Math.min(1500, scrollVel));

            if (v < -300) {
                return 30 - ((v + 1500) / 1200) * 15; // Maps [-1500, -300] to [30, 15]
            } else if (v < 0) {
                return 15 - ((v + 300) / 300) * 15; // Maps [-300, 0] to [15, 0]
            } else if (v < 300) {
                return 0 - (v / 300) * 15; // Maps [0, 300] to [0, -15]
            } else {
                return -15 - ((v - 300) / 1200) * 15; // Maps [300, 1500] to [-15, -30]
            }
        };

        const loop = (time: DOMHighResTimeStamp) => {
            const dt = Math.min((time - lastTime) / 1000, 0.1); // in seconds, capped at 100ms
            lastTime = time;

            // 1. Calculate actual scroll velocity
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY;

            // Update target based on velocity, but gradually decay it if scrolling stops
            if (dt > 0) {
                currentVelocity = scrollDelta / dt;
            }

            // Decay velocity exponentially when scrolling stops
            currentVelocity *= 0.8;

            targetY = mapVelocityToTarget(currentVelocity);
            lastScrollY = currentScrollY;

            // 2. Spring Physics Step (Euler integration)
            const springForce = -stiffness * (currentY - targetY);
            const dampingForce = -damping * springVelocityY;
            const acceleration = (springForce + dampingForce) / mass;

            springVelocityY += acceleration * dt;
            currentY += springVelocityY * dt;

            // 3. Apply to DOM bypassing React
            // Using translate3d forces GPU hardware acceleration
            el.style.transform = `translate3d(0px, ${currentY}px, 0px)`;

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [damping, mass, stiffness]);

    return ref;
}
