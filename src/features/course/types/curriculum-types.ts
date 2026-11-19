import type { CurriculumMutationInput } from '@/features/course/schemas/curriculum-schemas';
import type { Lesson, Module, VideoStatus } from '@/features/course/types/course-types';
import type { ActionState } from '@/types/action.types';

export type CurriculumModule = Module & { lessons: Lesson[] };
export type CurriculumResult = { modules: CurriculumModule[] };
export type VideoStatusResult = { statuses: { id: string; videoStatus: VideoStatus | null }[] };
export type CurriculumActions = {
    execute: (input: CurriculumMutationInput) => Promise<ActionState<CurriculumResult>>;
    /** Settles lessons whose video is still encoding against the provider; omit where status is not tracked. */
    syncVideoStatuses?: (courseId: string) => Promise<ActionState<VideoStatusResult>>;
};
export type LessonEdits = Pick<Lesson, 'title'> & {
    description: string;
    videoUrl: string;
    videoGuid: string;
    /** Display details of the uploaded video. Empty and 0 mean unknown. */
    videoFileName: string;
    videoFileSize: number;
    videoThumbnailUrl: string;
};
export type LessonEditorHandle = { flush: () => Promise<boolean> };
