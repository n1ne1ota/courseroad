/**
 * This file serves as the single source of truth for raw hex codes
 * and branding colors used in non-CSS environments (like WebGL/Three.js).
 */
export const COLORS = {
    black: '#000000', // Pure black
    danger: '#ef4444', // Red 500
    dark: '#09090b', // Slate 950
    muted: '#71717a', // Zinc 500
    primary: '#0054ff', // Electric blue
    success: '#22c55e', // Green 500
    warning: '#f59e0b', // Amber 500
    white: '#ffffff' // Pure white
} as const;
