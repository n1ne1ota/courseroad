import 'server-only';

import { NextResponse } from 'next/server';

import crypto from 'node:crypto';

import { z } from 'zod';

import { requirePlaybackAccess } from '@/features/media/server/access';
import { AccessError } from '@/server/auth/session';
import { env } from '@/server/config/env';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }
    try {
        await requirePlaybackAccess(videoId, request.headers.get('x-organization-slug') ?? undefined);
    } catch (error) {
        const status = error instanceof AccessError ? error.status : error instanceof z.ZodError ? 400 : 500;
        return NextResponse.json(
            { error: status === 500 ? 'Unable to authorize playback' : 'Playback unavailable' },
            { status, headers: { 'Cache-Control': 'private, no-store' } }
        );
    }

    if (!env.BUNNY_STREAM_TOKEN_AUTH_KEY) {
        return NextResponse.json({ error: 'Token authentication not configured' }, { status: 500 });
    }

    // Bunny Embed View Token Authentication
    // Format: SHA256_HEX(token_security_key + video_id + expiration)
    // See: https://docs.bunny.net/docs/stream-embed-token-authentication
    const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const expiresStr = String(expires);

    // Concatenate exactly as Bunny expects: key + videoId + expires (as string)
    const tokenInput = env.BUNNY_STREAM_TOKEN_AUTH_KEY + videoId + expiresStr;
    const token = crypto.createHash('sha256').update(tokenInput).digest('hex');

    // Check video status
    let status = 4; // Default to 'Finished' to ensure player tries to load if check fails
    let encodeProgress = 0;
    try {
        const response = await fetch(
            `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_VIDEO_LIBRARY_ID}/videos/${videoId}`,
            {
                headers: {
                    Accept: 'application/json',
                    AccessKey: env.BUNNY_STREAM_API_KEY
                },
                next: { revalidate: 0 } // Don't cache this request
            }
        );

        if (response.ok) {
            const data = await response.json();
            status = data.status;
            encodeProgress = data.encodeProgress;
        } else {
            console.error('Failed to fetch video status:', await response.text());
        }
    } catch (error) {
        console.error('Error checking video status:', error);
    }

    return NextResponse.json(
        {
            encodeProgress,
            expires,
            libraryId: env.BUNNY_STREAM_VIDEO_LIBRARY_ID,
            status,
            token
        },
        { headers: { 'Cache-Control': 'private, no-store' } }
    );
}
