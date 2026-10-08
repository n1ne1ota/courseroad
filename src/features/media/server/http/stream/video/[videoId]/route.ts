import 'server-only';

import { NextResponse } from 'next/server';

import { z } from 'zod';

import { requirePlaybackAccess } from '@/features/media/server/access';
import { AccessError } from '@/server/auth/session';
import { getVideo } from '@/server/media/stream-service';

export async function GET(_request: Request, { params }: { params: Promise<{ videoId: string }> }) {
    try {
        const { videoId } = await params;

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        const preview = await requirePlaybackAccess(videoId, _request.headers.get('x-organization-slug') ?? undefined);
        const video = preview ?? (await getVideo(videoId));

        return NextResponse.json(video, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) {
        if (error instanceof AccessError || error instanceof z.ZodError)
            return NextResponse.json(
                { error: 'Video unavailable' },
                {
                    status: error instanceof AccessError ? error.status : 400,
                    headers: { 'Cache-Control': 'private, no-store' }
                }
            );
        console.error('Failed to fetch video:', error);
        return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
    }
}
