import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { z } from 'zod';

import { getCourseWithCreator } from '@/features/course/server/repositories/orchestrators';
import { getSession } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

export async function getCachedCourse(courseId: string) {
    'use cache';
    cacheLife('hours');
    cacheTag('course-details', `course-${courseId}`);
    if (
        !z
            .string()
            .min(1)
            .max(255)
            .regex(/^[a-zA-Z0-9_-]+$/)
            .safeParse(courseId).success
    )
        return null;

    const course = await getCourseWithCreator(prismaClient, courseId);
    return course
        ? {
              ...course,
              modules: course.modules.map(module => ({
                  id: module.id,
                  title: module.title,
                  lessons: module.lessons.map(lesson => ({
                      id: lesson.id,
                      title: lesson.title,
                      hasVideo: !!lesson.videoUrl
                  }))
              }))
          }
        : null;
}

/** Authorized course projection for EnrollmentSection. */
export async function loadEnrollmentSection({ courseId }: { courseId: string }) {
    const session = await getSession();
    let isEnrolled = false;
    let resumeHref = `/learner/dashboard/learn/${courseId}`;
    if (session?.user) {
        const existing = await prismaClient.enrollment.findUnique({
            where: {
                userId_courseId: {
                    courseId,
                    userId: session.user.id
                }
            }
        });
        if (existing) {
            isEnrolled = true;
            const course = await prismaClient.course.findUnique({
                where: { id: courseId },
                select: { organizationId: true }
            });
            if (course?.organizationId) {
                const org = await prismaClient.organization.findUnique({
                    where: { id: course.organizationId },
                    select: { slug: true }
                });
                if (org) resumeHref = `/organization/${org.slug}/learner/dashboard/learn/${courseId}`;
            }
        }
    }
    return { isEnrolled, resumeHref };
}
