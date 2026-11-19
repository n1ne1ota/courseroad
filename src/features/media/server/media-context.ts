import 'server-only';

import { z } from 'zod';

import type { MediaContext } from '@/lib/media/storage-layout';

import { AccessError } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/**
 * Shape check only. `z.uuid()` also enforces RFC version and variant bits, which rejects perfectly valid Postgres uuids
 * such as seed data, and adds nothing: the database lookup below is the real authority. Lowercased so one entity
 * always maps to one storage folder.
 */
const optionalId = z.preprocess(
    value => (value === '' || value === null ? undefined : value),
    z
        .string()
        .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        .transform(id => id.toLowerCase())
        .optional()
);

type Tenant = { userId: string; organizationId: string | null };

/** A row belongs to the caller's tenant: their own platform content, or the organization they are acting in. */
function inTenant(row: { userId: string; organizationId: string | null }, tenant: Tenant) {
    return row.organizationId
        ? row.organizationId === tenant.organizationId
        : !tenant.organizationId && row.userId === tenant.userId;
}

/**
 * Validate the course, lesson and quiz an upload says it belongs to. IDs come from the browser, so each one is
 * checked against the database and the caller's tenant before it is allowed into a storage path. Missing IDs are
 * fine and fall back to a flat owner folder; an ID that is invalid or not the caller's is rejected.
 */
export async function resolveMediaContext(
    raw: Partial<Record<keyof MediaContext, unknown>>,
    tenant: Tenant
): Promise<MediaContext> {
    const parsed = z.object({ courseId: optionalId, lessonId: optionalId, quizId: optionalId }).safeParse(raw);
    // AccessError only carries 401/403/404; a malformed id is treated as not found.
    if (!parsed.success) throw new AccessError('Invalid course, lesson, or quiz.', 404);
    const { courseId, lessonId, quizId } = parsed.data;
    const context: MediaContext = {};

    if (courseId) {
        const course = await prismaClient.course.findFirst({
            where: { id: courseId },
            select: { organizationId: true, userId: true }
        });
        if (!course || !inTenant(course, tenant)) throw new AccessError('Course not found', 404);
        context.courseId = courseId;
        if (lessonId) {
            const lesson = await prismaClient.lesson.findFirst({
                where: { id: lessonId, module: { courseId } },
                select: { id: true }
            });
            if (!lesson) throw new AccessError('Lesson not found', 404);
            context.lessonId = lessonId;
        }
    }

    if (quizId) {
        const quiz = await prismaClient.quiz.findFirst({
            where: { id: quizId },
            select: { organizationId: true, userId: true }
        });
        if (!quiz || !inTenant(quiz, tenant)) throw new AccessError('Quiz not found', 404);
        context.quizId = quizId;
    }

    return context;
}
