import 'server-only';

import type { PrismaClient } from '@prisma/client';
/** @internal Repository API; application callers use authorized feature DALs. */
import type { z } from 'zod';

import type { createCourseSchema, updateCourseSchema } from '@/features/course/schemas/course-schemas';
import type { PrismaLike } from '@/features/course/server/db/types';

type CreateCourseInput = z.infer<typeof createCourseSchema>;
type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export async function createCourse(
    prisma: PrismaLike,
    data: Omit<CreateCourseInput, 'userId'>,
    userId: string,
    organizationId: string | null
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
            introVideoFileName: data.introVideoFileName || null,
            introVideoFileSize: data.introVideoFileSize || null,
            introVideoGuid: data.introVideoGuid ?? null,
            introVideoUrl: data.introVideoUrl ?? null,
            level: data.level ?? null,
            organizationId,
            price: data.price ?? null,
            shortDescription: data.shortDescription ?? null,
            slug,
            status: 'Draft',
            title: data.title,
            userId
        }
    });
}

export async function updateCourse(
    prisma: Pick<PrismaClient, '$transaction'>,
    data: UpdateCourseInput,
    userId: string,
    memberRole: string,
    organizationId?: string | null
) {
    if (data.status !== undefined) throw new Error('Use the Publish tab to change course status.');
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT "id" FROM "course" WHERE "id" = ${data.id}::uuid FOR UPDATE`;
        const scope = organizationId !== undefined ? { organizationId } : {};
        const existingCourse = await tx.course.findUnique({
            where: { id: data.id, ...scope }
        });

        if (!existingCourse) {
            throw new Error('Course not found');
        }

        if (existingCourse.userId !== userId && memberRole !== 'owner' && memberRole !== 'manager') {
            throw new Error('You do not have permission to update this course.');
        }
        if (existingCourse.status !== 'Draft') throw new Error('Unpublish this course before editing.');

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
            const existingSlugCourse = await tx.course.findUnique({
                where: {
                    userId_slug: {
                        slug,
                        userId: existingCourse.userId
                    }
                }
            });

            if (existingSlugCourse && existingSlugCourse.id !== data.id) {
                throw new Error('A course with this title already exists.');
            }
        }

        return tx.course.update({
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
                ...(data.fileKey !== undefined && { fileKey: data.fileKey }),
                ...(data.category !== undefined && { category: data.category }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.duration !== undefined && { duration: data.duration }),
                ...(data.level !== undefined && { level: data.level }),
                ...(data.introVideoUrl !== undefined && { introVideoUrl: data.introVideoUrl }),
                ...(data.introVideoGuid !== undefined && { introVideoGuid: data.introVideoGuid }),
                ...(data.introVideoFileName !== undefined && { introVideoFileName: data.introVideoFileName || null }),
                ...(data.introVideoFileSize !== undefined && { introVideoFileSize: data.introVideoFileSize || null }),
                ...(slug && { slug })
            },
            where: { id: data.id, ...scope }
        });
    });
}
