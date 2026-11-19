import 'server-only';

import type { Prisma, PrismaClient } from '@prisma/client';

import { evaluatePublishing, type PublishingCourse } from '@/features/course/lib/publishing';
import { AccessError } from '@/server/auth/session';

export type PublishingActor = { userId: string; organizationId: string | null; privileged: boolean };
export type PublishingTransition = {
    courseId: string;
    expectedStatus: 'Draft' | 'Published';
    operation: 'publish' | 'unpublish';
};

/** Recheck ownership and tenant association inside the transaction, after acquiring the course lock. */
async function readCourse(tx: Prisma.TransactionClient, courseId: string, actor: PublishingActor) {
    const course = await tx.course.findFirst({
        where: {
            id: courseId,
            organizationId: actor.organizationId,
            ...(actor.privileged ? {} : { userId: actor.userId })
        },
        include: {
            _count: { select: { enrollments: true } },
            modules: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } }
        }
    });
    if (!course) throw new AccessError('Course not found', 404);
    if (
        course.modules.some(
            module =>
                module.organizationId !== actor.organizationId ||
                module.lessons.some(lesson => lesson.organizationId !== actor.organizationId)
        )
    )
        throw new AccessError('Curriculum tenant mismatch');
    return course;
}

/** Readiness plus the number of learners already enrolled, shown on the Publish tab. */
function describe(course: PublishingCourse & { _count?: { enrollments: number } }) {
    return { ...evaluatePublishing(course), enrollmentCount: course._count?.enrollments ?? 0 };
}

export async function readPublishing(db: Pick<PrismaClient, '$transaction'>, courseId: string, actor: PublishingActor) {
    return db.$transaction(async tx => {
        await tx.$queryRaw`SELECT "id" FROM "course" WHERE "id" = ${courseId}::uuid FOR UPDATE`;
        return describe(await readCourse(tx, courseId, actor));
    });
}

export type VisibilityChange = { courseId: string; visibility: 'Public' | 'Unlisted' | 'Private' };

/** Visibility is independent of status, so it can change while a course is live, under the same lock. */
export async function updateVisibility(
    db: Pick<PrismaClient, '$transaction'>,
    input: VisibilityChange,
    actor: PublishingActor
) {
    return db.$transaction(
        async tx => {
            await tx.$queryRaw`SELECT "id" FROM "course" WHERE "id" = ${input.courseId}::uuid FOR UPDATE`;
            const course = await readCourse(tx, input.courseId, actor);
            if (course.status === 'Archived') throw new Error('Archived courses are read-only.');
            if (course.visibility === input.visibility) return describe(course);
            const updated = await tx.course.update({
                where: { id: course.id },
                data: { visibility: input.visibility }
            });
            return describe({ ...course, ...updated });
        },
        { maxWait: 10_000, timeout: 20_000 }
    );
}

/** Status changes and readiness validation share the lock used by every curriculum/detail writer. */
export async function transitionPublishing(
    db: Pick<PrismaClient, '$transaction'>,
    input: PublishingTransition,
    actor: PublishingActor
) {
    return db.$transaction(
        async tx => {
            await tx.$queryRaw`SELECT "id" FROM "course" WHERE "id" = ${input.courseId}::uuid FOR UPDATE`;
            const course = await readCourse(tx, input.courseId, actor);
            const target = input.operation === 'publish' ? 'Published' : 'Draft';
            const expected = input.operation === 'publish' ? 'Draft' : 'Published';
            if (course.status === 'Archived' || input.expectedStatus !== expected)
                throw new Error('Course status changed. Refresh before trying again.');
            if (course.status === target) return describe(course);
            if (course.status !== input.expectedStatus)
                throw new Error('Course status changed. Refresh before trying again.');
            const readiness = evaluatePublishing(course);
            if (target === 'Published' && !readiness.canPublish) return describe(course);
            const updated = await tx.course.update({
                where: { id: course.id },
                data: {
                    status: target,
                    ...(target === 'Published' ? { publishedAt: new Date() } : {})
                }
            });
            return describe({ ...course, ...updated });
        },
        { maxWait: 10_000, timeout: 20_000 }
    );
}
