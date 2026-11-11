import 'server-only';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { detectBot, slidingWindow } from '@arcjet/next';

import { getRequestIdFromRequest } from '@/lib/utils/request-id';

import { auth } from '@/server/auth/auth';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError } from '@/server/auth/session';
import { env } from '@/server/config/env';
import { logs } from '@/server/logging/server';
import { assertValidImageFile, UploadRouteError } from '@/server/media/image-upload-service';
import { STORAGE_UPLOAD_URL } from '@/server/media/stream-service';
import arcjet from '@/server/security/security-service';

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const requestId = getRequestIdFromRequest(req);

    try {
        logs.upload.info('Video thumbnail upload request received', {
            action: 'upload_start',
            requestId,
            uploadType: 'video-thumbnail'
        });

        const session = await auth.api.getSession({
            headers: req.headers
        });

        const user = session?.user as { id: string; role?: string } | undefined;
        if (!session || !user) {
            logs.upload.warn('Video thumbnail upload rejected: Unauthorized', {
                action: 'upload_unauthorized',
                requestId,
                uploadType: 'video-thumbnail'
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = await getOrganizationContext(
            req.headers.get('x-organization-slug') ?? undefined,
            'creator'
        );
        if (!organizationId) {
            logs.upload.warn('Video thumbnail upload rejected: no active organization', {
                action: 'upload_no_org',
                requestId,
                uploadType: 'video-thumbnail',
                userId: user.id
            });
            return NextResponse.json({ error: 'No active organization' }, { status: 403 });
        }

        const decision = await arcjet
            .withRule(detectBot({ allow: [], mode: 'LIVE' }))
            .withRule(slidingWindow({ interval: '1m', max: 10, mode: 'LIVE' }))
            .protect(req, { fingerprint: user.id });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                logs.upload.warn('Video thumbnail upload rejected: Rate limit exceeded', {
                    action: 'upload_ratelimit',
                    requestId,
                    uploadType: 'video-thumbnail',
                    userId: user.id
                });
                return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
            }

            logs.upload.warn('Video thumbnail upload rejected: Forbidden by Arcjet', {
                action: 'upload_arcjet_forbidden',
                requestId,
                uploadType: 'video-thumbnail',
                userId: user.id
            });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const form = await req.formData();
        const file = form.get('file');
        const videoId = (form.get('videoId') as string) || '';

        if (!videoId) {
            logs.upload.warn('Video thumbnail upload validation failed: missing videoId', {
                action: 'validation_failed',
                requestId,
                uploadType: 'video-thumbnail',
                userId: user.id
            });
            return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
        }

        assertValidImageFile(file);

        const fileMetadata = {
            name: file.name,
            size: file.size,
            type: file.type || 'unknown',
            videoId
        };

        logs.upload.info('Video thumbnail validated', {
            action: 'file_validated',
            fileMetadata,
            requestId,
            uploadType: 'video-thumbnail',
            userId: user.id
        });

        const path = `${organizationId}/video-thumbnails/${videoId}.jpg`;
        const bufferStartTime = Date.now();
        const buffer = Buffer.from(await file.arrayBuffer());
        const bufferTime = Date.now() - bufferStartTime;

        logs.upload.debug('Video thumbnail buffer conversion complete', {
            action: 'buffer_converted',
            bufferSize: buffer.length,
            performance: {
                bufferTime
            },
            requestId,
            uploadType: 'video-thumbnail',
            userId: user.id
        });

        const target = STORAGE_UPLOAD_URL(path);

        logs.upload.info('Video thumbnail upload to Bunny storage starting', {
            action: 'bunny_upload_start',
            fileMetadata,
            requestId,
            target,
            uploadType: 'video-thumbnail',
            userId: user.id
        });

        const uploadStartTime = Date.now();
        const uploadRes = await fetch(target, {
            body: buffer,
            headers: {
                AccessKey: env.BUNNY_STORAGE_API_KEY,
                'Content-Length': String(buffer.length),
                'Content-Type': file.type
            },
            method: 'PUT'
        });
        const uploadTime = Date.now() - uploadStartTime;

        if (!uploadRes.ok) {
            const text = await uploadRes.text();
            const errorCode = uploadRes.headers.get('Bunny-Storage-Error-Code');
            const bunnyHeaders = Object.fromEntries(uploadRes.headers.entries());
            const error = new Error(`Bunny storage upload failed: ${uploadRes.status}`);

            const totalDuration = Date.now() - startTime;

            logs.upload.error('Bunny storage video thumbnail upload failed', error, {
                action: 'bunny_upload_failed',
                bunnyResponse: {
                    body: text,
                    errorCode,
                    headers: bunnyHeaders,
                    status: uploadRes.status
                },
                fileMetadata,
                path,
                performance: {
                    bufferTime,
                    duration: totalDuration,
                    uploadTime
                },
                requestId,
                uploadType: 'video-thumbnail',
                userId: user.id
            });

            return NextResponse.json(
                {
                    details: {
                        body: text,
                        errorCode,
                        status: uploadRes.status
                    },
                    error: `Bunny storage upload failed: ${uploadRes.status}`
                },
                { status: 502 }
            );
        }

        const url = `${env.NEXT_PUBLIC_BUNNY_STORAGE_CDN}/${path}`;
        const totalDuration = Date.now() - startTime;

        logs.upload.info('Video thumbnail upload successful', {
            action: 'upload_success',
            fileMetadata,
            path,
            performance: {
                bufferTime,
                duration: totalDuration,
                uploadTime
            },
            requestId,
            uploadType: 'video-thumbnail',
            url,
            userId: user.id
        });

        return NextResponse.json({
            fileName: file.name,
            fileSize: file.size,
            path,
            url
        });
    } catch (error) {
        if (error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error.status });
        const totalDuration = Date.now() - startTime;

        if (error instanceof UploadRouteError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }

        logs.upload.error('Video thumbnail upload error', error, {
            action: 'upload_error',
            performance: {
                duration: totalDuration
            },
            requestId,
            uploadType: 'video-thumbnail'
        });

        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
