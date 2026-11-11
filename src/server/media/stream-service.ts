import 'server-only';

import crypto from 'node:crypto';

import { env } from '@/server/config/env';

const STREAM_API_BASE = 'https://video.bunnycdn.com';

export type CreateVideoResponse = {
    guid: string; // video id
    title?: string;
};

export async function createVideo(title: string): Promise<CreateVideoResponse> {
    const res = await fetch(`${STREAM_API_BASE}/library/${env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/videos`, {
        body: JSON.stringify({ title }),
        headers: {
            AccessKey: env.BUNNY_STREAM_API_KEY,
            'Content-Type': 'application/json'
        },
        method: 'POST'
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Bunny createVideo failed: ${res.status} ${text}`);
    }
    return (await res.json()) as CreateVideoResponse;
}

export async function getVideo(videoId: string) {
    const res = await fetch(`${STREAM_API_BASE}/library/${env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/videos/${videoId}`, {
        headers: {
            AccessKey: env.BUNNY_STREAM_API_KEY
        }
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch video: ${res.status}`);
    }
    return await res.json();
}

export function signTusUpload(videoId: string) {
    const expires = Math.floor(Date.now() / 1000) + 60 * 30; // 30m
    const stringToSign = `${env.BUNNY_STREAM_VIDEO_LIBRARY_ID}${env.BUNNY_STREAM_API_KEY}${expires}${videoId}`;
    const AuthorizationSignature = crypto.createHash('sha256').update(stringToSign).digest('hex');
    return {
        AuthorizationExpire: String(expires),
        AuthorizationSignature,
        LibraryId: env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
        VideoId: videoId
    } as const;
}

export function getIframeUrl(videoId: string, params: Record<string, string> = {}) {
    const url = new URL(`https://iframe.mediadelivery.net/embed/${env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/${videoId}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return url.toString();
}

export function getHlsUrl(videoId: string, token?: string) {
    const host = env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME;
    const url = new URL(`https://${host}/${videoId}/playlist.m3u8`);
    if (token) url.searchParams.set('token', token);
    return url.toString();
}

export function signPlayback(videoId: string, expiresInSeconds = 60 * 60) {
    if (!env.BUNNY_STREAM_TOKEN_AUTH_KEY) return undefined;
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const path = `/${videoId}`;
    const hash = crypto.createHmac('sha256', env.BUNNY_STREAM_TOKEN_AUTH_KEY).update(`${path}${expires}`).digest('hex');
    const token = `${hash}${expires}`;
    return token;
}

const host = env.BUNNY_STORAGE_HOSTNAME;
const zone = env.BUNNY_STORAGE_ZONE_NAME;

export const STORAGE_UPLOAD_URL = (relativePath: string) =>
    `https://${host}/${zone}/${relativePath.replace(/^\//, '')}`;
