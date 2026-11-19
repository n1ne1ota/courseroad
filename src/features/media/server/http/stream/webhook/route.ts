import 'server-only';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import crypto from 'crypto';

import { z } from 'zod';

import { fromWebhookStatus } from '@/features/media/lib/video-status';
import { streamWebhookSchema } from '@/features/media/schemas/stream-schemas';
import { env } from '@/server/config/env';
import { prismaClient } from '@/server/db/client';
import { logs } from '@/server/logging/server';

/** Platform courses live under /creator; organization courses under /organization/<slug>/<role>. */
const ORGANIZATION_ROLES = ['creator', 'manager', 'owner'] as const;

function coursePaths(organizationSlug: string | null, courseId: string): string[] {
    if (organizationSlug === null) return [`/creator/dashboard/courses/${courseId}`, '/creator/dashboard/courses'];
    return ORGANIZATION_ROLES.flatMap(role => [
        `/organization/${organizationSlug}/${role}/dashboard/courses/${courseId}`,
        `/organization/${organizationSlug}/${role}/dashboard/courses`
    ]);
}

// TODO: Add own auth validation (such as secret header) in Bunny dashboard webhook settings
export async function POST(req: Request) {
    try {
        if (env.BUNNY_WEBHOOK_SECRET) {
            const secret = req.headers.get('x-bunny-secret') || '';

            const expectedHash = crypto.createHash('sha256').update(env.BUNNY_WEBHOOK_SECRET).digest();
            const actualHash = crypto.createHash('sha256').update(secret).digest();

            if (!crypto.timingSafeEqual(expectedHash, actualHash)) {
                logs.api.warn('Unauthorized Bunny webhook attempt');
                return new Response('Unauthorized', { status: 401 });
            }
        }

        let payloadData;
        try {
            payloadData = await req.json();
        } catch {
            logs.api.warn('Malformed JSON in Bunny webhook payload');
            return NextResponse.json({ error: 'Bad Request: Invalid JSON' }, { status: 400 });
        }

        const parseResult = streamWebhookSchema.safeParse(payloadData);

        if (!parseResult.success) {
            logs.api.warn('Invalid Bunny webhook payload format', { errors: z.treeifyError(parseResult.error) });
            return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
        }

        const payload = parseResult.data;
        const databaseStatus = fromWebhookStatus(payload.Status);

        logs.api.info('Video processing webhook received', {
            mappedStatus: databaseStatus,
            status: payload.Status,
            videoGuid: payload.VideoGuid
        });

        // Parallelize updates and lookups for cache revalidation in a safe database transaction
        const [, , courses, lessons] = await prismaClient.$transaction([
            // Update Course intro videos
            prismaClient.course.updateMany({
                data: { introVideoStatus: databaseStatus },
                where: { introVideoGuid: payload.VideoGuid }
            }),
            // Update Lesson videos
            prismaClient.lesson.updateMany({
                data: { videoStatus: databaseStatus },
                where: { videoGuid: payload.VideoGuid }
            }),
            // Find affected courses
            prismaClient.course.findMany({
                select: { id: true, organizationId: true },
                where: { introVideoGuid: payload.VideoGuid }
            }),
            // Find affected lessons
            prismaClient.lesson.findMany({
                select: {
                    id: true,
                    module: { select: { courseId: true } },
                    organizationId: true
                },
                where: { videoGuid: payload.VideoGuid }
            })
        ]);

        // Revalidate the course pages so creators see the new status. Tenants are addressed by slug, not id.
        const affected = [
            ...courses.map(course => ({ courseId: course.id, organizationId: course.organizationId })),
            ...lessons.map(lesson => ({ courseId: lesson.module.courseId, organizationId: lesson.organizationId }))
        ];
        const organizationIds = [...new Set(affected.flatMap(({ organizationId }) => organizationId ?? []))];
        const organizations = organizationIds.length
            ? await prismaClient.organization.findMany({
                  select: { id: true, slug: true },
                  where: { id: { in: organizationIds } }
              })
            : [];
        const slugById = new Map(organizations.map(organization => [organization.id, organization.slug]));

        const pathsToRevalidate = new Set<string>();
        for (const { courseId, organizationId } of affected) {
            if (organizationId === null) {
                coursePaths(null, courseId).forEach(path => pathsToRevalidate.add(path));
                continue;
            }
            const slug = slugById.get(organizationId);
            if (slug) coursePaths(slug, courseId).forEach(path => pathsToRevalidate.add(path));
        }

        pathsToRevalidate.forEach(path => revalidatePath(path));

        return NextResponse.json({ ok: true });
    } catch (error) {
        logs.api.error('Bunny webhook error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
