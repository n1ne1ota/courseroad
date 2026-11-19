import 'server-only';

import { AccessError } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Legacy transports omit courseId; resolve it inside the verified URL tenant. */
export async function organizationModule(id: string, organizationId: string) {
    const courseModule = await prismaClient.module.findFirst({
        where: { id, organizationId, course: { organizationId } }
    });
    if (!courseModule) throw new AccessError('Module not found', 404);
    return courseModule;
}

export async function organizationLesson(id: string, organizationId: string) {
    const lesson = await prismaClient.lesson.findFirst({
        where: { id, organizationId, module: { organizationId, course: { organizationId } } },
        include: { module: true }
    });
    if (!lesson) throw new AccessError('Lesson not found', 404);
    return lesson;
}

export function legacyOrderedIds(items: { id: string; position: number }[]) {
    const ordered = [...items].sort((a, b) => a.position - b.position);
    if (
        ordered.some((item, index) => item.position !== index + 1) ||
        new Set(ordered.map(item => item.id)).size !== ordered.length
    )
        throw new Error('Invalid curriculum order');
    return ordered.map(item => item.id);
}

export function savedRecord<T>(value: T | undefined): T {
    if (!value) throw new Error('The saved curriculum record is unavailable');
    return value;
}
