import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { z } from 'zod';

import type { createCourseSchema, updateCourseSchema } from '@/features/course/schemas';
import type { PrismaLike } from '@/features/course/server/repositories/types';

type CreateCourseInput = z.infer<typeof createCourseSchema>;
type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export async function createCourse(
    prisma: PrismaLike,
    data: Omit<CreateCourseInput, 'userId'>,
    userId: string,
    organizationId: string
) {
    const slug =
        data.slug ||
        data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

    const existingCourse = await prisma.course.findUnique({
        where: {
            userId_slug: {
                slug,
                userId
            }
        }
    });

    if (existingCourse) {
        throw new Error('A course with this name already exists.');
    }

    return prisma.course.create({
        data: {
            category: data.category ?? null,
            description: data.description ?? null,
            duration: data.duration ?? null,
            fileKey: data.fileKey ?? null,
            introVideoGuid: data.introVideoGuid ?? null,
            introVideoUrl: data.introVideoUrl ?? null,
            level: data.level ?? null,
            organizationId,
            price: data.price ?? null,
            shortDescription: data.shortDescription ?? null,
            slug,
            status: data.status,
            title: data.title,
            userId
        }
    });
}

export async function updateCourse(prisma: PrismaLike, data: UpdateCourseInput, userId: string, memberRole: string) {
    const existingCourse = await prisma.course.findUnique({
        where: { id: data.id }
    });

    if (!existingCourse) {
        throw new Error('Course not found');
    }

    if (existingCourse.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager') {
        throw new Error('You do not have permission to update this course.');
    }

    let slug = data.slug;
    if (slug) {
        slug = slug
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    } else if (data.title) {
        slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    if (slug) {
        const existingSlugCourse = await prisma.course.findUnique({
            where: {
                userId_slug: {
                    slug,
                    userId
                }
            }
        });

        if (existingSlugCourse && existingSlugCourse.id !== data.id) {
            throw new Error('A course with this title already exists.');
        }
    }

    return prisma.course.update({
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
            ...(data.fileKey !== undefined && { fileKey: data.fileKey }),
            ...(data.category !== undefined && { category: data.category }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.duration !== undefined && { duration: data.duration }),
            ...(data.level !== undefined && { level: data.level }),
            ...(data.status !== undefined && { status: data.status }),
            ...(slug && { slug })
        },
        where: { id: data.id }
    });
}
