import type { PublishingCheck, PublishingGroup, PublishingReadiness } from '@/features/course/lib/publishing';

const GROUP_TITLES: Record<PublishingGroup, string> = {
    details: 'Course details',
    pricing: 'Pricing',
    curriculum: 'Curriculum'
};

export type PublishingModuleIssues = {
    /** Module id, or `structure` for checks about the course as a whole. */
    id: string;
    title: string;
    /** Problems with the module itself, such as having no lessons. */
    module: PublishingCheck[];
    lessons: PublishingCheck[];
};

export type PublishingGroupSummary = {
    id: PublishingGroup;
    title: string;
    /** One line that says how the area stands. */
    summary: string;
    total: number;
    passed: number;
    issues: PublishingCheck[];
};

export type PublishingSuggestion = { id: string; label: string; target: PublishingCheck['target']; action: string };

export type PublishingSummary = {
    passed: number;
    total: number;
    remaining: number;
    percent: number;
    modules: number;
    lessons: number;
    groups: PublishingGroupSummary[];
    suggestions: PublishingSuggestion[];
};

const isModule = (check: PublishingCheck) => check.id.startsWith('module-');
const isLesson = (check: PublishingCheck) => check.id.startsWith('lesson-') && !check.id.startsWith('lesson-video-');
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

function describeGroup(id: PublishingGroup, issues: PublishingCheck[]): string {
    if (id === 'details')
        return issues.length
            ? `${plural(issues.length, 'item needs', 'items need')} attention`
            : 'All required information added';
    if (id === 'pricing') return issues.length ? 'Paid publishing is not available yet' : 'Free course';
    if (!issues.length) return 'Every module and lesson is ready';
    const lessons = issues.filter(check => check.id.startsWith('lesson-')).length;
    const others = issues.length - lessons;
    return [
        lessons ? `${plural(lessons, 'lesson needs', 'lessons need')} content` : '',
        others ? `${plural(others, 'module needs', 'modules need')} attention` : ''
    ]
        .filter(Boolean)
        .join(' · ');
}

/** Groups the open curriculum checks per module so a long course stays scannable. */
export function groupCurriculumIssues(issues: PublishingCheck[]): PublishingModuleIssues[] {
    const groups = new Map<string, PublishingModuleIssues>();
    for (const check of issues) {
        const id = check.moduleId ?? 'structure';
        const group = groups.get(id) ?? {
            id,
            title: id === 'structure' ? 'Course structure' : (check.context ?? check.subject ?? 'Module'),
            module: [],
            lessons: []
        };
        (check.id.startsWith('lesson-') ? group.lessons : group.module).push(check);
        groups.set(id, group);
    }
    return [...groups.values()];
}

/** Turns the flat server checklist into the groups, counts and suggestions the Publish tab renders. */
export function summarizePublishing(readiness: Pick<PublishingReadiness, 'checks' | 'warnings'>): PublishingSummary {
    const { checks, warnings } = readiness;
    const passed = checks.filter(check => check.passed).length;
    const groups = (['details', 'pricing', 'curriculum'] as const)
        .map(id => {
            const members = checks.filter(check => check.group === id);
            const issues = members.filter(check => !check.passed);
            return {
                id,
                title: GROUP_TITLES[id],
                summary: describeGroup(id, issues),
                total: members.length,
                passed: members.length - issues.length,
                issues
            };
        })
        .filter(group => group.total > 0);

    // A course with many lessons and no videos would otherwise produce one identical line per lesson.
    const withoutVideo = warnings.filter(
        warning => warning.id.startsWith('video-') && !warning.id.startsWith('video-processing-')
    );
    const suggestions: PublishingSuggestion[] = warnings
        .filter(warning => !withoutVideo.includes(warning))
        .map(warning => ({
            id: warning.id,
            label: warning.label,
            target: warning.target,
            action: warning.id === 'intro' || warning.id === 'duration' ? 'Add' : 'Fix'
        }));
    const [firstWithoutVideo] = withoutVideo;
    if (firstWithoutVideo)
        suggestions.push({
            id: 'lesson-videos',
            label:
                withoutVideo.length === 1
                    ? `Lesson “${firstWithoutVideo.subject ?? ''}” has no video. Text content is enough, but video keeps learners engaged.`
                    : `${withoutVideo.length} lessons have no video. Text content is enough, but video keeps learners engaged.`,
            target: { tab: 'curriculum' },
            action: 'Fix'
        });

    return {
        passed,
        total: checks.length,
        remaining: checks.length - passed,
        percent: checks.length ? Math.round((passed / checks.length) * 100) : 0,
        modules: checks.filter(isModule).length,
        lessons: checks.filter(isLesson).length,
        groups,
        suggestions
    };
}

/** The saved course as learners will meet it, for the student preview. */
export type PublishingSnapshot = {
    title: string;
    shortDescription: string | null;
    description: string | null;
    cover: string | null;
    category: string | null;
    level: string | null;
    price: number | null;
    modules: { id: string; title: string; lessons: { id: string; title: string; hasVideo: boolean }[] }[];
};

export function toPublishingSnapshot(course: {
    title: string;
    shortDescription: string | null;
    description: string | null;
    fileKey: string | null;
    thumbnailFileName: string | null;
    category: string | null;
    level: string | null;
    price: number | null;
    modules: { id: string; title: string; lessons: { id: string; title: string; videoUrl: string | null }[] }[];
}): PublishingSnapshot {
    return {
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        cover: course.fileKey || course.thumbnailFileName,
        category: course.category,
        level: course.level,
        price: course.price,
        modules: course.modules.map(courseModule => ({
            id: courseModule.id,
            title: courseModule.title,
            lessons: courseModule.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                hasVideo: Boolean(lesson.videoUrl)
            }))
        }))
    };
}
