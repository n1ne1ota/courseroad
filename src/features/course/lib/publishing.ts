import type { Course, Lesson, Module } from '@/features/course/types/course-types';

export type PublishingTarget = { tab: 'details'; field: string } | { tab: 'curriculum'; lessonId?: string };
export type PublishingGroup = 'details' | 'pricing' | 'curriculum';
export type PublishingCheck = {
    id: string;
    label: string;
    passed: boolean;
    target: PublishingTarget;
    /** Which part of the editor the check belongs to, so the UI can group the checklist. */
    group: PublishingGroup;
    /** The module or lesson name for curriculum checks, shown instead of the long label. */
    subject?: string;
    /** The module a lesson belongs to. */
    context?: string;
    /** Groups curriculum checks per module, since module titles are not unique. */
    moduleId?: string;
    /** What to do when the check fails, for curriculum rows that only show a name. */
    hint?: string;
};
export type PublishingCourse = Pick<
    Course,
    | 'id'
    | 'title'
    | 'slug'
    | 'status'
    | 'visibility'
    | 'publishedAt'
    | 'description'
    | 'shortDescription'
    | 'fileKey'
    | 'category'
    | 'level'
    | 'price'
    | 'duration'
    | 'introVideoUrl'
    | 'introVideoStatus'
> & {
    modules: (Pick<Module, 'id' | 'title'> & {
        lessons: Pick<Lesson, 'id' | 'title' | 'description' | 'videoUrl' | 'videoStatus'>[];
    })[];
};
export type PublishingReadiness = {
    status: Course['status'];
    visibility: Course['visibility'];
    publishedAt: string | null;
    checks: PublishingCheck[];
    warnings: PublishingCheck[];
    canPublish: boolean;
    /** Filled in by the server read; the pure policy does not know about enrollments. */
    enrollmentCount?: number;
};

/** Ignore empty editor markup and invisible whitespace rather than counting HTML as content. */
export function hasPublishingText(value: string | null | undefined): boolean {
    return Boolean(
        value
            ?.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/&#(x[0-9a-f]+|\d+);/gi, (entity: string, encoded: string) => {
                const code = encoded.toLowerCase().startsWith('x')
                    ? Number.parseInt(encoded.slice(1), 16)
                    : Number.parseInt(encoded, 10);
                return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
            })
            .replace(/&(?:nbsp|ensp|emsp|thinsp|Tab|NewLine|ZeroWidthSpace);/gi, ' ')
            .replace(/[\s\u200b-\u200d\ufeff]/g, '')
    );
}

export function isPublishingVideo(value: string | null | undefined): boolean {
    try {
        return Boolean(value && ['http:', 'https:'].includes(new URL(value).protocol));
    } catch {
        return false;
    }
}

