import type { OrganizationCurriculumInput } from '@/features/course/schemas/curriculum-schemas';
import type { CurriculumModule } from '@/features/course/types/curriculum-types';

function orderedRows<T extends { id: string }>(rows: T[], ids: string[]): T[] {
    const ordered = ids.map(id => rows.find(row => row.id === id));
    if (ordered.some(row => row === undefined) || ids.length !== rows.length) return rows;
    return ordered.filter((row): row is T => row !== undefined);
}

/** Immutable optimistic changes; the saved response remains authoritative. */
export function optimisticCurriculum(
    modules: CurriculumModule[],
    input: OrganizationCurriculumInput
): CurriculumModule[] {
    let next = modules.map(module => ({ ...module, lessons: module.lessons.map(lesson => ({ ...lesson })) }));
    switch (input.operation) {
        case 'updateModule':
            next = next.map(module => (module.id === input.moduleId ? { ...module, title: input.title } : module));
            break;
        case 'deleteModule':
            next = next.filter(module => module.id !== input.moduleId);
            break;
        case 'deleteLesson':
            next = next.map(module => ({
                ...module,
                lessons: module.lessons.filter(lesson => lesson.id !== input.lessonId)
            }));
            break;
        case 'reorderModules':
            next = orderedRows(next, input.ids);
            break;
        case 'reorderLessons':
            next = next.map(module =>
                module.id === input.moduleId ? { ...module, lessons: orderedRows(module.lessons, input.ids) } : module
            );
            break;
        case 'moveLesson': {
            const lesson = next.flatMap(module => module.lessons).find(row => row.id === input.lessonId);
            if (!lesson) return modules;
            next = next.map(module => ({ ...module, lessons: module.lessons.filter(row => row.id !== lesson.id) }));
            next.find(module => module.id === input.targetModuleId)?.lessons.splice(input.targetIndex, 0, {
                ...lesson,
                moduleId: input.targetModuleId
            });
            break;
        }
    }
    return next.map((module, index) => ({
        ...module,
        order: index + 1,
        lessons: module.lessons.map((lesson, lessonIndex) => ({ ...lesson, order: lessonIndex + 1 }))
    }));
}
