import 'server-only';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { detectBot, slidingWindow } from '@arcjet/next';

import type { ImageUploadScope } from '@/lib/constants/image-upload';
import { getRequestIdFromRequest } from '@/lib/utils/request-id';

import { auth } from '@/server/auth/auth';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError } from '@/server/auth/session';
import { logs } from '@/server/logging/server';
import { UploadRouteError, uploadScopedImage } from '@/server/media/image-upload-service';
import arcjet from '@/server/security/security-service';

export async function handleImageUploadRequest(req: NextRequest, scopeOverride?: ImageUploadScope) {
    const startTime = Date.now();
    const requestId = getRequestIdFromRequest(req);

    try {
        logs.upload.info('Image upload request received', {
            action: 'upload_start',
            requestId,
            uploadType: 'image'
        });

        const session = await auth.api.getSession({
            headers: req.headers
        });

        const user = session?.user as { id: string; role?: string } | undefined;
        if (!session || !user) {
            logs.upload.warn('Image upload rejected: Unauthorized', {
                action: 'upload_unauthorized',
                requestId,
                uploadType: 'image'
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = await getOrganizationContext(
            req.headers.get('x-organization-slug') ?? undefined,
            'creator'
        );
        if (!organizationId) {
            logs.upload.warn('Image upload rejected: no active organization', {
                action: 'upload_no_org',
                requestId,
                uploadType: 'image',
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
                logs.upload.warn('Image upload rejected: Rate limit exceeded', {
                    action: 'upload_ratelimit',
                    requestId,
                    uploadType: 'image',
                    userId: user.id
                });
                return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
            }

            logs.upload.warn('Image upload rejected: Forbidden by Arcjet', {
                action: 'upload_arcjet_forbidden',
                requestId,
                uploadType: 'image',
                userId: user.id
            });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const form = await req.formData();
        const file = form.get('file');
        const scope = scopeOverride ?? form.get('scope');

        const result = await uploadScopedImage({
            file: file as File,
            organizationId,
            requestId,
            scope: scope as never,
            userId: user.id
        });

        logs.upload.info('Image upload successful', {
            action: 'upload_success',
            duration: Date.now() - startTime,
            path: result.path,
            requestId,
            scope,
            uploadType: 'image',
            url: result.url,
            userId: user.id
        });

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error.status });
        const duration = Date.now() - startTime;

        if (error instanceof UploadRouteError) {
            if (error.status >= 500) {
                logs.upload.error('Image upload failed', error, {
                    action: 'upload_failed',
                    details: error.details,
                    duration,
                    requestId,
                    uploadType: 'image'
                });
            } else {
                logs.upload.warn('Image upload failed', {
                    action: 'upload_failed',
                    details: error.details,
                    duration,
                    requestId,
                    uploadType: 'image'
                });
            }

            return NextResponse.json(
                {
                    ...(error.details ? { details: error.details } : {}),
                    error: error.message
                },
                { status: error.status }
            );
        }

        logs.upload.error('Image upload error', error, {
            action: 'upload_error',
            duration,
            requestId,
            uploadType: 'image'
        });

        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return handleImageUploadRequest(req);
}