/** Shared, browser-safe policy; publishing always evaluates a fresh database snapshot. */
export function evaluatePublishing(course: PublishingCourse): PublishingReadiness {
    const checks: PublishingCheck[] = [];
    const warnings: PublishingCheck[] = [];
    const detail = (id: string, label: string, passed: boolean, group: PublishingGroup = 'details') =>
        checks.push({
            id,
            label,
            passed,
            group,
            target: { tab: 'details', field: id }
        });
    const validTitle = (title: string, min = 1, max = 100) => title.trim().length >= min && title.length <= max;
    detail('title', 'Course title (3–120 characters)', validTitle(course.title, 3, 120));
    detail('slug', 'Valid course URL slug', /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course.slug));
    detail(
        'short-description',
        'Short description (up to 200 characters)',
        hasPublishingText(course.shortDescription) && (course.shortDescription?.length ?? 0) <= 200
    );
    detail(
        'description',
        'Course description (up to 5,000 characters)',
        hasPublishingText(course.description) && (course.description?.length ?? 0) <= 5000
    );
    detail('fileKey', 'Course thumbnail', Boolean(course.fileKey?.trim()));
    detail('category', 'Course category', Boolean(course.category?.trim()));
    detail('level', 'Difficulty level', ['Beginner', 'Intermediate', 'Advanced'].includes(course.level ?? ''));
    detail(
        'price',
        'Free course (paid publishing is not available yet)',
        course.price === null || course.price === 0,
        'pricing'
    );
    checks.push({
        id: 'modules',
        label: 'At least one module',
        passed: course.modules.length > 0,
        group: 'curriculum',
        target: { tab: 'curriculum' }
    });
    for (const courseModule of course.modules) {
        checks.push({
            id: `module-${courseModule.id}`,
            label: `Module “${courseModule.title}”: valid title and at least one lesson`,
            passed: validTitle(courseModule.title) && courseModule.lessons.length > 0,
            group: 'curriculum',
            subject: courseModule.title,
            moduleId: courseModule.id,
            hint: 'Add a valid title and at least one lesson.',
            target: { tab: 'curriculum' }
        });
        for (const lesson of courseModule.lessons) {
            const target: PublishingTarget = { tab: 'curriculum', lessonId: lesson.id };
            checks.push({
                id: `lesson-${lesson.id}`,
                label: `Lesson “${lesson.title}”: valid title and text or video`,
                passed:
                    validTitle(lesson.title) &&
                    (hasPublishingText(lesson.description) || isPublishingVideo(lesson.videoUrl)),
                group: 'curriculum',
                subject: lesson.title,
                context: courseModule.title,
                moduleId: courseModule.id,
                hint: 'Missing text or video.',
                target
            });
            // Uploaded videos are encoded asynchronously. A failed encode is a broken lesson and blocks
            // publishing; one still encoding only warns. A missing status means a legacy or external URL, which is
            // treated as playable.
            if (isPublishingVideo(lesson.videoUrl) && lesson.videoStatus === 'Failed')
                checks.push({
                    id: `lesson-video-${lesson.id}`,
                    label: `Lesson “${lesson.title}”: video failed to process. Upload it again or remove it.`,
                    passed: false,
                    group: 'curriculum',
                    subject: lesson.title,
                    context: courseModule.title,
                    moduleId: courseModule.id,
                    hint: 'The video failed to process. Upload it again or remove it.',
                    target
                });
            else if (isPublishingVideo(lesson.videoUrl) && lesson.videoStatus === 'Processing')
                warnings.push({
                    id: `video-processing-${lesson.id}`,
                    label: `Lesson “${lesson.title}”: video is still processing. Learners cannot watch it until it finishes.`,
                    passed: false,
                    group: 'curriculum',
                    subject: lesson.title,
                    context: courseModule.title,
                    target
                });
            else if (!isPublishingVideo(lesson.videoUrl))
                warnings.push({
                    id: `video-${lesson.id}`,
                    label: `Lesson “${lesson.title}” has no video; text content is sufficient.`,
                    passed: false,
                    group: 'curriculum',
                    subject: lesson.title,
                    context: courseModule.title,
                    target
                });
        }
    }
    const introTarget: PublishingTarget = { tab: 'details', field: 'intro-video' };
    if (isPublishingVideo(course.introVideoUrl) && course.introVideoStatus === 'Failed')
        checks.push({
            id: 'intro-video',
            label: 'Introductory video failed to process. Upload it again or remove it.',
            passed: false,
            group: 'details',
            target: introTarget
        });
    else if (isPublishingVideo(course.introVideoUrl) && course.introVideoStatus === 'Processing')
        warnings.push({
            id: 'intro-processing',
            label: 'The introductory video is still processing. Learners cannot watch it until it finishes.',
            passed: false,
            group: 'details',
            target: introTarget
        });
    else if (!isPublishingVideo(course.introVideoUrl))
        warnings.push({
            id: 'intro',
            label: 'An introductory video is optional.',
            passed: false,
            group: 'details',
            target: introTarget
        });
    if (!course.duration || course.duration <= 0)
        warnings.push({
            id: 'duration',
            label: 'An estimated duration is optional.',
            passed: false,
            group: 'details',
            target: { tab: 'details', field: 'duration' }
        });
    return {
        status: course.status,
        visibility: course.visibility,
        publishedAt: course.publishedAt?.toISOString() ?? null,
        checks,
        warnings,
        canPublish: course.status === 'Draft' && checks.every(check => check.passed)
    };
}
