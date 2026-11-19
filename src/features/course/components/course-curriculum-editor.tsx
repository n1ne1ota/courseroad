'use client';
import type { JSX, Ref } from 'react';
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, showErrorToast } from '@courseroad/kurume-ui';

import { LayoutListIcon, MousePointerClickIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';

import { CourseLessonEditor } from '@/features/course/components/course-lesson-editor';
import { CourseModuleList } from '@/features/course/components/course-module-list';
import { optimisticCurriculum } from '@/features/course/lib/curriculum-order';

import type { OrganizationCurriculumInput } from '@/features/course/schemas/curriculum-schemas';
import type { Lesson } from '@/features/course/types/course-types';
import type {
  CurriculumActions,
  CurriculumModule,
  LessonEditorHandle,
  LessonEdits
} from '@/features/course/types/curriculum-types';

const VIDEO_POLL_MS = 5000;
/** Stop asking after this long so a video the provider lost cannot poll forever. */
const VIDEO_POLL_LIMIT_MS = 15 * 60 * 1000;

interface CourseCurriculumProps {
  courseId: string;
  modules: CurriculumModule[];
  actions: CurriculumActions;
  scope: 'platform' | 'organization';
  readOnly: boolean;
  onDirtyChange: (dirty: boolean) => void;
  ref?: Ref<LessonEditorHandle>;
}
export function CourseCurriculumEditor({
  courseId,
  modules: initialModules,
  actions,
  scope,
  readOnly,
  onDirtyChange,
  ref
}: CourseCurriculumProps): JSX.Element {
  const [modules, setModules] = useState(initialModules);
  const currentModules = useRef(initialModules);
  const [lessonId, setLessonId] = useQueryState('lessonId');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [lessonDirty, setLessonDirty] = useState(false);
  const editor = useRef<LessonEditorHandle>(null);
  const flush = useCallback(() => editor.current?.flush() ?? Promise.resolve(true), []);
  useImperativeHandle(ref, () => ({ flush: async () => !pending.current && (await flush()) }), [flush]);
  useEffect(() => {
    onDirtyChange(lessonDirty || busy);
  }, [lessonDirty, busy, onDirtyChange]);

  const replaceModules = (next: CurriculumModule[]) => {
    currentModules.current = next;
    setModules(next);
  };
  const { syncVideoStatuses } = actions;
  // A video's encode state is settled by the provider after upload; ask until every lesson has one.
  const awaitingVideo = modules.some(module =>
    module.lessons.some(lesson => lesson.videoUrl && lesson.videoStatus === 'Processing')
  );
  useEffect(() => {
    if (!awaitingVideo || !syncVideoStatuses) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();
    const poll = async () => {
      if (cancelled || Date.now() - startedAt > VIDEO_POLL_LIMIT_MS) return;
      // Skip while a curriculum change is in flight; its response replaces the modules wholesale.
      if (!pending.current) {
        try {
          const result = await syncVideoStatuses(courseId);
          if (!cancelled && result.success && result.data) {
            const statuses = new Map(result.data.statuses.map(row => [row.id, row.videoStatus]));
            let changed = false;
            // Patch only the status onto whatever is current, so a concurrent edit is never overwritten.
            const next = currentModules.current.map(module => ({
              ...module,
              lessons: module.lessons.map(lesson => {
                const status = statuses.get(lesson.id);
                if (status === undefined || status === lesson.videoStatus) return lesson;
                changed = true;
                return { ...lesson, videoStatus: status };
              })
            }));
            if (changed) replaceModules(next);
          }
        } catch {
          // A failed poll is retried on the next tick.
        }
      }
      if (!cancelled) timer = setTimeout(() => void poll(), VIDEO_POLL_MS);
    };
    timer = setTimeout(() => void poll(), VIDEO_POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [awaitingVideo, courseId, syncVideoStatuses]);
  const activeLesson = modules.flatMap(module => module.lessons).find(lesson => lesson.id === lessonId);
  const selectLesson = async (id: string | null) => {
    if (pending.current || !(await flush())) return;
    await setLessonId(id);
  };
  const run = async (input: OrganizationCurriculumInput) => {
    if (readOnly || pending.current) return false;
    pending.current = true;
    // Confirmation dialogs invoke us inside a transition. Publish the busy flag
    // outside that transition so it does not wait for the request to finish.
    await Promise.resolve();
    setBusy(true);
    let previous = currentModules.current;
    try {
      if (!(await flush())) return false;
      previous = currentModules.current;
      // Keep deletion dialogs mounted while their async confirmation is pending.
      if (input.operation !== 'deleteModule' && input.operation !== 'deleteLesson') {
        replaceModules(optimisticCurriculum(previous, input));
      }
      const result = await actions.execute(input);
      if (!result.success || !result.data) throw new Error(result.error || 'Failed to save curriculum');
      replaceModules(result.data.modules);
      if (input.operation === 'createLesson') {
        // Open the lesson that was just added so it can be named and filled in straight away.
        const before = new Set(previous.flatMap(module => module.lessons.map(lesson => lesson.id)));
        const created = result.data.modules
          .find(module => module.id === input.moduleId)
          ?.lessons.find(lesson => !before.has(lesson.id));
        if (created) await setLessonId(created.id);
      }
      if (lessonId && !result.data.modules.some(module => module.lessons.some(lesson => lesson.id === lessonId))) {
        setLessonDirty(false);
        await setLessonId(null);
      }
      return true;
    } catch (cause) {
      replaceModules(previous);
      showErrorToast(cause instanceof Error ? cause.message : 'Failed to save curriculum');
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const saveLesson = async (edits: LessonEdits): Promise<Lesson> => {
    if (!activeLesson || readOnly) throw new Error('Lesson cannot be edited');
    const result = await actions.execute(
      scope === 'platform'
        ? edits.videoGuid !== (activeLesson.videoGuid || '') || edits.videoUrl !== (activeLesson.videoUrl || '')
          ? {
              courseId,
              operation: 'updateLessonVideo',
              lessonId: activeLesson.id,
              title: edits.title,
              description: edits.description,
              videoGuid: edits.videoGuid,
              videoFileName: edits.videoFileName,
              videoFileSize: edits.videoFileSize
            }
          : {
              courseId,
              operation: 'updateLesson',
              lessonId: activeLesson.id,
              title: edits.title,
              description: edits.description
            }
        : { courseId, operation: 'updateLessonMedia', lessonId: activeLesson.id, ...edits }
    );
    if (!result.success || !result.data) throw new Error(result.error || 'Failed to save lesson');
    const saved = result.data.modules.flatMap(module => module.lessons).find(lesson => lesson.id === activeLesson.id);
    if (!saved) throw new Error('Lesson no longer exists');
    return saved;
  };
  const lessonSaved = (lesson: Lesson) =>
    replaceModules(
      currentModules.current.map(module => ({
        ...module,
        lessons: module.lessons.map(row => (row.id === lesson.id ? lesson : row))
      }))
    );

  return (
    <div className='space-y-6' role='region' aria-busy={busy} aria-label='Course curriculum'>
      {readOnly && (
        <p className='rounded-lg border bg-muted/20 p-4' role='status'>
          Curriculum editing is available for draft courses only. This {scope === 'platform' ? 'platform ' : ''}course
          is read-only.
        </p>
      )}
      <div className='grid grid-cols-1 gap-6 2xl-screen:grid-cols-10'>
        <Card className='self-start 2xl-screen:col-span-4'>
          <CardHeader>
            <CardTitle icon={<LayoutListIcon />} iconColor='brand' iconVariant='soft'>
              Curriculum Editor
            </CardTitle>
            <CardDescription>Drag and drop to reorder modules and lessons.</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseModuleList
              activeLessonId={lessonId}
              courseId={courseId}
              disabled={busy || readOnly}
              modules={modules}
              readOnly={readOnly}
              run={run}
              onSelectLesson={selectLesson}
            />
          </CardContent>
        </Card>
        <div className='2xl-screen:col-span-6'>
          {activeLesson ? (
            <CourseLessonEditor
              key={activeLesson.id}
              ref={editor}
              isMovingLesson={busy}
              lesson={activeLesson}
              modules={modules}
              readOnly={readOnly || busy}
              saveLesson={saveLesson}
              scope={scope}
              onDirtyChange={setLessonDirty}
              onLessonChange={lessonSaved}
              onMoveLesson={async (targetModuleId: string) => {
                return await run({
                  courseId,
                  operation: 'moveLesson',
                  lessonId: activeLesson.id,
                  targetModuleId,
                  targetIndex: modules.find(module => module.id === targetModuleId)?.lessons.length ?? 0
                });
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle icon={<MousePointerClickIcon />} iconColor='brand' iconVariant='soft'>
                  No Lesson Selected
                </CardTitle>
                <CardDescription>Select a lesson to start editing.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex h-[400px] items-center justify-center rounded-md border border-dashed bg-muted/20 text-muted-foreground'>
                  Select a lesson from the curriculum
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
