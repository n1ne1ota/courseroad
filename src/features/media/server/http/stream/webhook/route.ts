import 'server-only';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import crypto from 'crypto';

import { z } from 'zod';

import { streamWebhookSchema } from '@/features/media/schemas';
import { env } from '@/server/config/env';
import { prismaClient } from '@/server/db/client';
import { logs } from '@/server/logging/server';

const getDatabaseStatus = (bunnyStatus: number) => {
    switch (bunnyStatus) {
        case 3:
            return 'Ready';
        case 5:
        case 8:
            return 'Failed';
        default:
            return 'Processing';
    }
};

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
        const databaseStatus = getDatabaseStatus(payload.Status);

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

        // Revalidate Next.js cache so creators instantly see the new Ready status
        const pathsToRevalidate = new Set<string>();

        courses.forEach(course => {
            pathsToRevalidate.add(`/organization/${course.organizationId}/courses/${course.id}`);
            pathsToRevalidate.add(`/organization/${course.organizationId}/courses`);
        });

        lessons.forEach(lesson => {
            pathsToRevalidate.add(`/organization/${lesson.organizationId}/courses/${lesson.module.courseId}`);
            pathsToRevalidate.add(
                `/organization/${lesson.organizationId}/courses/${lesson.module.courseId}/lessons/${lesson.id}`
            );
        });

        pathsToRevalidate.forEach(path => revalidatePath(path));

        return NextResponse.json({ ok: true });
    } catch (error) {
        logs.api.error('Bunny webhook error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
