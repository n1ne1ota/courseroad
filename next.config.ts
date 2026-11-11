import path from 'path';

import type { NextConfig } from 'next';
import { z } from 'zod';

const configEnv = z
    .object({
        BUNNY_STORAGE_HOSTNAME: z.string().optional(),
        NEXT_PUBLIC_BUNNY_CDN_HOSTNAME: z.string().optional(),
        NEXT_PUBLIC_BUNNY_STORAGE_CDN: z.string().optional()
    })
    .loose()
    .parse(process.env);

const parseHostname = (value?: string | null) => {
    if (!value) return undefined;

    try {
        return new URL(value.includes('://') ? value : `https://${value}`).hostname;
    } catch (error) {
        console.warn(`Invalid Bunny hostname provided: ${value}`, error);
        return undefined;
    }
};

const bunnyStorageHostname = parseHostname(configEnv.BUNNY_STORAGE_HOSTNAME);
const bunnyStorageCdnHostname = parseHostname(configEnv.NEXT_PUBLIC_BUNNY_STORAGE_CDN);
const bunnyStreamCdnHostname = parseHostname(configEnv.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME);

const bunnyConnectOrigins = new Set<string>([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://video.bunnycdn.com'
]);

if (bunnyStorageHostname) bunnyConnectOrigins.add(`https://${bunnyStorageHostname}`);
if (bunnyStorageCdnHostname) bunnyConnectOrigins.add(`https://${bunnyStorageCdnHostname}`);
if (bunnyStreamCdnHostname) bunnyConnectOrigins.add(`https://${bunnyStreamCdnHostname}`);

const isProduction = process.env.NODE_ENV === 'production';

const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://js.stripe.com",
    "worker-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https:",
    "media-src 'self' blob: data: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    `connect-src 'self' https://api.stripe.com https://accounts.google.com https://oauth2.googleapis.com ${Array.from(bunnyConnectOrigins).join(' ')}`,
    "frame-src 'self' https://iframe.mediadelivery.net https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://github.com",
    "frame-ancestors 'none'",
    // Only upgrade insecure requests in production; in development the app runs
    // on plain HTTP (localhost:3000) and this directive would force the browser
    // to attempt HTTPS, causing NetworkError on every fetch.
    ...(isProduction ? ['upgrade-insecure-requests'] : [])
];

const imageRemotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    {
        hostname: 'lh3.googleusercontent.com',
        protocol: 'https'
    },
    {
        hostname: 'images.unsplash.com',
        protocol: 'https'
    }
];

if (bunnyStorageCdnHostname) {
    imageRemotePatterns.push({
        hostname: bunnyStorageCdnHostname,
        protocol: 'https'
    });
}

const nextConfig: NextConfig = {
    // TypeScript typed routes
    typedRoutes: true,

    // Allow the custom domain dev tunnel origin in development
    allowedDevOrigins: ['dev.courseroad.xyz'],

    // Standalone output for Docker/production — produces a self-contained server.js
    ...(process.env.NEXT_OUTPUT_STANDALONE === '1' || process.env.NODE_ENV === 'production'
        ? { output: 'standalone' as const }
        : {}),

    // Monorepo root — tells Turbopack/file tracing to resolve deps across workspace boundaries
    outputFileTracingRoot: path.join(import.meta.dirname, '../../'),

    // Transpile workspace packages so their deps resolve through apps/web/node_modules
    transpilePackages: ['@courseroad/kurume-ui', '@courseroad/iota-ui'],

    // Expand Turbopack filesystem root to monorepo root for workspace package resolution
    turbopack: {
        root: path.join(import.meta.dirname, '../../')
    },

    // New cached components feature (Next.js 16)
    cacheComponents: true,

    // Dev tools configuration
    devIndicators: {
        position: 'top-right'
    },

    // Experimental features
    experimental: {
        turbopackFileSystemCacheForDev: false,
        serverActions: {
            allowedOrigins: ['dev.courseroad.xyz']
        },
        // Optimize font loading
        optimizePackageImports: [
            '@courseroad/kurume-ui',
            '@courseroad/iota-ui',
            '@dnd-kit/core',
            '@dnd-kit/modifiers',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
            '@heroui/react',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            '@tanstack/react-query',
            '@tanstack/react-table',
            '@tiptap/extensions',
            '@tiptap/pm',
            '@tiptap/react',
            '@tiptap/starter-kit',
            'date-fns',
            'motion',
            'lucide-react',
            'recharts',
            'zod'
        ]
    },

    // Security headers
    async headers() {
        return [
            {
                headers: [
                    // Prevent XSS attacks
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    // Prevent clickjacking
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    // Prevent MIME type sniffing
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    // Referrer policy
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    // Content Security Policy
                    {
                        key: 'Content-Security-Policy',
                        value: cspDirectives.join('; ')
                    }
                ],
                source: '/(.*)'
            }
        ];
    },

    // Image optimization
    images: {
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        formats: ['image/avif', 'image/webp'],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: imageRemotePatterns
    },

    // Compiler options
    compiler: {
        // Keep warnings and errors available for production diagnostics.
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false
    },

    // Logging configuration
    logging: {
        fetches: {
            fullUrl: true
        }
    }
};

export default nextConfig;
