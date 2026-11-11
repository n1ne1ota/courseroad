declare module 'canvas-confetti' {
    export interface ConfettiOrigin {
        x?: number;
        y?: number;
    }

    export interface ConfettiOptions {
        angle?: number;
        colors?: string[];
        decay?: number;
        drift?: number;
        gravity?: number;
        origin?: ConfettiOrigin;
        particleCount?: number;
        scalar?: number;
        spread?: number;
        startVelocity?: number;
        ticks?: number;
        zIndex?: number;
    }

    const confetti: (options?: ConfettiOptions) => Promise<null> | null;

    export default confetti;
}
