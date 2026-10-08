import 'server-only';

import { markLessonComplete } from '@/features/course/actions/learning-actions';
import { requireLessonAccess } from '@/features/course/server/access';
import { missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

type LessonPageProps = {
    params: Promise<{ courseId: string; lessonId: string }>;
};
/** Authorized course projection for B2CLessonPage. */
export async function loadB2CLessonPage(props: LessonPageProps) {
    const params = await props.params;
    const { courseId, lessonId } = params;
    const user = await getAuthenticatedUser();
    await requireLessonAccess(courseId, lessonId, undefined);
    const lesson = await prismaClient.lesson.findUnique({
        include: {
            module: {
                include: {
                    course: {
                        include: {
                            modules: {
                                include: {
                                    lessons: { orderBy: { order: 'asc' } }
                                },
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            }
        },
        where: { id: lessonId }
    });
    if (!lesson || lesson.module.courseId !== courseId) missingResource();
    const progress = await prismaClient.userLessonProgress.findUnique({
        where: {
            userId_lessonId: {
                lessonId: lesson.id,
                userId: user.id
            }
        }
    });
    const isCompleted = progress?.isCompleted ?? false;
    const course = lesson.module.course;
    let nextLessonId: string | null = null;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
        const nextLesson = allLessons[currentIdx + 1];
        if (nextLesson) nextLessonId = nextLesson.id;
    }
    const markCompleteAction = async () => {
        'use server';
        await markLessonComplete({ courseId, lessonId });
    };
    return { courseId, lesson, isCompleted, nextLessonId, markCompleteAction };
}
