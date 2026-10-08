import 'server-only';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { detectBot, slidingWindow } from '@arcjet/next';
import { z } from 'zod';

import { getRequestIdFromRequest } from '@/lib/utils/request-id';

import { auth } from '@/server/auth/auth';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError } from '@/server/auth/session';
import { logs } from '@/server/logging/server';
import { createVideo, signTusUpload } from '@/server/media/stream-service';
import arcjet from '@/server/security/security-service';

/**
 * Request payload for creating a Bunny upload session.
 * @typedef {Object} PresignRequest
 * @property {string} [title] - Optional title for the video.
 */

/**
 * Returns TUS headers required to upload directly to Bunny.net.
 * Requires an authenticated user session.
 * Rate limited to 5 requests per minute per user.
 *
 * @param req NextRequest containing optional `title` in JSON body.
 * @returns {Promise<NextResponse>} Details necessary for TUS client (e.g. Uppy) to perform upload.
 * - `200 OK`: { endpoint: string, headers: Record<string, string>, videoId: string }
 * - `401 Unauthorized`: Authentication required
 * - `403 Forbidden`: Arcjet bot protection denied request
 * - `429 Too Many Requests`: Arcjet rate limit exceeded
 * - `500 Internal Server Error`: Bunny API or upload initialization failed
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const requestId = getRequestIdFromRequest(req);

    try {
        // Log presign request start
        logs.upload.info('Video presign request received', {
            action: 'presign_start',
            requestId,
            uploadType: 'video'
        });

        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session) {
            logs.upload.warn('Video presign rejected: Unauthorized', { action: 'presign_unauthorized', requestId });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = await getOrganizationContext(
            req.headers.get('x-organization-slug') ?? undefined,
            'creator'
        );
        if (!organizationId) {
            logs.upload.warn('Video presign rejected: no active organization', {
                action: 'presign_no_org',
                requestId
            });
            return NextResponse.json({ error: 'No active organization' }, { status: 403 });
        }

        const decision = await arcjet
            .withRule(detectBot({ allow: [], mode: 'LIVE' }))
            .withRule(slidingWindow({ interval: '1m', max: 5, mode: 'LIVE' }))
            .protect(req, { fingerprint: session.user.id });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                logs.upload.warn('Video presign rejected: Rate limit exceeded', {
                    action: 'presign_ratelimit',
                    requestId
                });
                return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
            } else {
                logs.upload.warn('Video presign rejected: Forbidden', { action: 'presign_forbidden', requestId });
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const presignSchema = z
            .object({
                title: z.string().optional()
            })
            .strict();

        let title: string | undefined;
        try {
            const body = presignSchema.parse(await req.json());
            title = body.title;
        } catch (err: unknown) {
            const isZodError = err instanceof z.ZodError;
            logs.upload.warn('Video presign rejected: Invalid request payload', {
                action: 'presign_invalid_payload',
                error: isZodError ? err.issues : (err as Error).message,
                requestId
            });
            return NextResponse.json(
                { details: isZodError ? err.issues : undefined, error: 'Invalid request payload' },
                { status: 400 }
            );
        }

        const safeTitle = `[${organizationId}] ${title?.slice(0, 200) || `upload-${Date.now()}`}`;

        logs.upload.info('Video presign processing', {
            action: 'presign_processing',
            originalTitle: title,
            requestId,
            title: safeTitle,
            uploadType: 'video'
        });

        // Create video with timing
        const createVideoStartTime = Date.now();
        const { guid } = await createVideo(safeTitle);
        const createVideoTime = Date.now() - createVideoStartTime;

        logs.upload.info('Video created in Bunny Stream', {
            action: 'video_created',
            performance: {
                createVideoTime
            },
            requestId,
            title: safeTitle,
            uploadType: 'video',
            videoId: guid
        });

        // Generate TUS headers with timing
        const signStartTime = Date.now();
        const headers = signTusUpload(guid);
        const signTime = Date.now() - signStartTime;

        const totalDuration = Date.now() - startTime;

        logs.upload.info('Video presign successful', {
            action: 'presign_success',
            performance: {
                createVideoTime,
                duration: totalDuration,
                signTime
            },
            requestId,
            title: safeTitle,
            uploadType: 'video',
            videoId: guid
        });

        return NextResponse.json({
            endpoint: 'https://video.bunnycdn.com/tusupload',
            headers,
            videoId: guid
        });
    } catch (error) {
        if (error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error.status });
        const totalDuration = Date.now() - startTime;

        logs.upload.error('Video presign error', error, {
            action: 'presign_error',
            performance: {
                duration: totalDuration
            },
            requestId,
            uploadType: 'video'
        });

        return NextResponse.json({ error: 'Failed to initialize upload' }, { status: 500 });
    }
}
